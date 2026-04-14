'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'

export function useAuthInit() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])
}
