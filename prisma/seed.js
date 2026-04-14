const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    },
  })

  console.log(`✅ Created user: ${user.email}`)

  // Create demo chat session
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: 'Welcome Analysis',
      description: 'Your first analysis session',
      pinned: true,
    },
  })

  console.log(`✅ Created chat session: ${chatSession.title}`)

  // Add demo messages
  await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: 'user',
      content: 'Show me revenue metrics',
    },
  })

  await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: 'assistant',
      content: 'Here are the revenue metrics showing YoY growth of 45%...',
    },
  })

  console.log(`✅ Created demo messages`)

  console.log('✨ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
