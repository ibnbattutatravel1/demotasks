"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Settings, Bell, Globe, Shield, Palette, Save } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      taskReminders: true,
      projectUpdates: true,
    },
    appearance: {
      theme: "light",
      language: "en",
      timezone: "UTC",
    },
    privacy: {
      profileVisibility: "team",
      activityTracking: true,
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" })
        if (res.ok) {
          const json = await res.json()
          if (json?.success && json.data?.notifications) {
            setSettings((prev) => ({ ...prev, notifications: json.data.notifications }))
          }
        }
      } catch (_) {
        // ignore
      }
    }
    load()
  }, [])

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: settings.notifications }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      toast({
        title: "Settings Saved",
        description: "Your preferences have been successfully updated.",
        variant: "default",
      })
    } catch (e: any) {
      toast({ title: "Save Failed", description: e?.message || "Unable to save settings", variant: "destructive" })
    }
  }

  // Push helpers
  const base64UrlToUint8Array = (base64Url: string) => {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const enablePush = async (): Promise<boolean> => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast({ title: "Push not supported", description: "Your browser does not support push notifications.", variant: "destructive" })
        return false
      }
      // Register SW
      const registration = await navigator.serviceWorker.register("/sw.js")
      // Permission
      const perm = await Notification.requestPermission()
      if (perm !== "granted") {
        toast({ title: "Permission denied", description: "Allow notifications to enable push.", variant: "destructive" })
        return false
      }
      // VAPID key
      const keyRes = await fetch("/api/settings/push/public-key")
      const keyJson = await keyRes.json().catch(() => null)
      const vapidKey = keyJson?.data?.key as string | undefined
      if (!vapidKey) {
        toast({
          title: "Push not configured",
          description: "VAPID public key missing on server. Ask admin to configure push keys.",
          variant: "destructive",
        })
        return false
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey),
      })
      const body = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: (sub.toJSON() as any).keys.p256dh,
          auth: (sub.toJSON() as any).keys.auth,
        },
      }
      const res = await fetch("/api/settings/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to subscribe push")
      return true
    } catch (e: any) {
      console.error("enablePush error", e)
      toast({ title: "Push failed", description: e?.message || "Failed to enable push.", variant: "destructive" })
      return false
    }
  }

  const disablePush = async (): Promise<boolean> => {
    try {
      if (!("serviceWorker" in navigator)) return true
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      const endpoint = sub?.endpoint
      await sub?.unsubscribe()
      await fetch("/api/settings/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint ? { endpoint } : {}),
      }).catch(() => null)
      return true
    } catch (e) {
      return false
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              <span className="text-xl font-semibold text-slate-900">Settings</span>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-slate-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-slate-500">Receive browser push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={async (checked) => {
                  if (checked) {
                    const ok = await enablePush()
                    if (ok) handleSettingChange("notifications", "push", true)
                  } else {
                    await disablePush()
                    handleSettingChange("notifications", "push", false)
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Task Reminders</Label>
                <p className="text-xs text-slate-500">Get reminded about upcoming due dates</p>
              </div>
              <Switch
                checked={settings.notifications.taskReminders}
                onCheckedChange={(checked) => handleSettingChange("notifications", "taskReminders", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Project Updates</Label>
                <p className="text-xs text-slate-500">Notifications about project changes</p>
              </div>
              <Switch
                checked={settings.notifications.projectUpdates}
                onCheckedChange={(checked) => handleSettingChange("notifications", "projectUpdates", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleSettingChange("appearance", "theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => handleSettingChange("appearance", "language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.appearance.timezone}
                onValueChange={(value) => handleSettingChange("appearance", "timezone", value)}
              >
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value) => handleSettingChange("privacy", "profileVisibility", value)}
              >
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Control who can see your profile information</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Activity Tracking</Label>
                <p className="text-xs text-slate-500">Allow tracking of your activity for analytics</p>
              </div>
              <Switch
                checked={settings.privacy.activityTracking}
                onCheckedChange={(checked) => handleSettingChange("privacy", "activityTracking", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700 capitalize">{user?.role} Account</span>
                  <Badge variant="secondary" className="ml-auto">
                    {user?.role === "admin" ? "Full Access" : "Standard Access"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-sm text-slate-700">January 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Export Data</h4>
                <p className="text-sm text-slate-600">Download a copy of your account data</p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Clear All Data</h4>
                <p className="text-sm text-red-700">Permanently delete all your tasks and projects</p>
              </div>
              <Button variant="destructive" size="sm">
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
