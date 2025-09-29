"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Timesheet {
  id: string
  userId: string
  month: string // YYYY-MM
  status: "draft" | "submitted" | "approved" | "returned" | "rejected"
  submittedAt?: string | null
  approvedAt?: string | null
  returnedAt?: string | null
  rejectedAt?: string | null
  returnComments?: string | null
}

interface Entry {
  id: string
  timesheetId: string
  date: string // YYYY-MM-DD
  hours: number
  note?: string | null
}

export default function AdminTimesheetDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || ""

  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  const daysInMonth = useMemo(() => {
    const m = timesheet?.month
    if (!m) return 30
    const [y, mm] = m.split("-").map(Number)
    return new Date(y, mm, 0).getDate()
  }, [timesheet?.month])

  const totalHours = useMemo(() => entries.reduce((s, e) => s + (Number(e.hours) || 0), 0), [entries])

  const load = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/timesheets/${encodeURIComponent(id)}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load timesheet")
      const ts: Timesheet = json.data.timesheet
      setTimesheet(ts)
      setEntries(json.data.entries || [])
      // Load user for display
      try {
        const ures = await fetch(`/api/users/${encodeURIComponent(ts.userId)}`)
        const ujson = await ures.json()
        if (ures.ok && ujson.success) setUser(ujson.data)
      } catch {}
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load timesheet", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleApprove = async () => {
    if (!timesheet) return
    try {
      setActing(true)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(timesheet.id)}/approve`, { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to approve")
      toast({ title: "Approved", description: "Timesheet approved." })
      await load()
    } catch (e: any) {
      toast({ title: "Approve failed", description: e?.message || "Could not approve", variant: "destructive" })
    } finally {
      setActing(false)
    }
  }

  const handleReturn = async () => {
    if (!timesheet) return
    const comments = window.prompt("Return comments (optional):") || ""
    try {
      setActing(true)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(timesheet.id)}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to return")
      toast({ title: "Returned", description: "Timesheet returned to user." })
      await load()
    } catch (e: any) {
      toast({ title: "Return failed", description: e?.message || "Could not return", variant: "destructive" })
    } finally {
      setActing(false)
    }
  }

  const handleReject = async () => {
    if (!timesheet) return
    if (!window.confirm("Are you sure you want to reject this timesheet?")) return
    try {
      setActing(true)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(timesheet.id)}/reject`, { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to reject")
      toast({ title: "Rejected", description: "Timesheet rejected." })
      await load()
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message || "Could not reject", variant: "destructive" })
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-900">Timesheet Details</div>
            <div className="text-xs text-slate-600 mt-1">
              {timesheet && (
                <>
                  <span className="mr-3">Month: <span className="font-medium">{timesheet.month}</span></span>
                  <span className="mr-3">Status: <span className="font-medium capitalize">{timesheet.status}</span></span>
                  {timesheet.submittedAt && (
                    <span>Submitted: {new Date(timesheet.submittedAt).toLocaleString()}</span>
                  )}
                </>
              )}
            </div>
            {user && (
              <div className="text-xs text-slate-600">User: <span className="font-medium">{user.name}</span> <span className="text-slate-500">({user.email})</span></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>
            {(timesheet?.status === "submitted" || timesheet?.status === "returned") && (
              <>
                <Button size="sm" onClick={handleApprove} disabled={acting || loading}>Approve</Button>
                <Button size="sm" variant="outline" onClick={handleReturn} disabled={acting || loading}>Return</Button>
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={acting || loading}>Reject</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Hours</span>
              <span className="text-sm text-slate-600">Total: <span className="font-semibold text-slate-900">{totalHours}</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timesheet?.status === "returned" && timesheet?.returnComments && (
              <div className="mb-4 p-3 rounded border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                Returned: {timesheet.returnComments}
              </div>
            )}

            {/* Render a 7-column grid similar to user page but read-only */}
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : (
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = `${timesheet?.month}-${String(i + 1).padStart(2, "0")}`
                  const dayNumber = i + 1
                  const entry = entries.find((e) => e.date === d)
                  const val = entry ? Number(entry.hours) || 0 : 0
                  return (
                    <div key={d} className="border rounded-md p-3 bg-white">
                      <div className="text-xs font-medium text-slate-600 mb-2">Day {dayNumber}</div>
                      <Input type="number" value={val} readOnly disabled />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
