"use client"

import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/api/notifications'
import { authService } from '@/lib/api/auth'

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUnreadCount = useCallback(async () => {
    console.log('🔄 [useNotifications] Fetching unread count...')
    
    if (!authService.isAuthenticated()) {
      console.log('❌ [useNotifications] User not authenticated')
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('📡 [useNotifications] Calling API...')

      const response = await notificationService.getUnreadCount()
      console.log('📨 [useNotifications] API Response:', response)
      
      if (response.success && response.data) {
        console.log('✅ [useNotifications] Setting unread count:', response.data.count)
        setUnreadCount(response.data.count)
      } else {
        console.warn('⚠️ [useNotifications] Failed to fetch unread count:', response.message)
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('❌ [useNotifications] Error fetching unread count:', err)
      setError('Gagal mengambil jumlah notifikasi')
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch unread count on mount and when authentication changes
  useEffect(() => {
    fetchUnreadCount()

    // Set up interval to refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Function to manually refresh unread count (useful after marking as read)
  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  return {
    unreadCount,
    loading,
    error,
    refreshUnreadCount
  }
}