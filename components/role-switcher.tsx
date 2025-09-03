"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Shield, User } from "lucide-react"

export function RoleSwitcher() {
  const { user, switchRole } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
      <span className="text-sm text-slate-600">Demo Mode:</span>
      <Button
        variant={user.role === "admin" ? "default" : "outline"}
        size="sm"
        onClick={() => switchRole("admin")}
        className="h-8"
      >
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Button>
      <Button
        variant={user.role === "user" ? "default" : "outline"}
        size="sm"
        onClick={() => switchRole("user")}
        className="h-8"
      >
        <User className="w-3 h-3 mr-1" />
        User
      </Button>
    </div>
  )
}
