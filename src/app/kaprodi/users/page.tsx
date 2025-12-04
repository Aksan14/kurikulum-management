"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  UserPlus
} from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'

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

// Extended mock data dengan lebih banyak user
const extendedUsers: User[] = [
  ...mockUsers.map((user, index) => ({
    ...user,
    id: user.id || `user-${index + 1}`,
    status: 'active' as const,
    phone: `08123456789${index}`,
    nip: user.role === 'kaprodi' ? '198501012010011001' : `198${82 + index}0101201001100${index + 1}`,
    nidn: user.role === 'kaprodi' ? '0101018501' : `010101${85 + index}0${index + 1}`,
    jabatan: user.role === 'kaprodi' ? 'Ketua Program Studi' : index % 2 === 0 ? 'Lektor' : 'Asisten Ahli',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    lastLogin: `${Math.floor(Math.random() * 24)} jam lalu`,
    createdAt: `2024-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    isVerified: Math.random() > 0.2,
    mataKuliah: user.role === 'dosen' ? [
      'Algoritma dan Pemrograman',
      'Struktur Data',
      'Basis Data'
    ].slice(0, Math.floor(Math.random() * 3) + 1) : undefined
  })),
  // Additional users
  {
    id: 'user-5',
    nama: 'Dr. Maya Sari',
    email: 'maya.sari@university.ac.id',
    role: 'dosen',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    phone: '081234567894',
    nidn: '0101018804',
    jabatan: 'Lektor Kepala',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    lastLogin: 'Belum pernah login',
    createdAt: '2024-01-15',
    isVerified: false,
    mataKuliah: ['Machine Learning', 'Artificial Intelligence']
  },
  {
    id: 'user-6',
    nama: 'Prof. Budi Santoso',
    email: 'budi.santoso@university.ac.id',
    role: 'dosen',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '081234567895',
    nidn: '0101017505',
    jabatan: 'Guru Besar',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    lastLogin: '30 menit lalu',
    createdAt: '2023-08-20',
    isVerified: true,
    mataKuliah: ['Software Engineering', 'Project Management', 'System Analysis']
  },
  {
    id: 'user-7',
    nama: 'Dr. Rina Kusuma',
    email: 'rina.kusuma@university.ac.id',
    role: 'dosen',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b131?w=150',
    phone: '081234567896',
    nidn: '0101018106',
    jabatan: 'Lektor',
    fakultas: 'Fakultas Teknik',
    prodi: 'Teknik Informatika',
    lastLogin: '2 bulan lalu',
    createdAt: '2023-09-10',
    isVerified: true,
    mataKuliah: ['Web Programming', 'Mobile Development']
  }
]

export default function UserManagementPage() {
  const currentUser = mockUsers[0] // Kaprodi user
  const [users, setUsers] = useState<User[]>(extendedUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'kaprodi' | 'dosen' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nidn && user.nidn.includes(searchQuery))

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
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

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    )
  }

  const handleVerify = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, isVerified: true } : user
      )
    )
  }

  const handleDelete = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
      setSelectedUsers(prev => prev.filter(id => id !== userId))
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
                            onClick={() => {
                              const newStatus = user.status === 'active' ? 'inactive' : 'active'
                              handleStatusChange(user.id, newStatus)
                            }}
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
                            onClick={() => handleDelete(user.id)}
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
            
            {filteredUsers.length === 0 && (
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}