"use client"

import { useAuth } from "@/contexts/auth-context"
import { TaskDashboard } from "@/components/task-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserDashboard } from "@/components/user-dashboard"

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user?.role === "admin") {
    return <AdminDashboard />
  }

  if (user?.role === "user") {
    return <UserDashboard />
  }

  // Fallback to original dashboard if no user or unknown role
  return <TaskDashboard />
}
