"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CalendarSearch } from "lucide-react"

type TimesheetRow = {
  id: string
  month: string
  status: "draft" | "submitted" | "approved" | "returned" | "rejected"
  submittedAt?: string
  approvedAt?: string
  returnedAt?: string
  rejectedAt?: string
}

export default function SubmittedTimesheetsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<TimesheetRow["status"] | "all">("submitted")
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<TimesheetRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = async (s: string, q: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("status", s)
      if (q) params.set("q", q)
      const res = await fetch(`/api/timesheets/my?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load timesheets")
      setRows(json.data || [])
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(status, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return String(r.month || "").toLowerCase().includes(q)
  })

  const statusBadge = (s: TimesheetRow["status"]) => {
    if (s === "approved") return <Badge className="bg-emerald-600">approved</Badge>
    if (s === "submitted") return <Badge className="bg-indigo-600">submitted</Badge>
    if (s === "returned") return <Badge variant="secondary">returned</Badge>
    if (s === "rejected") return <Badge variant="destructive">rejected</Badge>
    return <Badge variant="outline">draft</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">Submitted Timesheets</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48">
              <select
                className="w-full h-10 border border-slate-300 rounded-md px-3 bg-white text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="returned">Returned</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="relative">
              <CalendarSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by month (YYYY-MM)"
                className="pl-10 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => load(status, search)} disabled={loading}>Refresh</Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Timesheets ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading && (
                <div className="text-sm text-slate-500">Loading…</div>
              )}
              {!loading && filtered.map((r) => (
                <div key={r.id} className="p-3 bg-white border rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{r.month}</div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      {statusBadge(r.status)}
                      {r.submittedAt && <span>Submitted: {new Date(r.submittedAt).toLocaleString()}</span>}
                      {r.approvedAt && <span>Approved: {new Date(r.approvedAt).toLocaleString()}</span>}
                      {r.returnedAt && <span>Returned: {new Date(r.returnedAt).toLocaleString()}</span>}
                      {r.rejectedAt && <span>Rejected: {new Date(r.rejectedAt).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/timesheet?month=${encodeURIComponent(r.month)}`)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="text-sm text-slate-500">No timesheets found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
