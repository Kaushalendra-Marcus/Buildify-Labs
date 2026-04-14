'use client'

import { ReactNode } from 'react'
import { useAuthInit } from '@/lib/hooks/useAuthInit'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  // Initialize auth on app load
  useAuthInit()

  return <>{children}</>
}
