"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Target,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Download,
  Upload
} from 'lucide-react'

interface CPMK {
  id: string
  kode: string
  deskripsi: string
  cpl: string[]
  mataKuliah: string
  semester: number
  status: 'draft' | 'active' | 'review'
  createdAt: string
  updatedAt: string
}

const mockCPMK: CPMK[] = [
  {
    id: '1',
    kode: 'CPMK-01',
    deskripsi: 'Mampu menganalisis kebutuhan sistem informasi dan merancang solusi yang tepat',
    cpl: ['CPL-1', 'CPL-3'],
    mataKuliah: 'Analisis dan Perancangan Sistem',
    semester: 4,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    kode: 'CPMK-02',
    deskripsi: 'Mampu mengimplementasikan algoritma dan struktur data yang efisien',
    cpl: ['CPL-2', 'CPL-4'],
    mataKuliah: 'Algoritma dan Struktur Data',
    semester: 3,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    kode: 'CPMK-03',
    deskripsi: 'Mampu mengembangkan aplikasi web dengan framework modern',
    cpl: ['CPL-5', 'CPL-6'],
    mataKuliah: 'Pemrograman Web',
    semester: 5,
    status: 'draft',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05'
  },
  {
    id: '4',
    kode: 'CPMK-04',
    deskripsi: 'Mampu merancang dan mengelola basis data yang efektif',
    cpl: ['CPL-3', 'CPL-7'],
    mataKuliah: 'Sistem Basis Data',
    semester: 4,
    status: 'review',
    createdAt: '2024-01-25',
    updatedAt: '2024-02-02'
  }
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const statusIcons = {
  draft: Clock,
  active: CheckCircle,
  review: AlertTriangle
}

export default function DosenMappingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredCPMK = mockCPMK.filter(cpmk => {
    const matchesSearch = cpmk.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cpmk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cpmk.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSemester = selectedSemester === 'all' || cpmk.semester.toString() === selectedSemester
    const matchesStatus = selectedStatus === 'all' || cpmk.status === selectedStatus
    
    return matchesSearch && matchesSemester && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Mapping CPMK</h1>
        <p className="text-slate-600">
          Kelola mapping Capaian Pembelajaran Mata Kuliah (CPMK) ke CPL Program Studi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total CPMK</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">CPMK Aktif</p>
                <p className="text-2xl font-bold text-slate-900">18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Dalam Review</p>
                <p className="text-2xl font-bold text-slate-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="list">Daftar CPMK</TabsTrigger>
            <TabsTrigger value="mapping">Mapping CPL</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah CPMK
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Cari CPMK atau mata kuliah..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Aktif</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPMK List */}
          <div className="space-y-4">
            {filteredCPMK.map((cpmk) => {
              const StatusIcon = statusIcons[cpmk.status]
              return (
                <Card key={cpmk.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{cpmk.kode}</h3>
                            <p className="text-sm text-slate-600 mt-1">{cpmk.deskripsi}</p>
                          </div>
                          <Badge className={statusColors[cpmk.status]} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {cpmk.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {cpmk.mataKuliah}
                          </div>
                          <div>Semester {cpmk.semester}</div>
                          <div>Updated: {new Date(cpmk.updatedAt).toLocaleDateString('id-ID')}</div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {cpmk.cpl.map((cpl) => (
                            <Badge key={cpl} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {cpl}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredCPMK.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Target className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Tidak ada CPMK ditemukan</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Coba ubah filter atau kata kunci pencarian Anda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mapping Matrix CPMK - CPL</CardTitle>
              <CardDescription>
                Visualisasi hubungan antara Capaian Pembelajaran Mata Kuliah dengan CPL Program Studi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Mapping Matrix</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Fitur ini akan menampilkan matrix mapping CPMK ke CPL
                    </p>
                  </div>
                  <Button>
                    Buat Mapping Matrix
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Analisis dan laporan mapping CPMK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Coming Soon</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Fitur analytics dan reports sedang dalam pengembangan
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}