"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, CheckCircle2, Circle } from "lucide-react"

interface TaskTooltipProps {
  task: any
  children: React.ReactNode
}

export function TaskTooltip({ task, children }: TaskTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const getTaskSummary = () => {
    if (task.type === "meeting") {
      return {
        title: task.title,
        type: "Meeting",
        time: task.time,
        attendees: task.attendees?.length || 0,
        description: `Meeting with ${task.attendees?.map((a: any) => a.name).join(", ") || "team"}`,
      }
    }

    const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
    const totalSubtasks = task.subtasks?.length || 0

    return {
      title: task.title,
      type: "Task",
      time: task.time,
      assignee: task.assignee?.name,
      progress: totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} subtasks completed` : "No subtasks",
      description: task.isSubtask ? `Subtask of: ${task.parentTitle}` : undefined,
    }
  }

  const summary = getTaskSummary()

  return (
    <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-slate-900 text-sm leading-tight">{summary.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {summary.type}
                </Badge>
              </div>

              {summary.description && <p className="text-xs text-slate-600">{summary.description}</p>}

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{summary.time}</span>
                </div>

                {summary.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{summary.assignee}</span>
                  </div>
                )}

                {task.type === "meeting" && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{summary.attendees} attendees</span>
                  </div>
                )}
              </div>

              {task.type === "task" && summary.progress && (
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{summary.progress}</span>
                </div>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <p className="text-xs font-medium text-slate-700 mb-1">Recent Subtasks:</p>
                  <div className="space-y-1">
                    {task.subtasks.slice(0, 2).map((subtask: any) => (
                      <div key={subtask.id} className="flex items-center gap-2 text-xs">
                        {subtask.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-slate-400" />
                        )}
                        <span className={subtask.completed ? "text-slate-500 line-through" : "text-slate-600"}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
