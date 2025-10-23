'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  UserPlus,
  UserMinus,
  Shield,
  User,
  Mail,
  Crown,
  Eye,
} from 'lucide-react'

interface Member {
  id: string
  user_id: string
  name: string
  email: string
  avatar?: string
  initials?: string
  role: string
  joined_at: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  role: string
}

interface MembersManagerProps {
  communityId: string
  members: Member[]
  onMembersUpdate: () => void
  currentUserRole: string
}

export function CommunityMembersManager({
  communityId,
  members,
  onMembersUpdate,
  currentUserRole,
}: MembersManagerProps) {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState('viewer')

  const canManageMembers = ['owner', 'admin'].includes(currentUserRole)

  // Load users when dialog opens
  useEffect(() => {
    if (dialogOpen && users.length === 0) {
      loadUsers()
    }
  }, [dialogOpen])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await fetch('/api/users')
      const json = await res.json()
      if (json.success) {
        // Filter out users who are already members
        const memberUserIds = members.map(m => m.user_id)
        const availableUsers = (json.data || []).filter(
          (u: User) => !memberUserIds.includes(u.id) && u.role !== 'admin'
        )
        setUsers(availableUsers)
      }
    } catch (e) {
      console.error('Failed to load users:', e)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast({ title: 'Error', description: 'Please select a user', variant: 'destructive' })
      return
    }

    try {
      setAdding(true)
      const res = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          role: selectedRole,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: 'Success', description: 'Member added successfully' })
        setDialogOpen(false)
        setSelectedUserId('')
        setSelectedRole('viewer')
        setSearchTerm('')
        setUsers([])
        onMembersUpdate()
      } else {
        throw new Error(json.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName || 'this member'} from this community?`)) {
      return
    }

    try {
      const res = await fetch(`/api/communities/${communityId}/members/${memberId}`, {
        method: 'DELETE',
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: 'Success', description: 'Member removed successfully' })
        onMembersUpdate()
      } else {
        throw new Error(json.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string, memberName: string) => {
    try {
      const res = await fetch(`/api/communities/${communityId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: 'Success', description: `${memberName}'s role updated to ${newRole}` })
        onMembersUpdate()
      } else {
        throw new Error(json.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'moderator':
        return <Shield className="h-4 w-4" />
      case 'viewer':
        return <Eye className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Members Management</p>
                <p className="text-xs text-green-600">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {canManageMembers && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>
                      Select a user from your website to add to this community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search">Search Users</Label>
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Select User</Label>
                      {loadingUsers ? (
                        <div className="text-center py-8 text-slate-500">Loading users...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          {searchTerm ? 'No users found matching your search' : 'No available users to add'}
                        </div>
                      ) : (
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => setSelectedUserId(user.id)}
                              className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                                selectedUserId === user.id
                                  ? 'bg-indigo-50 border-indigo-200'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                                  {user.initials}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900">{user.name}</div>
                                  <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                                {selectedUserId === user.id && (
                                  <Badge className="bg-indigo-500">Selected</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                          <SelectItem value="contributor">Contributor - Can post</SelectItem>
                          <SelectItem value="editor">Editor - Can edit posts</SelectItem>
                          <SelectItem value="moderator">Moderator - Can moderate</SelectItem>
                          {currentUserRole === 'owner' && (
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAddMember}
                      disabled={adding || !selectedUserId}
                      className="w-full"
                    >
                      {adding ? 'Adding...' : 'Add Member'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                    {member.initials || member.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{member.name || 'Unknown User'}</div>
                    <div className="text-sm text-slate-500">{member.email || 'No email'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {canManageMembers && member.role !== 'owner' ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value, member.name)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          {currentUserRole === 'owner' && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className={
                        member.role === 'owner'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : member.role === 'admin'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700'
                      }
                    >
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
