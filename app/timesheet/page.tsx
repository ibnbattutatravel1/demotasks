"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function TimesheetPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [month, setMonth] = useState<string>(() => sp.get("month") || new Date().toISOString().slice(0, 7))
  const [timesheetId, setTimesheetId] = useState<string>("")
  const [status, setStatus] = useState<"draft" | "submitted" | "approved" | "returned" | "rejected">("draft")
  const [returnComments, setReturnComments] = useState<string | null>(null)
  const [entries, setEntries] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split("-").map(Number)
    return new Date(y, m, 0).getDate()
  }, [month])

  const totalHours = useMemo(() => Object.values(entries).reduce((a, b) => a + (Number(b) || 0), 0), [entries])

  const load = async (m: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/timesheets?month=${encodeURIComponent(m)}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load timesheet")
      const ts = json.data.timesheet
      setTimesheetId(ts.id)
      setStatus(ts.status)
      setReturnComments(ts.returnComments || null)
      const map: Record<string, number> = {}
      for (const e of json.data.entries || []) map[e.date] = Number(e.hours) || 0
      setEntries(map)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(month)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  const handleChangeHours = (date: string, value: string) => {
    const v = Math.max(0, Math.min(24, Number(value)))
    setEntries((prev) => ({ ...prev, [date]: isNaN(v) ? 0 : v }))
  }

  const handleSave = async () => {
    if (!timesheetId) return
    try {
      setSaving(true)
      const list = Array.from({ length: daysInMonth }).map((_, i) => {
        const d = `${month}-${String(i + 1).padStart(2, "0")}`
        const h = Number(entries[d] || 0)
        return { date: d, hours: h }
      })
      const res = await fetch(`/api/timesheets/${encodeURIComponent(timesheetId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: list }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to save")
      toast({ title: "Saved", description: "Timesheet saved as draft." })
      await load(month)
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Could not save", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!timesheetId) return
    try {
      setSaving(true)
      const res = await fetch(`/api/timesheets/${encodeURIComponent(timesheetId)}/submit`, { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to submit")
      toast({ title: "Submitted", description: "Timesheet submitted for approval." })
      await load(month)
    } catch (e: any) {
      toast({ title: "Submit failed", description: e?.message || "Could not submit", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const isEditable = status === "draft" || status === "returned"

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Timesheet</h1>
          <div className="flex items-center gap-3">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-[160px]"
              disabled={loading || saving}
            />
            <Button onClick={() => load(month)} variant="outline" disabled={loading || saving}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Hours</span>
              <span className="text-sm text-slate-600">Status: <span className="font-medium capitalize">{status}</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {returnComments && status === "returned" && (
              <div className="mb-4 p-3 rounded border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                Returned: {returnComments}
              </div>
            )}
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = `${month}-${String(i + 1).padStart(2, "0")}`
                const val = entries[d] || 0
                return (
                  <div key={d} className="border rounded-md p-3 bg-white">
                    <div className="text-xs text-slate-500 mb-2">{d}</div>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={val}
                      onChange={(e) => handleChangeHours(d, e.target.value)}
                      disabled={!isEditable || saving}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">Total hours this month: <span className="font-semibold text-slate-900">{totalHours}</span></div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} variant="outline" disabled={!isEditable || saving}>
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} disabled={!isEditable || saving} className="bg-indigo-600 hover:bg-indigo-700">
                  Submit for Approval
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
