import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const [storageInfo, setStorageInfo] = useState(null)

  useEffect(() => {
    // Check storage info
    checkStorageInfo()

    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
      // Show "back online" message briefly
      setTimeout(() => {
        // Could show a sync notification here
      }, 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkStorageInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usedMB = Math.round(estimate.usage / (1024 * 1024))
        const quotaMB = Math.round(estimate.quota / (1024 * 1024))
        setStorageInfo({ used: usedMB, quota: quotaMB })
      }
    } catch (error) {
      console.log('Storage info not available')
    }
  }

  if (isOnline && !showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm">
      <Card className={`shadow-lg border-2 ${isOnline ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-sm font-medium">
              {isOnline ? 'Back Online' : 'Offline Mode'}
            </span>
            <Badge variant={isOnline ? 'default' : 'secondary'} className="text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                All your data is automatically saved locally. Changes will sync when you're back online.
              </p>
              {storageInfo && (
                <div className="text-xs text-muted-foreground">
                  Local storage: {storageInfo.used}MB / {storageInfo.quota}MB used
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowOfflineMessage(false)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {isOnline && showOfflineMessage && (
            <p className="text-xs text-green-700">
              Connection restored. Your data is syncing...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
