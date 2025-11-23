"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/lib/types"

export type GanttMember = Pick<TeamMember, "id" | "name" | "avatar" | "initials"> & {
  roleLabel?: string
}

export interface GanttItem {
  id: string
  label: string
  startDate: string
  endDate: string
  color?: string
  members?: GanttMember[]
}

interface GanttChartProps {
  items: GanttItem[]
  className?: string
  compact?: boolean
}

function parseDate(value: string | undefined | null): number | null {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : null
}

export function GanttChart({ items, className, compact }: GanttChartProps) {
  if (!items?.length) {
    return (
      <div className={cn("text-xs text-slate-500 italic px-3 py-2", className)}>
        No timeline data to display.
      </div>
    )
  }

  const parsed = items
    .map((item) => {
      const start = parseDate(item.startDate)
      const end = parseDate(item.endDate) ?? start
      if (start == null || end == null) return null
      const normalizedEnd = end <= start ? start + 24 * 60 * 60 * 1000 : end
      return { item, start: start, end: normalizedEnd }
    })
    .filter(Boolean) as { item: GanttItem; start: number; end: number }[]

  if (!parsed.length) {
    return (
      <div className={cn("text-xs text-slate-500 italic px-3 py-2", className)}>
        No valid dates found for Gantt chart.
      </div>
    )
  }

  const minStart = Math.min(...parsed.map((p) => p.start))
  const maxEnd = Math.max(...parsed.map((p) => p.end))
  const span = Math.max(maxEnd - minStart, 1)

  const segments = 4
  const headerTicks = Array.from({ length: segments + 1 }).map((_, idx) => {
    const t = minStart + (span * idx) / segments
    const d = new Date(t)
    return {
      key: idx,
      label: d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }
  })

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[480px] border border-slate-200 rounded-lg bg-white">
        {/* Header timeline */}
        <div className="grid grid-cols-[200px,1fr] border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
          <div className="px-3 py-2 font-medium">Timeline</div>
          <div className="px-3 py-2 flex text-[11px]">
            {headerTicks.map((tick, idx) => (
              <div
                key={tick.key}
                className={cn("flex-1 text-center", idx === 0 && "text-left", idx === headerTicks.length - 1 && "text-right")}
              >
                {tick.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className={cn("divide-y divide-slate-200", compact && "text-xs")}> 
          {parsed.map(({ item, start, end }) => {
            const leftPct = ((start - minStart) / span) * 100
            const widthPct = Math.max(((end - start) / span) * 100, 3)
            const members = item.members || []
            const primaryColor = item.color || "#6366f1"

            return (
              <div key={item.id} className="grid grid-cols-[200px,1fr]">
                {/* Label + members */}
                <div className="px-3 py-2 flex flex-col gap-1 border-r border-slate-200 bg-slate-50/40">
                  <div className="truncate text-sm font-medium text-slate-800" title={item.label}>
                    {item.label}
                  </div>
                  {members.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                      {members.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[11px] font-medium text-slate-700"
                        >
                          {m.initials ? (
                            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                              {m.initials}
                            </span>
                          ) : null}
                          <span className="truncate max-w-[120px]">{m.name}</span>
                        </span>
                      ))}
                      {members.length > 3 && (
                        <span className="text-[11px] text-slate-400">
                          +{members.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bar */}
                <div className="relative px-3 py-3">
                  <div className="relative h-6 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full shadow-sm flex items-center justify-center text-[10px] font-medium text-white"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        background: primaryColor,
                      }}
                      title={`${item.label} (${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()})`}
                    >
                      {!compact && (
                        <span className="px-2 truncate max-w-full">
                          {new Date(start).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          {" - "}
                          {new Date(end).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
