"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, Settings, User, Plus, Inbox, Calendar, BarChart3, FolderPlus } from "lucide-react"
import { useState } from "react"

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const go = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => go("/")} className="flex items-center gap-2 text-slate-900 hover:text-indigo-600">
            <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-semibold">T</span>
            </div>
            <span className="font-semibold">Taskara</span>
          </button>
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" onClick={() => go("/")}>Dashboard</Button>
            <Button variant={pathname?.startsWith("/projects") ? "default" : "ghost"} size="sm" onClick={() => go("/projects")}>Projects</Button>
            <Button variant={pathname?.startsWith("/calendar") ? "default" : "ghost"} size="sm" onClick={() => go("/calendar")}>Calendar</Button>
            <Button variant={pathname?.startsWith("/meetings") ? "default" : "ghost"} size="sm" onClick={() => go("/meetings")}>Meetings</Button>
            <Button variant={pathname?.startsWith("/inbox") ? "default" : "ghost"} size="sm" onClick={() => go("/inbox")}>Inbox</Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" className="hidden sm:inline-flex bg-indigo-500 hover:bg-indigo-600" onClick={() => go("/tasks/new")}> 
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => go("/projects/new")}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => go("/profile")}> 
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => go("/settings")}> 
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); go("/login") }}> 
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="p-4">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="p-3 space-y-2">
                <Button variant={pathname === "/" ? "default" : "ghost"} className="w-full justify-start" onClick={() => go("/")}>Dashboard</Button>
                <Button variant={pathname?.startsWith("/projects") ? "default" : "ghost"} className="w-full justify-start" onClick={() => go("/projects")}>Projects</Button>
                <Button variant={pathname?.startsWith("/calendar") ? "default" : "ghost"} className="w-full justify-start" onClick={() => go("/calendar")}>Calendar</Button>
                <Button variant={pathname?.startsWith("/meetings") ? "default" : "ghost"} className="w-full justify-start" onClick={() => go("/meetings")}>Meetings</Button>
                <Button variant={pathname?.startsWith("/inbox") ? "default" : "ghost"} className="w-full justify-start" onClick={() => go("/inbox")}>Inbox</Button>
              </div>
              <div className="p-3 border-t">
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                  <Inbox className="h-4 w-4" />
                  <span>Quick Actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1" onClick={() => go("/tasks/new")}>New Task</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => go("/projects/new")}>New Project</Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => go("/reports")}>Reports</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

