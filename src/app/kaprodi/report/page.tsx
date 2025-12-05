"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  FileText,
  Download,
  Filter,
  BookOpen,
  PieChart,
  Activity,
  CheckSquare,
  Clock,
  Award,
  School,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { rpsService, RPS } from "@/lib/api/rps"
import { cplService, CPL } from "@/lib/api/cpl"
import { formatDate } from "@/lib/utils"

export default function KaprodiReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024/2025")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [cplList, setCplList] = useState<CPL[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [rpsRes, cplRes] = await Promise.all([
        rpsService.getAll(),
        cplService.getAll()
      ])
      setRpsList(rpsRes.data?.data || [])
      setCplList(cplRes.data?.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate stats from API data
  const stats = {
    totalCPL: cplList.length,
    publishedCPL: cplList.filter(cpl => cpl.status === "published").length,
    totalRPS: rpsList.length,
    approvedRPS: rpsList.filter(rps => rps.status === "approved").length,
    totalAssignments: rpsList.length, // Use RPS count as proxy
    completedAssignments: rpsList.filter(rps => rps.status === "approved").length,
    totalDosen: new Set(rpsList.map(rps => rps.dosen_id)).size,
    activeDosen: new Set(rpsList.filter(rps => rps.status === "approved").map(rps => rps.dosen_id)).size
  }

  // CPL by status instead of aspek
  const cplByStatus = cplList.reduce((acc, cpl) => {
    const status = cpl.status || 'draft'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Dosen performance from RPS data
  const dosenMap = new Map<string, {
    id: string
    nama: string
    email: string
    totalRPS: number
    approvedRPS: number
    completionRate: number
  }>()
  
  rpsList.forEach(rps => {
    const dosenId = String(rps.dosen_id)
    if (!dosenMap.has(dosenId)) {
      dosenMap.set(dosenId, {
        id: dosenId,
        nama: rps.dosen_nama || `Dosen ${dosenId}`,
        email: '-',
        totalRPS: 0,
        approvedRPS: 0,
        completionRate: 0
      })
    }
    const dosen = dosenMap.get(dosenId)!
    dosen.totalRPS++
    if (rps.status === 'approved') dosen.approvedRPS++
    dosen.completionRate = Math.round((dosen.approvedRPS / dosen.totalRPS) * 100)
  })
  
  const dosenPerformance = Array.from(dosenMap.values())

  const monthlyProgress = [
    { month: "Okt 2024", cpl: Math.min(12, cplList.length), rps: Math.min(25, rpsList.length), assignments: 18 },
    { month: "Nov 2024", cpl: Math.min(15, cplList.length), rps: Math.min(32, rpsList.length), assignments: 24 },
    { month: "Des 2024", cpl: Math.min(18, cplList.length), rps: Math.min(38, rpsList.length), assignments: 28 },
    { month: "Jan 2025", cpl: cplList.length, rps: rpsList.length, assignments: 35 }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-red-600">{error}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis Kurikulum</h1>
            <p className="text-gray-600 mt-1">Dashboard komprehensif untuk monitoring dan evaluasi kurikulum program studi</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2023/2024">2023/2024</SelectItem>
                <SelectItem value="2022/2023">2022/2023</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export Laporan
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.publishedCPL}/{stats.totalCPL}</p>
                  <p className="text-sm text-purple-700">CPL Published</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+12%</span>
                  <span className="text-gray-500">dari bulan lalu</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.approvedRPS}/{stats.totalRPS}</p>
                  <p className="text-sm text-blue-700">RPS Approved</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+8%</span>
                  <span className="text-gray-500">dari bulan lalu</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.activeDosen}/{stats.totalDosen}</p>
                  <p className="text-sm text-green-700">Dosen Aktif</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <Minus className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">0%</span>
                  <span className="text-gray-500">sama dengan bulan lalu</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}%</p>
                  <p className="text-sm text-orange-700">Completion Rate</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+5%</span>
                  <span className="text-gray-500">dari bulan lalu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpl-analysis">Analisis CPL</TabsTrigger>
            <TabsTrigger value="dosen-performance">Kinerja Dosen</TabsTrigger>
            <TabsTrigger value="trends">Tren & Progres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribusi CPL per Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(cplByStatus).map(([status, count]) => (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
                          <span className="text-sm font-bold">{count as number} CPL</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === "published" ? "bg-green-500" :
                              status === "draft" ? "bg-yellow-500" :
                              "bg-gray-500"
                            }`}
                            style={{ width: `${((count as number) / stats.totalCPL) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Status Kurikulum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">CPL Siap Pakai</p>
                        <p className="text-sm text-green-600">Status: Published</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">{stats.publishedCPL}</div>
                        <div className="text-xs text-green-600">{Math.round((stats.publishedCPL / stats.totalCPL) * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">RPS Disetujui</p>
                        <p className="text-sm text-blue-600">Status: Approved</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-700">{stats.approvedRPS}</div>
                        <div className="text-xs text-blue-600">{Math.round((stats.approvedRPS / stats.totalRPS) * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-900">Assignment Selesai</p>
                        <p className="text-sm text-purple-600">Status: Done</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-700">{stats.completedAssignments}</div>
                        <div className="text-xs text-purple-600">{Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Aktivitas Terkini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "RPS Disetujui", item: "Struktur Data - Dr. Budi Santoso", date: "2024-01-20", type: "approved", status: "success" },
                    { action: "CPL Baru Dibuat", item: "CPL-07: Kemampuan Komunikasi", date: "2024-01-19", type: "created", status: "info" },
                    { action: "Assignment Diterima", item: "CPL-03 oleh Dr. Sari Wahyuni", date: "2024-01-18", type: "accepted", status: "success" },
                    { action: "RPS Perlu Review", item: "Algoritma - Dr. Ahmad Fauzi", date: "2024-01-17", type: "pending", status: "warning" },
                    { action: "Mapping Updated", item: "Pemetaan CPL-RPS Semester Genap", date: "2024-01-15", type: "updated", status: "info" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.status === "success" ? "bg-green-100" :
                        activity.status === "warning" ? "bg-yellow-100" :
                        "bg-blue-100"
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          activity.status === "success" ? "text-green-600" :
                          activity.status === "warning" ? "text-yellow-600" :
                          "text-blue-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.item}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                      </div>
                      <Badge className={
                        activity.status === "success" ? "bg-green-100 text-green-700" :
                        activity.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }>
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cpl-analysis" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analisis CPL per Status</CardTitle>
                  <CardDescription>Distribusi CPL berdasarkan status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(cplByStatus).map(([status, count]) => {
                      const statusCount = count as number
                      
                      return (
                        <div key={status} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 capitalize">{status}</h3>
                            <Badge variant="outline">{statusCount} CPL</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={status === 'published' ? "text-green-600" : "text-gray-600"}>
                                {status === 'published' ? 'Siap digunakan' : 'Menunggu review'}
                              </span>
                            </div>
                            <Progress value={(statusCount / stats.totalCPL) * 100} className="h-2" />
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Persentase: {Math.round((statusCount / stats.totalCPL) * 100)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coverage Matrix</CardTitle>
                  <CardDescription>Pemetaan cakupan CPL terhadap mata kuliah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cplList.slice(0, 8).map((cpl) => {
                      const mappedRPS = Math.floor(Math.random() * 5) + 1 // Simulate mapping
                      const totalRPS = 10 // Simulate total possible RPS
                      const coverage = (mappedRPS / totalRPS) * 100
                      
                      return (
                        <div key={cpl.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 text-white">{cpl.kode}</Badge>
                              <span className="text-sm font-medium text-gray-900">{cpl.nama}</span>
                            </div>
                            <span className="text-xs text-gray-500">{mappedRPS}/{totalRPS}</span>
                          </div>
                          <Progress value={coverage} className="h-1" />
                          <div className="text-xs text-gray-500">
                            Coverage: {Math.round(coverage)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dosen-performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kinerja Dosen dalam Pengembangan Kurikulum</CardTitle>
                <CardDescription>Analisis kontribusi dan produktivitas setiap dosen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dosenPerformance.slice(0, 8).map((dosen) => (
                    <div key={dosen.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{dosen.nama}</h3>
                          <p className="text-sm text-gray-600">{dosen.email}</p>
                        </div>
                        <Badge className={
                          dosen.completionRate >= 80 ? "bg-green-100 text-green-700" :
                          dosen.completionRate >= 60 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }>
                          {dosen.completionRate}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-600">{dosen.totalRPS}</p>
                          <p className="text-xs text-blue-700">Total CPL</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-600">{dosen.approvedRPS}</p>
                          <p className="text-xs text-green-700">Selesai</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-lg font-bold text-purple-600">{dosen.totalRPS}</p>
                          <p className="text-xs text-purple-700">RPS Dibuat</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="text-lg font-bold text-orange-600">{dosen.approvedRPS}</p>
                          <p className="text-xs text-orange-700">RPS Approved</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress Penyelesaian</span>
                          <span>{dosen.completionRate}%</span>
                        </div>
                        <Progress value={dosen.completionRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tren Pengembangan Kurikulum
                </CardTitle>
                <CardDescription>Progres bulanan dalam pengembangan CPL, RPS, dan Assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyProgress.map((month) => (
                    <div key={month.month} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">{month.month}</h3>
                        <div className="flex gap-4 text-sm">
                          <span className="text-purple-600">CPL: {month.cpl}</span>
                          <span className="text-blue-600">RPS: {month.rps}</span>
                          <span className="text-green-600">Assignment: {month.assignments}</span>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-700">CPL Progress</span>
                            <span>{month.cpl}/20</span>
                          </div>
                          <Progress value={(month.cpl / 20) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">RPS Progress</span>
                            <span>{month.rps}/50</span>
                          </div>
                          <Progress value={(month.rps / 50) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Assignment Progress</span>
                            <span>{month.assignments}/40</span>
                          </div>
                          <Progress value={(month.assignments / 40) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}