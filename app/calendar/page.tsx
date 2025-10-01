"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Plus, Filter, CalendarIcon, Clock, ArrowLeft, Check } from "lucide-react"
import { TaskTooltip } from "@/components/task-tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Derived events from real backend tasks/projects
type CalendarEvent = {
  id: string
  title: string
  time?: string
  date: string
  createdDate?: string
  type: "task"
  assignee?: { name: string; avatar?: string }
  color: string // tailwind color token, e.g., 'indigo'
  subtasks?: Array<{ id: string; title: string; date: string; time?: string; completed?: boolean }>
  projectId: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
}

function normalizeColor(color?: string) {
  if (!color) return "indigo"
  if (color.startsWith("#")) return "indigo"
  return color
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "day">("month")
  const [filters, setFilters] = useState({
    showMeetings: true,
    showTasks: true,
    showCompleted: true,
    showPending: true,
    assignees: [] as string[],
    projects: [] as string[],
    showApproved: true,
    showPendingApproval: true,
  })
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Array<{ id: string; name: string; color: string }>>([])

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [tasksRes, projectsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/projects'),
        ])
        const tasksJson = await tasksRes.json()
        const projectsJson = await projectsRes.json()
        if (!tasksRes.ok || !tasksJson?.success) throw new Error(tasksJson?.error || 'Failed to fetch tasks')
        if (!projectsRes.ok || !projectsJson?.success) throw new Error(projectsJson?.error || 'Failed to fetch projects')

        const projectColors = new Map<string, string>()
        const projList = (projectsJson.data || []).map((p: any) => ({ id: p.id, name: p.name, color: normalizeColor(p.color) }))
        projList.forEach((p: any) => projectColors.set(p.id, p.color))

        const evts: CalendarEvent[] = (tasksJson.data || []).map((t: any) => {
          const color = projectColors.get(t.projectId) || 'indigo'
          const firstAssignee = (t.assignees && t.assignees[0]) ? { name: t.assignees[0].name, avatar: t.assignees[0].avatar } : undefined
          const subs = (t.subtasks || []).map((st: any) => ({
            id: st.id,
            title: st.title,
            date: st.dueDate || st.startDate || t.dueDate,
            time: undefined as string | undefined,
            completed: !!st.completed,
          }))
          return {
            id: t.id,
            title: t.title,
            date: t.dueDate || t.startDate,
            createdDate: t.createdAt,
            type: 'task',
            assignee: firstAssignee,
            color,
            subtasks: subs,
            projectId: t.projectId,
            approvalStatus: t.approvalStatus,
          }
        })

        if (!abort) {
          setEvents(evts)
          setProjects(projList)
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load calendar')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const allItems: any[] = []

    events.forEach((evt: CalendarEvent) => {
      // تحويل التاريخ إلى YYYY-MM-DD للمقارنة
      const evtDate = evt.date ? evt.date.split("T")[0] : null
      if (evtDate === dateString) {
        allItems.push({ ...evt, isSubtask: false })
      }
      if (evt.subtasks && evt.subtasks.length) {
        evt.subtasks.forEach((sub: { id: string; title: string; date: string; time?: string; completed?: boolean }) => {
          const subDate = sub.date ? sub.date.split("T")[0] : null
          if (subDate === dateString) {
            allItems.push({
              ...sub,
              parentTitle: evt.title,
              parentColor: evt.color,
              assignee: evt.assignee,
              isSubtask: true,
              type: 'task',
            })
          }
        })
      }
    })

    return filterEvents(allItems)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleTaskClick = (item: any) => {
    if (item.type === "task") {
      // Navigate to task detail page
      router.push(`/tasks/${item.id}`)
    } else if (item.type === "meeting") {
      // For meetings, you could navigate to a meeting detail page or show a modal
      console.log("[v0] Meeting clicked:", item.title)
    }
  }

  const toggleFilter = (filterType: keyof typeof filters, value?: string) => {
    if ((filterType === "assignees" || filterType === "projects") && value) {
      setFilters((prev) => ({
        ...prev,
        [filterType]: (prev as any)[filterType].includes(value)
          ? (prev as any)[filterType].filter((v: string) => v !== value)
          : [...(prev as any)[filterType], value],
      }))
      return
    }
    setFilters((prev) => ({
      ...prev,
      [filterType]: !(prev as any)[filterType],
    }))
  }

  const getUniqueAssignees = () => {
    const names = new Set<string>()
    events.forEach((evt) => {
      if (evt.assignee?.name) names.add(evt.assignee.name)
    })
    return Array.from(names)
  }

  const filterEvents = (eventList: any[]) => {
    return eventList.filter((item) => {
      // Filter by type
      if (item.type === "meeting" && !filters.showMeetings) return false
      if (item.type === "task" && !filters.showTasks) return false

      // Filter by approval
      if (item.type === 'task') {
        if (!filters.showApproved && item.approvalStatus === 'approved') return false
        if (!filters.showPendingApproval && item.approvalStatus === 'pending') return false
      }

      // Filter by completion status (for subtasks)
      if (item.completed !== undefined) {
        if (item.completed && !filters.showCompleted) return false
        if (!item.completed && !filters.showPending) return false
      }

      // Filter by assignee
      if (filters.assignees.length > 0) {
        const itemAssignees = []
        if (item.assignee) itemAssignees.push(item.assignee.name)

        if (!itemAssignees.some((name) => filters.assignees.includes(name))) {
          return false
        }
      }

      // Filter by project selection
      if (filters.projects.length > 0) {
        if (!filters.projects.includes(item.projectId)) return false
      }

      return true
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (!filters.showMeetings || !filters.showTasks) count++
    if (!filters.showCompleted || !filters.showPending) count++
    if (!filters.showApproved || !filters.showPendingApproval) count++
    if (filters.assignees.length > 0) count++
    if (filters.projects.length > 0) count++
    return count
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (viewMode === "day" ? navigateDay("prev") : navigateMonth("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-slate-900 min-w-[200px] text-center">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (viewMode === "day" ? navigateDay("next") : navigateMonth("next"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
              <Button variant={viewMode === "day" ? "default" : "outline"} size="sm" onClick={() => setViewMode("day")}>
                Day
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showMeetings}
                  onCheckedChange={() => toggleFilter("showMeetings")}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Meetings
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filters.showTasks} onCheckedChange={() => toggleFilter("showTasks")}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Tasks
                  </div>
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Approval</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showApproved}
                  onCheckedChange={() => toggleFilter('showApproved')}
                >
                  Approved
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.showPendingApproval}
                  onCheckedChange={() => toggleFilter('showPendingApproval')}
                >
                  Pending Approval
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.showCompleted}
                  onCheckedChange={() => toggleFilter("showCompleted")}
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Completed
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.showPending}
                  onCheckedChange={() => toggleFilter("showPending")}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-orange-500" />
                    Pending
                  </div>
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
                {getUniqueAssignees().map((assignee) => (
                  <DropdownMenuCheckboxItem
                    key={assignee}
                    checked={filters.assignees.includes(assignee)}
                    onCheckedChange={() => toggleFilter("assignees", assignee)}
                  >
                    {assignee}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
                {projects.map((p) => (
                  <DropdownMenuCheckboxItem
                    key={p.id}
                    checked={filters.projects.includes(p.id)}
                    onCheckedChange={() => toggleFilter('projects', p.id)}
                  >
                    {p.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={() => router.push("/events/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {viewMode === "month" && (
            <Card>
              <CardContent className="p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
                  {/* Day Headers */}
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-slate-100 p-3 text-center">
                      <span className="text-sm font-medium text-slate-600">{day}</span>
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const isToday = day?.toDateString() === new Date().toDateString()

                    return (
                      <div key={index} className="bg-white p-2 min-h-[120px] relative">
                        {day && (
                          <>
                            <span
                              className={`text-sm font-medium ${
                                isToday
                                  ? "text-indigo-600 bg-indigo-100 w-6 h-6 rounded-full flex items-center justify-center"
                                  : "text-slate-900"
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            <div className="mt-1 space-y-1">
                              {getEventsForDate(day)
                                .slice(0, 3)
                                .map((item) => (
                                  <TaskTooltip key={item.id} task={item}>
                                    <div
                                      className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow ${
                                        item.isSubtask
                                          ? `bg-${item.parentColor}-50 text-${item.parentColor}-600 border-l-2 border-${item.parentColor}-300 pl-2 hover:bg-${item.parentColor}-100`
                                          : `bg-${item.color}-100 text-${item.color}-700 hover:bg-${item.color}-200`
                                      }`}
                                      onClick={() => handleTaskClick(item)}
                                    >
                                      {item.isSubtask ? `↳ ${item.title}` : item.title}
                                    </div>
                                  </TaskTooltip>
                                ))}
                              {getEventsForDate(day).length > 3 && (
                                <div className="text-xs text-slate-500">+{getEventsForDate(day).length - 3} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Week view removed per requirements */}

          {/* Upcoming Events Sidebar */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events & Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filterEvents(events as any)
                  .slice(0, 3)
                  .map((event: any) => (
                    <div key={event.id} className="space-y-2">
                      <TaskTooltip task={event}>
                        <div
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleTaskClick(event)}
                        >
                          <div className={`w-3 h-3 rounded-full bg-${event.color}-500`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{event.title}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Clock className="h-3 w-3" />
                                <span>{event.time || 'All Day'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                            {event.assignee ? (
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={event.assignee.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback className="text-xs">{event.assignee.name[0]}</AvatarFallback>
                              </Avatar>
                            ) : null}
                          </div>
                        </div>
                      </TaskTooltip>

                      {/* Show subtasks */}
                      {event.subtasks && (
                        <div className="ml-6 space-y-1">
                          {filterEvents(
                            event.subtasks.map((subtask: any) => ({
                              ...subtask,
                              parentTitle: event.title,
                              parentColor: event.color,
                              assignee: event.assignee,
                              isSubtask: true,
                              type: "task",
                            })),
                          )
                            .slice(0, 2)
                            .map((subtask: any) => (
                              <TaskTooltip key={subtask.id} task={subtask}>
                                <div
                                  className={`flex items-center gap-2 p-2 rounded text-sm bg-${event.color}-25 border-l-2 border-${event.color}-300 cursor-pointer hover:bg-${event.color}-50 transition-colors`}
                                  onClick={() => handleTaskClick({ ...subtask, type: "task" })}
                                >
                                  <div className={`w-2 h-2 rounded-full bg-${event.color}-400`}></div>
                                  <span className={`text-${event.color}-700 flex-1`}>↳ {subtask.title}</span>
                                  <span className={`text-xs text-${event.color}-600`}>{subtask.date}</span>
                                </div>
                              </TaskTooltip>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
