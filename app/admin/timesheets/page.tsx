"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, SortDesc, SortAsc, Search } from "lucide-react"
// Using a native <select> for status filter
import { useToast } from "@/hooks/use-toast"

interface AdminRow {
  id: string
  month: string
  status: "submitted" | "returned" | "approved" | "rejected"
  userId: string
  submittedAt?: string
  user?: { id: string; name: string; email: string }
}

type AdminStatusFilter = 'all' | AdminRow["status"]

export default function AdminTimesheetsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [status, setStatus] = useState<AdminStatusFilter>("all")
  const [rows, setRows] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [monthFilter, setMonthFilter] = useState<"all"|"this_month"|"last_month"|"custom">("all")
  const [customMonth, setCustomMonth] = useState("")
  const [needsApprovalOnly, setNeedsApprovalOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<"priority"|"newest"|"oldest">("priority")

  const load = async (s: AdminStatusFilter) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/timesheets?status=${encodeURIComponent(s)}`, { cache: "no-store" })
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
    load(status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const filteredSorted = useMemo(() => {
    const now = new Date()
    const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const currentMonth = ym(now)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth()-1, 1)
    const lastMonth = ym(lastMonthDate)

    const matchesMonth = (m?: string) => {
      if (!m) return monthFilter === "all"
      if (monthFilter === "all") return true
      if (monthFilter === "this_month") return m === currentMonth
      if (monthFilter === "last_month") return m === lastMonth
      if (monthFilter === "custom") return !!customMonth && m === customMonth
      return true
    }

    const matchesApproval = (s: AdminRow["status"]) => {
      if (!needsApprovalOnly) return true
      return s === "submitted" || s === "returned"
    }

    const matchesSearch = (r: AdminRow) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        (r.user?.name || "").toLowerCase().includes(q) ||
        (r.user?.email || "").toLowerCase().includes(q) ||
        (r.month || "").toLowerCase().includes(q)
      )
    }

    const filtered = rows.filter(r => matchesMonth(r.month) && matchesApproval(r.status) && matchesSearch(r))

    const getPriority = (s: AdminRow["status"]) => (s === "submitted" || s === "returned") ? 0 : 1
    const getTime = (t?: string) => t ? new Date(t).getTime() : 0

    const sorted = [...filtered].sort((a,b) => {
      if (sortOrder === "priority") {
        const pa = getPriority(a.status), pb = getPriority(b.status)
        if (pa !== pb) return pa - pb
        return getTime(b.submittedAt) - getTime(a.submittedAt)
      }
      if (sortOrder === "newest") return getTime(b.submittedAt) - getTime(a.submittedAt)
      return getTime(a.submittedAt) - getTime(b.submittedAt)
    })

    return sorted
  }, [rows, searchQuery, monthFilter, customMonth, needsApprovalOnly, sortOrder])

  const handleApprove = async (id: string) => {
    try {
      setActingId(id)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(id)}/approve`, { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to approve")
      toast({ title: "Approved", description: "Timesheet approved." })
      await load(status)
    } catch (e: any) {
      toast({ title: "Approve failed", description: e?.message || "Could not approve", variant: "destructive" })
    } finally {
      setActingId(null)
    }
  }

  const handleReturn = async (id: string) => {
    const comments = window.prompt("Return comments (optional):") || ""
    try {
      setActingId(id)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(id)}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to return")
      toast({ title: "Returned", description: "Timesheet returned to user." })
      await load(status)
    } catch (e: any) {
      toast({ title: "Return failed", description: e?.message || "Could not return", variant: "destructive" })
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = window.prompt("Please provide a rejection reason (required):")
    if (!reason || !reason.trim()) {
      toast({ title: "Rejection cancelled", description: "Rejection reason is required.", variant: "destructive" })
      return
    }
    
    if (!window.confirm(`Are you sure you want to reject this timesheet?\n\nReason: ${reason}`)) return
    
    try {
      setActingId(id)
      const res = await fetch(`/api/admin/timesheets/${encodeURIComponent(id)}/reject`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() })
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to reject")
      toast({ title: "Rejected", description: "Timesheet rejected and user has been notified." })
      await load(status)
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message || "Could not reject", variant: "destructive" })
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">Timesheets Review</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/timesheets/reports')}
            >
              View Reports
            </Button>
            <div className="w-48">
              <select
                className="w-full h-10 border border-slate-300 rounded-md px-3 bg-white text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="returned">Returned</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="w-48">
              <select
                className="w-full h-10 border border-slate-300 rounded-md px-3 bg-white text-sm"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value as any)}
              >
                <option value="all">All Months</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom Month</option>
              </select>
            </div>
            {monthFilter === "custom" && (
              <input
                type="month"
                className="h-10 border border-slate-300 rounded-md px-3 bg-white text-sm"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
              />
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={needsApprovalOnly}
                onChange={(e) => setNeedsApprovalOnly(e.target.checked)}
              />
              Needs Approval Only
            </label>
            <div className="w-40">
              <select
                className="w-full h-10 border border-slate-300 rounded-md px-3 bg-white text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="priority">Priority (Pending first, newest)</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="pl-9 h-10 border border-slate-300 rounded-md px-3 bg-white text-sm w-full"
                placeholder="Search by name, email or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Timesheets ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSorted.map((r) => (
                <div key={r.id} className="p-3 bg-white border rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{r.user?.name || r.userId}</div>
                    <div className="text-xs text-slate-500">{r.user?.email}</div>
                    <div className="text-xs text-slate-600 mt-1">Month: <span className="font-medium">{r.month}</span></div>
                    {r.submittedAt && (
                      <div className="text-xs text-slate-600">Submitted: {new Date(r.submittedAt).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/admin/timesheets/${r.id}`}>View</Link>
                    </Button>
                    {(r.status === "submitted" || r.status === "returned") && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(r.id)} disabled={actingId === r.id}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReturn(r.id)} disabled={actingId === r.id}>
                          Return
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(r.id)} disabled={actingId === r.id}>
                          Reject
                        </Button>
                      </>
                    )}
                    {!(r.status === "submitted" || r.status === "returned") && (
                      <div className="text-xs capitalize text-slate-600">{r.status}</div>
                    )}
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-sm text-slate-500">No timesheets with status "{status}".</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
