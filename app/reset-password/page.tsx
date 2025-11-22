"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = search.get('token') || ''
    setToken(t)
  }, [search])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast({ title: 'Invalid link', description: 'Missing token in link', variant: 'destructive' })
      return
    }
    if (!password || password.length < 8) {
      toast({ title: 'Weak password', description: 'Use at least 8 characters', variant: 'destructive' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Please re-type the password', variant: 'destructive' })
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Reset failed')
      }
      toast({ title: 'Password updated', description: 'You can now login with your new password' })
      router.push('/login')
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err.message || 'Please request a new link', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Set Your Password</CardTitle>
            <CardDescription>Enter a new password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">New password</label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" required className="h-11"/>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm" className="text-sm font-medium text-slate-700">Confirm password</label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required className="h-11"/>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 text-white font-medium">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
