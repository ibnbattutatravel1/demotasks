"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { TaskApprovalNotifications } from "@/components/task-approval-notifications"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleBasedLayoutProps {
  children: React.ReactNode
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user && pathname === "/login") {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <p className="text-slate-600">Loading Taskara...</p>
        </div>
      </div>
    )
  }

  if (!user && pathname === "/login") {
    return <>{children}</>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Role-specific notifications */}
      {(user?.role === "user" || user?.role === "admin") && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <TaskApprovalNotifications />
        </div>
      )}

      {children}
    </div>
  )
}
