"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout'

import { 
  Search, 
  Plus, 
  Edit, 
  Eye,
  BookOpen,
  Users,
  Clock,
  Calendar,
  FileText,
  Star,
  Filter,
  Download,
  Upload,
  GraduationCap,
  Award,
  Target
} from 'lucide-react'

interface MataKuliah {
  id: string
  kode: string
  nama: string
  sks: number
  semester: number
  jenis: 'wajib' | 'pilihan'
  deskripsi: string
  prasyarat: string[]
  dosen: string[]
  status: 'aktif' | 'nonaktif' | 'revisi'
  rpsStatus: 'approved' | 'pending' | 'draft' | 'none'
  jumlahMahasiswa: number
  evaluasi: {
    rating: number
    feedback: number
  }
}

const mockMataKuliah: MataKuliah[] = [
  {
    id: '1',
    kode: 'TIF101',
    nama: 'Algoritma dan Pemrograman',
    sks: 3,
    semester: 1,
    jenis: 'wajib',
    deskripsi: 'Mata kuliah yang membahas dasar-dasar algoritma dan pemrograman komputer',
    prasyarat: [],
    dosen: ['Dr. Ahmad Wijaya', 'Budi Santoso, M.Kom'],
    status: 'aktif',
    rpsStatus: 'approved',
    jumlahMahasiswa: 45,
    evaluasi: {
      rating: 4.5,
      feedback: 38
    }
  },
  {
    id: '2',
    kode: 'TIF201',
    nama: 'Struktur Data',
    sks: 3,
    semester: 2,
    jenis: 'wajib',
    deskripsi: 'Mata kuliah yang membahas berbagai struktur data dan implementasinya',
    prasyarat: ['TIF101'],
    dosen: ['Sari Dewi, M.T.', 'Agus Prakoso, Ph.D'],
    status: 'aktif',
    rpsStatus: 'pending',
    jumlahMahasiswa: 42,
    evaluasi: {
      rating: 4.2,
      feedback: 35
    }
  },
  {
    id: '3',
    kode: 'TIF301',
    nama: 'Basis Data',
    sks: 3,
    semester: 3,
    jenis: 'wajib',
    deskripsi: 'Mata kuliah yang membahas konsep dan implementasi sistem basis data',
    prasyarat: ['TIF201'],
    dosen: ['Prof. Dr. Indira Sari'],
    status: 'aktif',
    rpsStatus: 'draft',
    jumlahMahasiswa: 38,
    evaluasi: {
      rating: 4.7,
      feedback: 32
    }
  },
  {
    id: '4',
    kode: 'TIF401',
    nama: 'Rekayasa Perangkat Lunak',
    sks: 4,
    semester: 4,
    jenis: 'wajib',
    deskripsi: 'Mata kuliah yang membahas metodologi pengembangan perangkat lunak',
    prasyarat: ['TIF301'],
    dosen: ['Dr. Rini Kusuma', 'Andi Setiawan, M.Kom'],
    status: 'aktif',
    rpsStatus: 'approved',
    jumlahMahasiswa: 40,
    evaluasi: {
      rating: 4.3,
      feedback: 36
    }
  },
  {
    id: '5',
    kode: 'TIF501',
    nama: 'Kecerdasan Buatan',
    sks: 3,
    semester: 5,
    jenis: 'pilihan',
    deskripsi: 'Mata kuliah yang membahas konsep dan aplikasi kecerdasan buatan',
    prasyarat: ['TIF301', 'TIF201'],
    dosen: ['Dr. Budi Hartono'],
    status: 'aktif',
    rpsStatus: 'none',
    jumlahMahasiswa: 25,
    evaluasi: {
      rating: 4.8,
      feedback: 22
    }
  }
]

const statusColors = {
  aktif: 'bg-green-100 text-green-800 border-green-200',
  nonaktif: 'bg-gray-100 text-gray-800 border-gray-200',
  revisi: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const rpsStatusColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-blue-100 text-blue-800',
  none: 'bg-gray-100 text-gray-800'
}

const jenisColors = {
  wajib: 'bg-red-100 text-red-800',
  pilihan: 'bg-blue-100 text-blue-800'
}

export default function DosenMataKuliahPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedJenis, setSelectedJenis] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredMataKuliah = mockMataKuliah.filter(mk => {
    const matchesSearch = mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mk.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSemester = selectedSemester === 'all' || mk.semester.toString() === selectedSemester
    const matchesJenis = selectedJenis === 'all' || mk.jenis === selectedJenis
    const matchesStatus = selectedStatus === 'all' || mk.status === selectedStatus
    
    return matchesSearch && matchesSemester && matchesJenis && matchesStatus
  })

  const totalSKS = filteredMataKuliah.reduce((sum, mk) => sum + mk.sks, 0)
  const avgRating = filteredMataKuliah.reduce((sum, mk) => sum + mk.evaluasi.rating, 0) / filteredMataKuliah.length || 0
  const totalMahasiswa = filteredMataKuliah.reduce((sum, mk) => sum + mk.jumlahMahasiswa, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mata Kuliah Saya</h1>
            <p className="text-slate-600">Daftar mata kuliah yang diampu</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{filteredMataKuliah.length}</p>
                  <p className="text-sm text-slate-600">Mata Kuliah</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalSKS}</p>
                  <p className="text-sm text-slate-600">Total SKS</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgRating.toFixed(1)}</p>
                  <p className="text-sm text-slate-600">Rata-rata Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalMahasiswa}</p>
                  <p className="text-sm text-slate-600">Total Mahasiswa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">Semua Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s.toString()}>Semester {s}</option>
                  ))}
                </select>
                <select
                  value={selectedJenis}
                  onChange={(e) => setSelectedJenis(e.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="wajib">Wajib</option>
                  <option value="pilihan">Pilihan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mata Kuliah List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMataKuliah.map((mk) => (
            <Card key={mk.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={jenisColors[mk.jenis]} variant="outline">
                      {mk.jenis === 'wajib' ? 'Wajib' : 'Pilihan'}
                    </Badge>
                    <p className="mt-2 font-mono text-sm text-slate-500">{mk.kode}</p>
                  </div>
                  <Badge className={rpsStatusColors[mk.rpsStatus]}>
                    {mk.rpsStatus === 'approved' ? 'RPS Approved' : 
                     mk.rpsStatus === 'pending' ? 'RPS Pending' :
                     mk.rpsStatus === 'draft' ? 'RPS Draft' : 'No RPS'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{mk.nama}</CardTitle>
                <CardDescription className="line-clamp-2">{mk.deskripsi}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{mk.sks} SKS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Semester {mk.semester}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{mk.jumlahMahasiswa}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    RPS
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMataKuliah.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">Tidak ada mata kuliah yang ditemukan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}