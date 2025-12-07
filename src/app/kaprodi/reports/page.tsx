"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { 
  dashboardService, 
  cplService, 
  rpsService, 
  mataKuliahService, 
  authService,
  KaprodiDashboard,
  CPLStatistics,
  CPL,
  MataKuliah,
  RPS
} from '@/lib/api'

interface ReportData {
  rpsSubmissions: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  cplMapping: {
    totalCPL: number
    publishedCPL: number
    draftCPL: number
    percentage: number
  }
  dosenActivity: {
    totalDosen: number
    activeAssignments: number
    completedAssignments: number
    pendingAssignments: number
  }
  courseDistribution: {
    totalCourses: number
    withRPS: number
    withoutRPS: number
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [cplList, setCplList] = useState<CPL[]>([])
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [rpsList, setRpsList] = useState<RPS[]>([])

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const [dashboardRes, cplRes, mkRes, rpsRes] = await Promise.all([
        dashboardService.getKaprodi(),
        cplService.getAll({ limit: 100 }),
        mataKuliahService.getAll({ limit: 100 }),
        rpsService.getAll({ limit: 100 })
      ])

      // Parse dashboard data
      const dashboard = dashboardRes.data as KaprodiDashboard
      
      // Parse CPL data
      let cplData: CPL[] = []
      if (Array.isArray(cplRes.data)) {
        cplData = cplRes.data
      } else if (cplRes.data?.data && Array.isArray(cplRes.data.data)) {
        cplData = cplRes.data.data
      }
      setCplList(cplData)

      // Parse MK data
      let mkData: MataKuliah[] = []
      if (Array.isArray(mkRes.data)) {
        mkData = mkRes.data
      } else if (mkRes.data?.data && Array.isArray(mkRes.data.data)) {
        mkData = mkRes.data.data
      }
      setMataKuliahList(mkData)

      // Parse RPS data
      let rpsData: RPS[] = []
      if (Array.isArray(rpsRes.data)) {
        rpsData = rpsRes.data
      } else if (rpsRes.data?.data && Array.isArray(rpsRes.data.data)) {
        rpsData = rpsRes.data.data
      }
      setRpsList(rpsData)

      // Calculate report data
      const coursesWithRPS = new Set(rpsData.map(rps => rps.mata_kuliah_id)).size
      
      setReportData({
        rpsSubmissions: {
          total: dashboard?.total_rps || rpsData.length,
          approved: dashboard?.approved_rps || rpsData.filter(r => r.status === 'approved').length,
          pending: dashboard?.pending_review || rpsData.filter(r => r.status === 'submitted').length,
          rejected: dashboard?.rejected_rps || rpsData.filter(r => r.status === 'rejected' || r.status === 'revision').length
        },
        cplMapping: {
          totalCPL: dashboard?.total_cpl || cplData.length,
          publishedCPL: dashboard?.published_cpl || cplData.filter(c => c.status === 'published').length,
          draftCPL: dashboard?.draft_cpl || cplData.filter(c => c.status === 'draft').length,
          percentage: dashboard?.total_cpl ? Math.round((dashboard?.published_cpl || 0) / dashboard.total_cpl * 100) : 0
        },
        dosenActivity: {
          totalDosen: dashboard?.active_dosen || 0,
          activeAssignments: dashboard?.active_assignments || 0,
          completedAssignments: dashboard?.completed_assignments || 0,
          pendingAssignments: dashboard?.pending_assignments || 0
        },
        courseDistribution: {
          totalCourses: mkData.length,
          withRPS: coursesWithRPS,
          withoutRPS: mkData.length - coursesWithRPS
        }
      })

    } catch (err) {
      console.error('Error fetching report data:', err)
      setError('Gagal memuat data laporan. Pastikan server API berjalan.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportReport = () => {
    if (!reportData) return
    
    const reportContent = `
LAPORAN KURIKULUM
=================
Tanggal: ${new Date().toLocaleDateString('id-ID')}

1. RINGKASAN RPS
----------------
Total RPS: ${reportData.rpsSubmissions.total}
Disetujui: ${reportData.rpsSubmissions.approved}
Menunggu Review: ${reportData.rpsSubmissions.pending}
Ditolak/Revisi: ${reportData.rpsSubmissions.rejected}

2. CAPAIAN PEMBELAJARAN LULUSAN (CPL)
-------------------------------------
Total CPL: ${reportData.cplMapping.totalCPL}
CPL Aktif: ${reportData.cplMapping.publishedCPL}
CPL Draft: ${reportData.cplMapping.draftCPL}
Persentase Kelengkapan: ${reportData.cplMapping.percentage}%

3. AKTIVITAS DOSEN
------------------
Total Dosen Aktif: ${reportData.dosenActivity.totalDosen}
Penugasan Aktif: ${reportData.dosenActivity.activeAssignments}
Penugasan Selesai: ${reportData.dosenActivity.completedAssignments}
Menunggu: ${reportData.dosenActivity.pendingAssignments}

4. DISTRIBUSI MATA KULIAH
-------------------------
Total Mata Kuliah: ${reportData.courseDistribution.totalCourses}
Dengan RPS: ${reportData.courseDistribution.withRPS}
Tanpa RPS: ${reportData.courseDistribution.withoutRPS}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-kurikulum-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data laporan...</span>
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
            <h1 className="text-3xl font-bold text-slate-900">Laporan & Statistik</h1>
            <p className="text-slate-600">
              Ringkasan dan analisis data kurikulum
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportReport} disabled={!reportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        )}

        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{reportData.rpsSubmissions.total}</p>
                      <p className="text-sm text-slate-600">Total RPS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{reportData.cplMapping.totalCPL}</p>
                      <p className="text-sm text-slate-600">Total CPL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{reportData.dosenActivity.totalDosen}</p>
                      <p className="text-sm text-slate-600">Dosen Aktif</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{reportData.courseDistribution.totalCourses}</p>
                      <p className="text-sm text-slate-600">Mata Kuliah</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Reports */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* RPS Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Status RPS
                  </CardTitle>
                  <CardDescription>Distribusi status dokumen RPS</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Disetujui</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {reportData.rpsSubmissions.approved}
                      </Badge>
                    </div>
                    <Progress 
                      value={reportData.rpsSubmissions.total > 0 
                        ? (reportData.rpsSubmissions.approved / reportData.rpsSubmissions.total * 100) 
                        : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Menunggu Review</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {reportData.rpsSubmissions.pending}
                      </Badge>
                    </div>
                    <Progress 
                      value={reportData.rpsSubmissions.total > 0 
                        ? (reportData.rpsSubmissions.pending / reportData.rpsSubmissions.total * 100) 
                        : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Ditolak/Revisi</span>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        {reportData.rpsSubmissions.rejected}
                      </Badge>
                    </div>
                    <Progress 
                      value={reportData.rpsSubmissions.total > 0 
                        ? (reportData.rpsSubmissions.rejected / reportData.rpsSubmissions.total * 100) 
                        : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CPL Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Status CPL
                  </CardTitle>
                  <CardDescription>Kelengkapan Capaian Pembelajaran Lulusan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e2e8f0"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#22c55e"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${reportData.cplMapping.percentage * 2.51} 251`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{reportData.cplMapping.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{reportData.cplMapping.publishedCPL}</p>
                      <p className="text-sm text-green-600">CPL Aktif</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-700">{reportData.cplMapping.draftCPL}</p>
                      <p className="text-sm text-slate-600">CPL Draft</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    Distribusi Mata Kuliah
                  </CardTitle>
                  <CardDescription>Status kelengkapan RPS per mata kuliah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Dengan RPS</span>
                          <span className="text-sm font-medium">{reportData.courseDistribution.withRPS}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className="bg-green-500 h-4 rounded-full"
                            style={{ 
                              width: `${reportData.courseDistribution.totalCourses > 0 
                                ? (reportData.courseDistribution.withRPS / reportData.courseDistribution.totalCourses * 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Tanpa RPS</span>
                          <span className="text-sm font-medium">{reportData.courseDistribution.withoutRPS}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className="bg-red-500 h-4 rounded-full"
                            style={{ 
                              width: `${reportData.courseDistribution.totalCourses > 0 
                                ? (reportData.courseDistribution.withoutRPS / reportData.courseDistribution.totalCourses * 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-center text-sm text-slate-600">
                        <span className="font-semibold text-green-600">
                          {reportData.courseDistribution.totalCourses > 0 
                            ? Math.round(reportData.courseDistribution.withRPS / reportData.courseDistribution.totalCourses * 100) 
                            : 0}%
                        </span>
                        {' '}mata kuliah sudah memiliki RPS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dosen Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Aktivitas Dosen
                  </CardTitle>
                  <CardDescription>Ringkasan penugasan dan aktivitas dosen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-700">{reportData.dosenActivity.totalDosen}</p>
                      <p className="text-sm text-purple-600">Dosen Aktif</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{reportData.dosenActivity.activeAssignments}</p>
                      <p className="text-sm text-blue-600">Penugasan Aktif</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">{reportData.dosenActivity.completedAssignments}</p>
                      <p className="text-sm text-green-600">Selesai</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-700">{reportData.dosenActivity.pendingAssignments}</p>
                      <p className="text-sm text-yellow-600">Menunggu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CPL List */}
            {cplList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daftar CPL</CardTitle>
                  <CardDescription>Capaian Pembelajaran Lulusan yang terdaftar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cplList.slice(0, 5).map(cpl => (
                      <div key={cpl.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{cpl.kode}</Badge>
                          <p className="text-sm text-slate-700 line-clamp-1">{cpl.deskripsi}</p>
                        </div>
                        <Badge className={cpl.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                          {cpl.status === 'published' ? 'Aktif' : 'Draft'}
                        </Badge>
                      </div>
                    ))}
                    {cplList.length > 5 && (
                      <p className="text-center text-sm text-slate-500">
                        +{cplList.length - 5} CPL lainnya
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
