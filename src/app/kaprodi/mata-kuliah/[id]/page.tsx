"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  Target,
  Edit,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { mataKuliahService, type MataKuliah } from '@/lib/api/mata-kuliah'
import { rpsService, type RPS } from '@/lib/api/rps'
import { authService } from '@/lib/api/auth'
import { formatDate } from '@/lib/utils'

const jenisColors = {
  wajib: 'bg-red-100 text-red-800',
  pilihan: 'bg-blue-100 text-blue-800'
}

const statusColors = {
  aktif: 'bg-green-100 text-green-700',
  nonaktif: 'bg-gray-100 text-gray-700',
  dihapus: 'bg-red-100 text-red-700'
}

const rpsStatusColors = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-blue-100 text-blue-700',
  revision: 'bg-orange-100 text-orange-700'
}

export default function KaprodiMataKuliahDetailPage() {
  const params = useParams()
  const router = useRouter()
  const mkId = params.id as string

  const [mataKuliah, setMataKuliah] = useState<MataKuliah | null>(null)
  const [rps, setRps] = useState<RPS | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [mkResponse, rpsResponse] = await Promise.all([
        mataKuliahService.getById(mkId),
        rpsService.getByMataKuliah(mkId)
      ])

      if (mkResponse.data) {
        setMataKuliah(mkResponse.data)
      }

      // Get the latest RPS for this mata kuliah
      if (rpsResponse.data) {
        const rpsList = Array.isArray(rpsResponse.data)
          ? rpsResponse.data
          : rpsResponse.data.data || []
        if (rpsList.length > 0) {
          setRps(rpsList[0])
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data mata kuliah')
    } finally {
      setLoading(false)
    }
  }, [mkId, router])

  useEffect(() => {
    if (mkId) {
      fetchData()
    }
  }, [mkId, fetchData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat data mata kuliah...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !mataKuliah) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-slate-900">Gagal Memuat Data</p>
          <p className="text-slate-600">{error || 'Mata kuliah tidak ditemukan'}</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detail Mata Kuliah</h1>
              <p className="text-slate-600">Informasi lengkap mata kuliah</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/kaprodi/mata-kuliah/edit/${mataKuliah.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Mata Kuliah
            </Link>
          </Button>
        </div>

        {/* Mata Kuliah Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={jenisColors[mataKuliah.jenis]}>
                      {mataKuliah.jenis === 'wajib' ? 'Wajib' : 'Pilihan'}
                    </Badge>
                    <Badge className={statusColors[mataKuliah.status]}>
                      {mataKuliah.status === 'aktif' ? 'Aktif' :
                       mataKuliah.status === 'nonaktif' ? 'Nonaktif' : 'Dihapus'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{mataKuliah.nama}</CardTitle>
                  <CardDescription>{mataKuliah.kode}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{mataKuliah.sks} SKS</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Semester {mataKuliah.semester}</span>
              </div>
              {mataKuliah.dosen_pengampu && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{mataKuliah.dosen_pengampu.nama}</span>
                </div>
              )}
            </div>

            {/* Deskripsi */}
            {mataKuliah.deskripsi && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Deskripsi</h3>
                <p className="text-slate-900">{mataKuliah.deskripsi}</p>
              </div>
            )}

            {/* Prasyarat */}
            {mataKuliah.prasyarat && mataKuliah.prasyarat.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Prasyarat</h3>
                <div className="flex flex-wrap gap-2">
                  {mataKuliah.prasyarat.map((p, idx) => (
                    <Badge key={idx} variant="outline">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RPS Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Rencana Pembelajaran Semester (RPS)</CardTitle>
                <CardDescription>
                  Status RPS untuk mata kuliah ini
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/kaprodi/rps/${mataKuliah.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Kelola RPS
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rps ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">
                        RPS {rps.tahun_akademik}
                      </p>
                      <p className="text-sm text-slate-500">
                        Terakhir diperbarui: {formatDate(rps.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={rpsStatusColors[rps.status]}>
                      {rps.status === 'draft' ? 'Draft' :
                       rps.status === 'submitted' ? 'Menunggu Review' :
                       rps.status === 'approved' ? 'Disetujui' :
                       rps.status === 'rejected' ? 'Ditolak' : 'Published'}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/kaprodi/rps/${rps.id}`}>
                        Lihat RPS
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900">Belum ada RPS</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Mata kuliah ini belum memiliki RPS
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/kaprodi/rps/create?mata_kuliah_id=${mataKuliah.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat RPS
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/kaprodi/mata-kuliah">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Semua Mata Kuliah
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/kaprodi/mapping">
                  <Target className="h-4 w-4 mr-2" />
                  Lihat Mapping CPL
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/kaprodi/assignment">
                  <Users className="h-4 w-4 mr-2" />
                  Penugasan CPL
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}