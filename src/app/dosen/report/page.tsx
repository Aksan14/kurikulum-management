"use client"

import React, { useState } from "react"
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
  Award
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockRPS, mockCPLs, mockAssignments, mockUsers } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"

export default function DosenReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024/2025")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  // Filter data for current dosen (simulation)
  const dosenId = "2" // Assuming current user is dosen-2
  const dosenAssignments = mockAssignments.filter(a => a.dosenId === dosenId)
  const dosenRPS = mockRPS.filter(rps => rps.dosenId === dosenId)

  const stats = {
    totalCPL: dosenAssignments.length,
    activeMataKuliah: dosenRPS.length,
    completedRPS: dosenRPS.filter(rps => rps.status === "approved").length,
    pendingRPS: dosenRPS.filter(rps => rps.status === "submitted").length
  }

  const cplProgress = mockCPLs.map(cpl => {
    const assignment = dosenAssignments.find(a => a.cplId === cpl.id)
    const rps = assignment ? dosenRPS.find(r => r.mataKuliahId === assignment.mataKuliah) : null
    
    return {
      ...cpl,
      status: assignment ? assignment.status : "not-assigned",
      rpsStatus: rps ? rps.status : null,
      mataKuliah: assignment ? assignment.mataKuliah : null
    }
  }).filter(cpl => cpl.status !== "not-assigned")

  const chartData = [
    { name: "CPL Ditugaskan", value: dosenAssignments.length, color: "bg-blue-500" },
    { name: "RPS Selesai", value: stats.completedRPS, color: "bg-green-500" },
    { name: "RPS Pending", value: stats.pendingRPS, color: "bg-yellow-500" },
  ]

  // Get dosen user (second user in mockUsers)
  const dosenUser = mockUsers.find(user => user.role === 'dosen') || mockUsers[1]

  return (
    <DashboardLayout user={{...dosenUser, role: 'dosen'}} unreadNotifications={2}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis</h1>
            <p className="text-gray-600 mt-1">Pantau progres dan kinerja pengembangan kurikulum Anda</p>
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
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalCPL}</p>
                  <p className="text-sm text-blue-700">Total CPL</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.activeMataKuliah}</p>
                  <p className="text-sm text-green-700">Mata Kuliah Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.completedRPS}</p>
                  <p className="text-sm text-purple-700">RPS Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingRPS}</p>
                  <p className="text-sm text-yellow-700">RPS Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpl-progress">Progress CPL</TabsTrigger>
            <TabsTrigger value="rps-detail">Detail RPS</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribusi Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{item.name}</span>
                          <span className="text-sm font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.value / stats.totalCPL) * 100}%` }}
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
                    <TrendingUp className="h-5 w-5" />
                    Kinerja Bulanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">RPS Diselesaikan</p>
                        <p className="text-sm text-green-600">Bulan ini</p>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {stats.completedRPS}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Tingkat Penyelesaian</p>
                        <p className="text-sm text-blue-600">Dari total penugasan</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {stats.totalCPL > 0 ? Math.round((stats.completedRPS / stats.totalCPL) * 100) : 0}%
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-900">Waktu Rata-rata</p>
                        <p className="text-sm text-purple-600">Penyelesaian RPS</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">
                        7 hari
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
                  {dosenRPS.slice(0, 5).map((rps) => (
                    <div key={rps.id} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">RPS - {rps.mataKuliahId}</p>
                        <p className="text-sm text-gray-600">RPS {rps.status === "approved" ? "disetujui" : "menunggu review"}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(rps.createdAt)}</p>
                      </div>
                      <Badge className={
                        rps.status === "approved" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }>
                        {rps.status === "approved" ? "Disetujui" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cpl-progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress CPL yang Ditugaskan</CardTitle>
                <CardDescription>
                  Pantau status pengembangan setiap CPL yang menjadi tanggung jawab Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cplProgress.map((cpl) => (
                    <div key={cpl.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-600 text-white">{cpl.kode}</Badge>
                            {cpl.status === "done" && (
                              <Badge className="bg-green-100 text-green-700">
                                <Award className="h-3 w-3 mr-1" />
                                Selesai
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{cpl.judul}</h3>
                          <p className="text-sm text-gray-600 mt-1">{cpl.deskripsi}</p>
                          {cpl.mataKuliah && (
                            <p className="text-sm font-medium text-blue-600 mt-2">
                              Mata Kuliah: {cpl.mataKuliah}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{cpl.rpsStatus === "approved" ? "100%" : cpl.rpsStatus === "submitted" ? "80%" : "0%"}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                cpl.rpsStatus === "approved" 
                                  ? "bg-green-500" 
                                  : cpl.rpsStatus === "submitted" 
                                    ? "bg-yellow-500" 
                                    : "bg-gray-300"
                              }`}
                              style={{ 
                                width: `${
                                  cpl.rpsStatus === "approved" 
                                    ? "100" 
                                    : cpl.rpsStatus === "submitted" 
                                      ? "80" 
                                      : "0"
                                }%` 
                              }}
                            />
                          </div>
                        </div>
                        
                        {cpl.rpsStatus && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Lihat RPS
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rps-detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail RPS yang Dikembangkan</CardTitle>
                <CardDescription>
                  Informasi lengkap tentang RPS yang telah Anda buat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dosenRPS.map((rps) => (
                    <div key={rps.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{rps.mataKuliahId}</h3>
                          <p className="text-gray-600">RPS - {rps.semester} SKS</p>
                        </div>
                        <Badge className={
                          rps.status === "approved" 
                            ? "bg-green-100 text-green-700" 
                            : rps.status === "submitted"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }>
                          {rps.status === "approved" ? "Disetujui" : rps.status === "submitted" ? "Pending Review" : "Draft"}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">CPMK</p>
                          <p className="text-2xl font-bold text-blue-600">{rps.cpmk?.length || 0}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Pertemuan</p>
                          <p className="text-2xl font-bold text-green-600">16</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Penilaian</p>
                          <p className="text-2xl font-bold text-purple-600">5</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Dibuat: {formatDate(rps.createdAt)}</span>
                          <span>Diperbarui: {formatDate(rps.updatedAt)}</span>
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