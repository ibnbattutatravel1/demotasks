"use client"

import { useState } from "react"
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

const events = [
  {
    id: 1,
    title: "Design Review Meeting",
    time: "09:00 - 10:00",
    date: "2024-01-15",
    type: "meeting",
    attendees: [
      { name: "Alice", avatar: "/diverse-woman-portrait.png" },
      { name: "Bob", avatar: "/thoughtful-man.png" },
    ],
    color: "indigo",
  },
  {
    id: 2,
    title: "API Integration Testing",
    time: "14:00 - 16:00",
    date: "2024-01-15",
    createdDate: "2024-01-10",
    type: "task",
    assignee: { name: "Charlie", avatar: "/developer-working.png" },
    color: "emerald",
    subtasks: [
      {
        id: "2-1",
        title: "Setup test environment",
        date: "2024-01-12",
        time: "10:00 - 12:00",
        completed: true,
      },
      {
        id: "2-2",
        title: "Write integration tests",
        date: "2024-01-14",
        time: "14:00 - 16:00",
        completed: false,
      },
    ],
  },
  {
    id: 3,
    title: "Sprint Planning",
    time: "10:00 - 11:30",
    date: "2024-01-16",
    type: "meeting",
    attendees: [
      { name: "Diana", avatar: "/diverse-team-manager.png" },
      { name: "Eve", avatar: "/professional-woman.png" },
      { name: "Alice", avatar: "/diverse-woman-portrait.png" },
    ],
    color: "blue",
  },
  {
    id: 4,
    title: "Code Review Session",
    time: "15:00 - 16:00",
    date: "2024-01-17",
    createdDate: "2024-01-12",
    type: "task",
    assignee: { name: "Bob", avatar: "/thoughtful-man.png" },
    color: "purple",
    subtasks: [
      {
        id: "4-1",
        title: "Review authentication module",
        date: "2024-01-16",
        time: "09:00 - 11:00",
        completed: false,
      },
      {
        id: "4-2",
        title: "Review API endpoints",
        date: "2024-01-17",
        time: "13:00 - 15:00",
        completed: false,
      },
    ],
  },
  {
    id: 5,
    title: "Database Migration",
    time: "All Day",
    date: "2024-01-20",
    createdDate: "2024-01-14",
    type: "task",
    assignee: { name: "Alice", avatar: "/diverse-woman-portrait.png" },
    color: "red",
    subtasks: [
      {
        id: "5-1",
        title: "Backup current database",
        date: "2024-01-18",
        time: "08:00 - 09:00",
        completed: false,
      },
      {
        id: "5-2",
        title: "Run migration scripts",
        date: "2024-01-19",
        time: "10:00 - 14:00",
        completed: false,
      },
      {
        id: "5-3",
        title: "Verify data integrity",
        date: "2024-01-20",
        time: "15:00 - 17:00",
        completed: false,
      },
    ],
  },
]

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
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)) // January 15, 2024
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filters, setFilters] = useState({
    showMeetings: true,
    showTasks: true,
    showCompleted: true,
    showPending: true,
    assignees: [] as string[],
  })
  const router = useRouter()

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
    const allItems = []

    // Add main events/tasks
    events.forEach((event) => {
      if (event.date === dateString) {
        allItems.push({ ...event, isSubtask: false })
      }

      // Add subtasks
      if (event.subtasks) {
        event.subtasks.forEach((subtask) => {
          if (subtask.date === dateString) {
            allItems.push({
              ...subtask,
              parentTitle: event.title,
              parentColor: event.color,
              assignee: event.assignee,
              isSubtask: true,
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

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
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
    if (filterType === "assignees" && value) {
      setFilters((prev) => ({
        ...prev,
        assignees: prev.assignees.includes(value)
          ? prev.assignees.filter((a) => a !== value)
          : [...prev.assignees, value],
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: !prev[filterType],
      }))
    }
  }

  const getUniqueAssignees = () => {
    const assignees = new Set<string>()
    events.forEach((event) => {
      if (event.assignee) assignees.add(event.assignee.name)
      if (event.attendees) {
        event.attendees.forEach((attendee) => assignees.add(attendee.name))
      }
    })
    return Array.from(assignees)
  }

  const filterEvents = (eventList: any[]) => {
    return eventList.filter((item) => {
      // Filter by type
      if (item.type === "meeting" && !filters.showMeetings) return false
      if (item.type === "task" && !filters.showTasks) return false

      // Filter by completion status (for subtasks)
      if (item.completed !== undefined) {
        if (item.completed && !filters.showCompleted) return false
        if (!item.completed && !filters.showPending) return false
      }

      // Filter by assignee
      if (filters.assignees.length > 0) {
        const itemAssignees = []
        if (item.assignee) itemAssignees.push(item.assignee.name)
        if (item.attendees) {
          item.attendees.forEach((attendee: any) => itemAssignees.push(attendee.name))
        }

        if (!itemAssignees.some((name) => filters.assignees.includes(name))) {
          return false
        }
      }

      return true
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (!filters.showMeetings || !filters.showTasks) count++
    if (!filters.showCompleted || !filters.showPending) count++
    if (filters.assignees.length > 0) count++
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
                onClick={() => (viewMode === "week" ? navigateWeek("prev") : navigateMonth("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-slate-900 min-w-[200px] text-center">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (viewMode === "week" ? navigateWeek("next") : navigateMonth("next"))}
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
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Week
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
              <DropdownMenuContent align="end" className="w-56">
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

          {viewMode === "week" && (
            <div className="grid grid-cols-8 gap-4">
              {/* Time Column */}
              <div className="space-y-4">
                <div className="h-12"></div> {/* Header spacer */}
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-16 flex items-start">
                    <span className="text-sm text-slate-500">{String(9 + i).padStart(2, "0")}:00</span>
                  </div>
                ))}
              </div>

              {/* Week Days */}
              {getWeekDays(currentDate).map((day, dayIndex) => {
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div key={dayIndex} className="space-y-4">
                    {/* Day Header */}
                    <div className="h-12 flex flex-col items-center justify-center border-b border-slate-200">
                      <span className="text-sm font-medium text-slate-600">{daysOfWeek[day.getDay()]}</span>
                      <span
                        className={`text-lg font-semibold ${
                          isToday
                            ? "text-indigo-600 bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center"
                            : "text-slate-900"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-4 relative">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="h-16 border-b border-slate-100"></div>
                      ))}

                      {getEventsForDate(day).map((item, itemIndex) => {
                        const startHour = item.time ? Number.parseInt(item.time.split(":")[0]) : 9
                        const color = item.isSubtask ? item.parentColor : item.color

                        return (
                          <TaskTooltip key={item.id} task={item}>
                            <Card
                              className={`absolute left-0 right-0 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                                item.isSubtask
                                  ? `bg-${color}-25 border-${color}-200 border-l-4 border-l-${color}-400 hover:bg-${color}-50`
                                  : `bg-${color}-50 border-${color}-200 hover:bg-${color}-100`
                              }`}
                              style={{
                                top: `${(startHour - 9) * 64 + 16 + (item.isSubtask ? itemIndex * 4 : 0)}px`,
                                height: item.isSubtask ? "40px" : "48px",
                                zIndex: item.isSubtask ? 1 : 2,
                              }}
                              onClick={() => handleTaskClick(item)}
                            >
                              <CardContent className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-medium truncate ${
                                        item.isSubtask ? `text-xs text-${color}-800` : `text-sm text-${color}-900`
                                      }`}
                                    >
                                      {item.isSubtask ? `↳ ${item.title}` : item.title}
                                    </p>
                                    <p className={`text-xs text-${color}-700`}>{item.time}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TaskTooltip>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upcoming Events Sidebar */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events & Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filterEvents(events)
                  .slice(0, 3)
                  .map((event) => (
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
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                            {event.type === "meeting" && event.attendees ? (
                              event.attendees.slice(0, 3).map((attendee, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{attendee.name[0]}</AvatarFallback>
                                </Avatar>
                              ))
                            ) : event.assignee ? (
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={event.assignee.avatar || "/placeholder.svg"} />
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
                            event.subtasks.map((subtask) => ({
                              ...subtask,
                              parentTitle: event.title,
                              parentColor: event.color,
                              assignee: event.assignee,
                              isSubtask: true,
                              type: "task",
                            })),
                          )
                            .slice(0, 2)
                            .map((subtask) => (
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
