"use client"

import { useAuth } from "@/contexts/auth-context"
import dynamic from "next/dynamic"

// Lazy load heavy dashboards for better performance
const TaskDashboard = dynamic(() => import("@/components/task-dashboard").then(mod => ({ default: mod.TaskDashboard })), {
  loading: () => <div className="h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
})
const AdminDashboard = dynamic(() => import("@/components/admin-dashboard").then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => <div className="h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
})
const UserDashboard = dynamic(() => import("@/components/user-dashboard").then(mod => ({ default: mod.UserDashboard })), {
  loading: () => <div className="h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
})

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
