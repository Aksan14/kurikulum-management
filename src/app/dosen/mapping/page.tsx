"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout'
import Link from 'next/link'
import { 
  Search, 
  Eye,
  FileText,
  Target,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  AlertCircle,
  Link2
} from 'lucide-react'
import { rpsService, type RPS, type CPMK } from '@/lib/api/rps'
import { cplService, type CPL } from '@/lib/api/cpl'
import { cplMKMappingService, type CPLMKMapping } from '@/lib/api/cpl-mk-mapping'
import { authService } from '@/lib/api/auth'

interface DisplayCPMK {
  id: string
  kode: string
  deskripsi: string
  cplIds: string[]
  mataKuliah: string
  mataKuliahId: string
  rpsId: string
  rpsStatus: string
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  published: 'bg-blue-100 text-blue-800 border-blue-200'
}

const levelColors = {
  tinggi: 'bg-red-100 text-red-800',
  sedang: 'bg-yellow-100 text-yellow-800',
  rendah: 'bg-green-100 text-green-800'
}

export default function DosenMappingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [cplList, setCplList] = useState<CPL[]>([])
  const [cplMkMappings, setCplMkMappings] = useState<CPLMKMapping[]>([])
  const [cpmkList, setCpmkList] = useState<CPMK[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeView, setActiveView] = useState<'cpmk' | 'cpl-mk'>('cpmk')

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const [rpsRes, cplRes, mappingRes, cpmkRes] = await Promise.all([
        rpsService.getMy(),
        cplService.getAll({ limit: 100 }),
        cplMKMappingService.getAll(),
        rpsService.cpmk.getAllGlobal()
      ])
      
      let rpsData: RPS[] = []
      if (rpsRes.data) {
        if (Array.isArray(rpsRes.data)) {
          rpsData = rpsRes.data
        } else if (rpsRes.data.data && Array.isArray(rpsRes.data.data)) {
          rpsData = rpsRes.data.data
        }
      }
      
      let cplData: CPL[] = []
      if (cplRes.data) {
        if (Array.isArray(cplRes.data)) {
          cplData = cplRes.data
        } else if (cplRes.data.data && Array.isArray(cplRes.data.data)) {
          cplData = cplRes.data.data
        }
      }

      let mappingData: CPLMKMapping[] = []
      if (mappingRes.data) {
        if (Array.isArray(mappingRes.data)) {
          mappingData = mappingRes.data
        } else if (mappingRes.data.data && Array.isArray(mappingRes.data.data)) {
          mappingData = mappingRes.data.data
        }
      }

      let cpmkData: CPMK[] = []
      if (cpmkRes.data) {
        if (Array.isArray(cpmkRes.data)) {
          cpmkData = cpmkRes.data
        }
      }
      
      setRpsList(rpsData)
      setCplList(cplData)
      setCplMkMappings(mappingData)
      setCpmkList(cpmkData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Extract all CPMK from fetched CPMK list and enrich with RPS data
  const allCPMK: DisplayCPMK[] = cpmkList.map(cpmk => {
    // Find the RPS that contains this CPMK
    const rps = rpsList.find(r => r.id === cpmk.rps_id)
    return {
      id: cpmk.id,
      kode: cpmk.kode,
      deskripsi: cpmk.deskripsi,
      cplIds: cpmk.cpl_ids || [],
      mataKuliah: rps?.mata_kuliah_nama || rps?.kode_mk || 'Mata Kuliah Tidak Diketahui',
      mataKuliahId: rps?.mata_kuliah_id || '',
      rpsId: cpmk.rps_id,
      rpsStatus: rps?.status || 'unknown'
    }
  })

  // Filter CPMK
  const filteredCPMK = allCPMK.filter(cpmk => {
    const matchesSearch = 
      cpmk.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cpmk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cpmk.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || cpmk.rpsStatus === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: allCPMK.length,
    approved: allCPMK.filter(c => c.rpsStatus === 'approved').length,
    pending: allCPMK.filter(c => c.rpsStatus === 'submitted').length,
    draft: allCPMK.filter(c => c.rpsStatus === 'draft').length,
  }

  // Get CPL name by ID
  const getCPLKode = (cplId: string): string => {
    const cpl = cplList.find(c => c.id === cplId)
    return cpl?.kode || cplId
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat data mapping...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-slate-900">Gagal Memuat Data</p>
          <p className="text-slate-600">{error}</p>
          <Button onClick={fetchData}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mapping CPL & CPMK</h1>
            <p className="text-slate-600">
              Lihat mapping CPL ke Mata Kuliah dan CPMK dari RPS yang Anda kelola
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tabs for switching views */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'cpmk' | 'cpl-mk')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cpmk">
              <Target className="h-4 w-4 mr-2" />
              CPMK dari RPS
            </TabsTrigger>
            <TabsTrigger value="cpl-mk">
              <Link2 className="h-4 w-4 mr-2" />
              CPL - Mata Kuliah
            </TabsTrigger>
          </TabsList>

          {/* CPMK View */}
          <TabsContent value="cpmk" className="space-y-6">
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
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
                      <p className="text-sm font-medium text-slate-600">RPS Disetujui</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
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
                      <p className="text-sm font-medium text-slate-600">Menunggu Review</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                      <AlertTriangle className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Draft</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.draft}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Semua Status RPS</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Menunggu Review</option>
                      <option value="approved">Disetujui</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CPMK List */}
            {filteredCPMK.length > 0 ? (
              <div className="space-y-4">
                {filteredCPMK.map((cpmk) => (
                  <Card key={cpmk.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900">{cpmk.kode}</h3>
                              <p className="text-sm text-slate-600 mt-1">{cpmk.deskripsi}</p>
                            </div>
                            <Badge className={statusColors[cpmk.rpsStatus as keyof typeof statusColors] || statusColors.draft} variant="outline">
                              {cpmk.rpsStatus === 'approved' ? 'Disetujui' :
                               cpmk.rpsStatus === 'submitted' ? 'Menunggu Review' :
                               cpmk.rpsStatus === 'rejected' ? 'Ditolak' : 'Draft'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {cpmk.mataKuliah}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-slate-500">Terkait CPL:</span>
                            {cpmk.cplIds.length > 0 ? (
                              cpmk.cplIds.map((cplId) => (
                                <Badge key={cplId} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {getCPLKode(cplId)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">Belum ada CPL terkait</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                          <Button variant="outline" size="sm" className="flex-1 lg:flex-none" asChild>
                            <Link href={`/dosen/rps/${cpmk.rpsId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat RPS
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Target className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Tidak ada CPMK ditemukan</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {searchQuery || selectedStatus !== 'all' 
                          ? 'Coba ubah filter atau kata kunci pencarian Anda'
                          : 'Anda belum memiliki CPMK. Buat RPS terlebih dahulu dan tambahkan CPMK di dalamnya.'}
                      </p>
                    </div>
                    {rpsList.length === 0 && (
                      <Button asChild>
                        <Link href="/dosen/rps/create">
                          <FileText className="h-4 w-4 mr-2" />
                          Buat RPS
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CPL-MK Mapping View */}
          <TabsContent value="cpl-mk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapping CPL ke Mata Kuliah</CardTitle>
                <CardDescription>
                  Daftar hubungan antara CPL (Capaian Pembelajaran Lulusan) dengan Mata Kuliah
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cplMkMappings.length > 0 ? (
                  <div className="space-y-4">
                    {cplMkMappings.map((mapping) => (
                      <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                            {mapping.cpl?.kode || 'CPL'}
                          </Badge>
                          <div className="flex items-center">
                            <Link2 className="h-4 w-4 text-slate-400 mx-2" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {mapping.mata_kuliah?.kode} - {mapping.mata_kuliah?.nama}
                            </p>
                            <p className="text-sm text-slate-500">
                              Semester {mapping.mata_kuliah?.semester}
                            </p>
                          </div>
                        </div>
                        <Badge className={levelColors[mapping.level as keyof typeof levelColors] || 'bg-gray-100'}>
                          {mapping.level === 'tinggi' ? 'Tinggi' : 
                           mapping.level === 'sedang' ? 'Sedang' : 'Rendah'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium text-slate-900">Belum ada mapping CPL-MK</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Mapping CPL ke Mata Kuliah akan ditampilkan di sini
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
