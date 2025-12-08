"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/api/auth"
import { cplService, CPL as ApiCPL } from "@/lib/api/cpl"

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const },
  published: { label: 'Published', variant: 'success' as const },
  archived: { label: 'Archived', variant: 'outline' as const },
}

// Local CPL type for display (maps from API CPL)
interface DisplayCPL {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  updatedAt: string;
}

export default function CPLMatrixPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()

  // API State
  const [cplList, setCplList] = useState<DisplayCPL[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User for layout (fallback for display)
  const user = authUser ? {
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

  // Fetch CPL data
  const fetchCPLData = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Get all published CPLs for matrix display
      const params: Record<string, string | number> = {
        status: 'published',
        limit: 100,
        sort_by: 'kode',
        sort_order: 'asc'
      }

      const cplResponse = await cplService.getAll(params)

      if (cplResponse.success && cplResponse.data) {
        // Handle case where data might be null, undefined, or not an array
        const cplData = cplResponse.data.data || []
        const mappedCPLs: DisplayCPL[] = Array.isArray(cplData) ? cplData.map(cpl => ({
          id: cpl.id,
          kode: cpl.kode,
          nama: cpl.nama,
          deskripsi: cpl.deskripsi,
          status: cpl.status,
          version: cpl.version,
          updatedAt: cpl.updated_at
        })) : []
        setCplList(mappedCPLs)
      } else {
        setCplList([])
      }
    } catch (err) {
      console.error('Error fetching CPL data:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string }
        if (errorObj.message.includes('fetch') || errorObj.message.includes('network')) {
          setError('Koneksi internet bermasalah. Periksa koneksi dan coba lagi.')
        } else {
          setError(errorObj.message || 'Gagal memuat data CPL')
        }
      } else {
        setError('Terjadi kesalahan saat memuat data CPL')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCPLData()
  }, [fetchCPLData])

  const handleRefresh = () => {
    fetchCPLData()
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-slate-600 dark:text-slate-400">Memuat Matrix CPL...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/kaprodi/cpl">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Matrix CPL</h1>
              <p className="text-gray-600">Daftar Capaian Pembelajaran Lulusan</p>
            </div>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-red-800">Gagal Memuat Data</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/kaprodi/cpl">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Matrix CPL</h1>
                <p className="text-gray-600">Daftar Capaian Pembelajaran Lulusan Berurutan</p>
              </div>
            </div>
          </div>

          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Matrix Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Matrix Capaian Pembelajaran Lulusan
            </CardTitle>
            <CardDescription>
              Daftar CPL yang telah dipublikasikan, ditampilkan secara berurutan dari 1 seterusnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cplList.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada CPL</h3>
                <p className="text-gray-600 mb-4">
                  Belum ada Capaian Pembelajaran Lulusan yang dipublikasikan.
                </p>
                <Link href="/kaprodi/cpl/create">
                  <Button>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Buat CPL Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-semibold text-gray-700 border">
                  <div className="col-span-1 text-center">No</div>
                  <div className="col-span-2">Kode</div>
                  <div className="col-span-5">Nama CPL</div>
                  <div className="col-span-3">Deskripsi</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>

                {/* Data Rows */}
                {cplList.map((cpl, index) => {
                  const statusInfo = statusConfig[cpl.status]
                  return (
                    <div key={cpl.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {cpl.kode}
                        </span>
                      </div>
                      <div className="col-span-5 flex items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{cpl.nama}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Versi {cpl.version}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(cpl.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <p className="text-sm text-gray-600 line-clamp-2">{cpl.deskripsi}</p>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {cplList.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Ringkasan Matrix CPL</h3>
                    <p className="text-sm text-blue-700">
                      Total {cplList.length} Capaian Pembelajaran Lulusan yang telah dipublikasikan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{cplList.length}</div>
                  <div className="text-sm text-blue-700">CPL Aktif</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}