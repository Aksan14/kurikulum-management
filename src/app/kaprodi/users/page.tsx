"use client"

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  GraduationCap,
  MoreHorizontal,
  Download,
  Upload,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usersService, User as ApiUser, CreateUserRequest } from '@/lib/api/users'

interface User {
  id: string
  nama: string
  email: string
  role: 'kaprodi' | 'dosen' | 'admin'
  status: 'active' | 'inactive' | 'pending'
  avatar?: string
  phone?: string
  nip?: string
  nidn?: string
  jabatan?: string
  fakultas?: string
  prodi?: string
  lastLogin?: string
  createdAt: string
  isVerified: boolean
  mataKuliah?: string[]
}

export default function UserManagementPage() {
  const { user: authUser } = useAuth()
  const currentUser = authUser ? {
    id: authUser.id,
    nama: authUser.nama,
    email: authUser.email,
    role: authUser.role as "kaprodi" | "dosen" | "admin",
    avatar: "/avatars/default.png",
  } : {
    id: '',
    nama: 'Guest',
    email: '',
    role: 'dosen' as const,
    avatar: '/avatars/default.png'
  }

  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'kaprodi' | 'dosen' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form state
  const [createForm, setCreateForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'dosen' as 'kaprodi' | 'dosen',
    phone: ''
  })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { limit: 100 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (roleFilter !== 'all') params.role = roleFilter
      if (searchQuery) params.search = searchQuery

      const response = await usersService.getAll(params)
      
      if (response.success && response.data && response.data.data) {
        const mappedUsers: User[] = response.data.data.map(u => ({
          id: u.id,
          nama: u.nama,
          email: u.email,
          role: u.role,
          status: u.status,
          avatar: u.avatar_url || undefined,
          phone: u.phone,
          nip: u.nip,
          lastLogin: u.last_login || 'Belum pernah login',
          createdAt: u.created_at,
          isVerified: true
        }))
        setUsers(mappedUsers)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Gagal memuat data user. Pastikan server API berjalan.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, roleFilter, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nidn && user.nidn.includes(searchQuery))
    return matchesSearch
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    pending: users.filter(u => u.status === 'pending').length,
    dosen: users.filter(u => u.role === 'dosen').length,
    kaprodi: users.filter(u => u.role === 'kaprodi').length,
    unverified: users.filter(u => !u.isVerified).length
  }

  const handleStatusChange = async (userId: string) => {
    try {
      const response = await usersService.toggleStatus(userId)
      if (response.success) {
        fetchUsers()
      } else {
        setError('Gagal mengubah status user')
      }
    } catch (err) {
      console.error('Error toggling status:', err)
      setError('Gagal mengubah status user')
    }
  }

  const handleVerify = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, isVerified: true } : user
      )
    )
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    
    setDeleting(true)
    try {
      const response = await usersService.delete(selectedUser.id)
      if (response.success) {
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError('Gagal menghapus user')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Gagal menghapus user')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setSelectedUser(null)
    }
  }

  const handleCreate = async () => {
    if (!createForm.nama || !createForm.email || !createForm.password) {
      return
    }

    setCreating(true)
    try {
      const data: CreateUserRequest = {
        nama: createForm.nama,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        phone: createForm.phone || undefined
      }

      const response = await usersService.create(data)
      if (response.success) {
        setShowCreateModal(false)
        setCreateForm({ nama: '', email: '', password: '', role: 'dosen', phone: '' })
        fetchUsers()
      }
    } catch (err) {
      console.error('Error creating user:', err)
    } finally {
      setCreating(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Nonaktif</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'kaprodi':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Kaprodi</Badge>
      case 'dosen':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Dosen</Badge>
      case 'admin':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Admin</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen User</h1>
            <p className="text-slate-600">
              Kelola akun pengguna sistem kurikulum
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-600">Total User</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                  <p className="text-sm text-slate-600">Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                  <p className="text-sm text-slate-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.unverified}</p>
                  <p className="text-sm text-slate-600">Belum Verifikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama, email, atau NIDN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="pending">Pending</option>
                </select>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Role</option>
                  <option value="kaprodi">Kaprodi</option>
                  <option value="dosen">Dosen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar User ({filteredUsers.length})</CardTitle>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {selectedUsers.length} user dipilih
                  </span>
                  <Button size="sm" variant="outline">
                    Bulk Action
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">User</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Role & Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Kontak</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Info Akademik</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Last Login</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.nama} />
                            <AvatarFallback className="bg-slate-100 text-slate-600">
                              {getInitials(user.nama)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{user.nama}</p>
                              {!user.isVerified && (
                                <div title="Belum terverifikasi">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            {user.nidn && (
                              <p className="text-xs text-slate-500">NIDN: {user.nidn}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-600">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {user.jabatan && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-600">{user.jabatan}</span>
                            </div>
                          )}
                          {user.prodi && (
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-600">{user.prodi}</span>
                            </div>
                          )}
                          {user.mataKuliah && user.mataKuliah.length > 0 && (
                            <p className="text-xs text-slate-500">
                              {user.mataKuliah.length} mata kuliah
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {user.lastLogin}
                        </div>
                        <div className="text-xs text-slate-500">
                          Dibuat: {user.createdAt}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(user.id)}
                              title="Verifikasi user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id)}
                            title={user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {user.status === 'active' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && !loading && !error && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Tidak ada user ditemukan
                </h3>
                <p className="text-slate-600">
                  {searchQuery 
                    ? 'Coba ubah kata kunci pencarian atau filter'
                    : 'Belum ada user yang terdaftar dalam sistem'
                  }
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Gagal Memuat Data
                </h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            )}

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-4 text-sm text-slate-500">Memuat data user...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk dosen atau kaprodi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Dr. John Doe"
                value={createForm.nama}
                onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@university.ac.id"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'kaprodi' | 'dosen' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dosen">Dosen</option>
                <option value="kaprodi">Kaprodi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
              <Input
                id="phone"
                placeholder="08123456789"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={creating}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Tambah User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.nama}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}