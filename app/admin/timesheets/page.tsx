"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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

export default function AdminTimesheetsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [status, setStatus] = useState<AdminRow["status"]>("submitted")
  const [rows, setRows] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = async (s: AdminRow["status"]) => {
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
      <div className="border-b bg-white border-slate-200 px-6 py-4">
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
          <div className="flex items-center gap-3">
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
                <option value="submitted">Submitted</option>
                <option value="returned">Returned</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
              {rows.map((r) => (
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
