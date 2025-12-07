"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout'
import Link from 'next/link'

import { 
  Search, 
  Eye,
  BookOpen,
  Users,
  Clock,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { mataKuliahService, type MataKuliah } from '@/lib/api/mata-kuliah'
import { rpsService, type RPS } from '@/lib/api/rps'
import { authService } from '@/lib/api/auth'

// Extended type for display
interface DisplayMataKuliah extends MataKuliah {
  rpsStatus?: 'approved' | 'submitted' | 'draft' | 'rejected' | 'published' | 'revision' | 'none'
  rpsId?: string
}

const jenisColors = {
  wajib: 'bg-red-100 text-red-800',
  pilihan: 'bg-blue-100 text-blue-800'
}

const rpsStatusConfig = {
  approved: { label: 'RPS Disetujui', color: 'bg-green-100 text-green-800' },
  submitted: { label: 'RPS Pending', color: 'bg-yellow-100 text-yellow-800' },
  draft: { label: 'RPS Draft', color: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'RPS Ditolak', color: 'bg-red-100 text-red-800' },
  published: { label: 'RPS Published', color: 'bg-emerald-100 text-emerald-800' },
  revision: { label: 'Perlu Revisi', color: 'bg-orange-100 text-orange-800' },
  none: { label: 'Belum Ada RPS', color: 'bg-gray-100 text-gray-800' }
}

export default function DosenMataKuliahPage() {
  const router = useRouter()
  const [mataKuliahList, setMataKuliahList] = useState<DisplayMataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedJenis, setSelectedJenis] = useState<string>('all')

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Fetch mata kuliah and RPS in parallel
      const [mkResponse, rpsResponse] = await Promise.all([
        mataKuliahService.getMy(),
        rpsService.getMy()
      ])

      // Handle various response formats for mata kuliah
      let mkData: MataKuliah[] = []
      if (mkResponse.data) {
        if (Array.isArray(mkResponse.data)) {
          mkData = mkResponse.data
        } else if (mkResponse.data.data && Array.isArray(mkResponse.data.data)) {
          mkData = mkResponse.data.data
        }
      }

      // Handle various response formats for RPS
      let rpsData: RPS[] = []
      if (rpsResponse.data) {
        if (Array.isArray(rpsResponse.data)) {
          rpsData = rpsResponse.data
        } else if (rpsResponse.data.data && Array.isArray(rpsResponse.data.data)) {
          rpsData = rpsResponse.data.data
        }
      }

      // Map RPS status to mata kuliah
      const mkWithRps: DisplayMataKuliah[] = mkData.map(mk => {
        const relatedRps = rpsData.find(rps => rps.mata_kuliah_id === mk.id)
        return {
          ...mk,
          rpsStatus: relatedRps?.status || 'none',
          rpsId: relatedRps?.id
        }
      })

      setMataKuliahList(mkWithRps)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data mata kuliah')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredMataKuliah = mataKuliahList.filter(mk => {
    const matchesSearch = mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (mk.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    const matchesSemester = selectedSemester === 'all' || mk.semester.toString() === selectedSemester
    const matchesJenis = selectedJenis === 'all' || mk.jenis === selectedJenis
    
    return matchesSearch && matchesSemester && matchesJenis
  })

  const totalSKS = filteredMataKuliah.reduce((sum, mk) => sum + mk.sks, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat mata kuliah...</span>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mata Kuliah Saya</h1>
            <p className="text-slate-600">Daftar mata kuliah yang diampu</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredMataKuliah.filter(mk => mk.rpsStatus === 'approved').length}
                  </p>
                  <p className="text-sm text-slate-600">RPS Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredMataKuliah.filter(mk => mk.rpsStatus === 'none' || mk.rpsStatus === 'draft').length}
                  </p>
                  <p className="text-sm text-slate-600">Perlu RPS</p>
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
        {filteredMataKuliah.length > 0 ? (
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
                    <Badge className={rpsStatusConfig[mk.rpsStatus || 'none'].color}>
                      {rpsStatusConfig[mk.rpsStatus || 'none'].label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{mk.nama}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {mk.deskripsi || 'Tidak ada deskripsi'}
                  </CardDescription>
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
                  </div>
                  {mk.dosen_pengampu && (
                    <div className="mt-2 text-sm text-slate-600 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{mk.dosen_pengampu.nama}</span>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dosen/mata-kuliah/${mk.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Link>
                    </Button>
                    {mk.rpsId ? (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dosen/rps/${mk.rpsId}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Lihat RPS
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" className="flex-1" asChild>
                        <Link href={`/dosen/rps/create?mata_kuliah_id=${mk.id}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Buat RPS
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-lg font-medium text-slate-900">Tidak ada mata kuliah</p>
              <p className="text-slate-600">
                {searchQuery || selectedSemester !== 'all' || selectedJenis !== 'all'
                  ? 'Tidak ada mata kuliah yang cocok dengan filter'
                  : 'Anda belum ditugaskan ke mata kuliah manapun'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
