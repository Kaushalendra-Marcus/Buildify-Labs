import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const SALT_ROUNDS = 10
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days ms
const SESSION_COOKIE_AGE = 30 * 24 * 60 * 60     // 30 days seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userPayload(user: {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar:
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`,
    createdAt: user.createdAt.toISOString(),
  }
}

function withSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_AGE,
    path: '/',
  })
  return response
}

// ─── Action Handlers ──────────────────────────────────────────────────────────

async function handleSignup(req: NextRequest): Promise<NextResponse> {
  const { email, password, name } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    },
  })

  const session = await prisma.session.create({
    data: { userId: user.id, expiresAt: new Date(Date.now() + SESSION_MAX_AGE) },
  })

  return withSessionCookie(
    NextResponse.json({ user: userPayload(user), sessionId: session.id }, { status: 201 }),
    session.id
  )
}

async function handleSignin(req: NextRequest): Promise<NextResponse> {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
  }

  const session = await prisma.session.create({
    data: { userId: user.id, expiresAt: new Date(Date.now() + SESSION_MAX_AGE) },
  })

  return withSessionCookie(
    NextResponse.json({ user: userPayload(user), sessionId: session.id }),
    session.id
  )
}

async function handleLogout(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get('sessionId')?.value
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
  }
  const res = NextResponse.json({ message: 'Logged out' })
  res.cookies.delete('sessionId')
  return res
}

async function handleSession(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get('sessionId')?.value
  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    }
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: userPayload(session.user), sessionId })
}

// ─── Next.js 15 Route Exports (params is a Promise) ──────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params

  try {
    switch (action) {
      case 'signup':  return handleSignup(request)
      case 'signin':  return handleSignin(request)
      case 'logout':  return handleLogout(request)
      case 'session': return handleSession(request)
      default:
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
  } catch (error) {
    console.error(`Auth [${action}] error:`, error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params

  try {
    if (action === 'session') return handleSession(request)
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error(`Auth GET [${action}] error:`, error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}