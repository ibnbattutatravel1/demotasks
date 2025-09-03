"use client"

import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Shield, User } from "lucide-react"

export function RoleSwitcher() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {user.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
      <span className="capitalize">{user.role}</span>
    </Badge>
  )
}
