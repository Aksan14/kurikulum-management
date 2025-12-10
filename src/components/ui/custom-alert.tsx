"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { CheckCircle, AlertCircle, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomAlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function CustomAlert({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: CustomAlertProps) {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsShowing(false)
          setTimeout(onClose, 300) // Wait for animation to complete
        }, autoCloseDelay)
        return () => clearTimeout(timer)
      }
    } else {
      setIsShowing(false)
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose])

  if (!isVisible && !isShowing) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      case 'info':
        return <AlertCircle className="h-6 w-6 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
    }
  }

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      case 'info':
        return 'text-blue-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={cn(
          "relative max-w-md w-full rounded-lg border p-6 shadow-lg transition-all duration-300",
          getBgColor(),
          isShowing ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <button
          onClick={() => {
            setIsShowing(false)
            setTimeout(onClose, 300)
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-lg font-semibold", getTitleColor())}>
              {title}
            </h3>
            <p className={cn("mt-2 text-sm", getMessageColor())}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Alert context for global state management
interface AlertContextType {
  alerts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>
  showAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void
  hideAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>>([])

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString()
    setAlerts(prev => [...prev, { id, type, title, message }])
  }

  const hideAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

// Hook for using alerts
export function useCustomAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useCustomAlert must be used within an AlertProvider')
  }
  return context
}

// AlertContainer component
export function AlertContainer() {
  const { alerts, hideAlert } = useCustomAlert()

  return (
    <>
      {alerts.map(alert => (
        <CustomAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isVisible={true}
          onClose={() => hideAlert(alert.id)}
        />
      ))}
    </>
  )
}