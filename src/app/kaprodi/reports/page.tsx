"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Filter,
  RefreshCw,
  Eye,
  Share,
  Printer
} from 'lucide-react'


interface ReportData {
  rpsSubmissions: {
    total: number
    approved: number
    pending: number
    rejected: number
    byMonth: { month: string; count: number }[]
  }
  cplMapping: {
    totalCPL: number
    mappedCPL: number
    percentage: number
    byCourse: { course: string; mapped: number; total: number }[]
  }
  dosenActivity: {
    totalDosen: number
    activeDosen: number
    submissions: number
    avgResponseTime: string
  }
  courseDistribution: {
    totalCourses: number
    withRPS: number
    withoutRPS: number
    byCategory: { category: string; count: number; color: string }[]
  }
}

const mockReportData: ReportData = {
  rpsSubmissions: {
    total: 45,
    approved: 32,
    pending: 8,
    rejected: 5,
    byMonth: [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 8 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 10 }
    ]
  },
  cplMapping: {
    totalCPL: 12,
    mappedCPL: 9,
    percentage: 75,
    byCourse: [
      { course: 'Algoritma dan Pemrograman', mapped: 8, total: 10 },
      { course: 'Basis Data', mapped: 6, total: 8 },
      { course: 'Jaringan Komputer', mapped: 7, total: 9 },
      { course: 'Web Programming', mapped: 5, total: 7 }
    ]
  },
  dosenActivity: {
    totalDosen: 15,
    activeDosen: 12,
    submissions: 28,
    avgResponseTime: '2.5 hari'
  },
  courseDistribution: {
    totalCourses: 24,
    withRPS: 18,
    withoutRPS: 6,
    byCategory: [
      { category: 'Wajib', count: 15, color: 'bg-blue-500' },
      { category: 'Pilihan', count: 7, color: 'bg-green-500' },
      { category: 'Praktek', count: 2, color: 'bg-yellow-500' }
    ]
  }
}

export default function ReportsPage() {
  const [reportData] = useState<ReportData>(mockReportData)
  const [selectedPeriod, setSelectedPeriod] = useState('semester-current')
  const [reportType, setReportType] = useState<'overview' | 'rps' | 'cpl' | 'dosen' | 'courses'>('overview')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Laporan berhasil diunduh!')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Gagal membuat laporan!')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Laporan berhasil diexport ke ${format.toUpperCase()}!`)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Gagal export laporan!')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Laporan & Analisis</h1>
            <p className="text-slate-600">
              Dashboard analisis dan laporan aktivitas kurikulum
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={generateReport} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="period">Periode</Label>
                  <select
                    id="period"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="semester-current">Semester Ini</option>
                    <option value="semester-last">Semester Lalu</option>
                    <option value="year-current">Tahun Akademik Ini</option>
                    <option value="year-last">Tahun Akademik Lalu</option>
                    <option value="custom">Kustom</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="report-type">Jenis Laporan</Label>
                  <select
                    id="report-type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="overview">Overview</option>
                    <option value="rps">RPS Analysis</option>
                    <option value="cpl">CPL Mapping</option>
                    <option value="dosen">Aktivitas Dosen</option>
                    <option value="courses">Distribusi Mata Kuliah</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 md:ml-auto">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Lanjutan
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total RPS</p>
                  <p className="text-3xl font-bold text-slate-900">{reportData.rpsSubmissions.total}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+12% dari bulan lalu</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">RPS Disetujui</p>
                  <p className="text-3xl font-bold text-slate-900">{reportData.rpsSubmissions.approved}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-600">
                      {Math.round((reportData.rpsSubmissions.approved / reportData.rpsSubmissions.total) * 100)}% approval rate
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">CPL Mapping</p>
                  <p className="text-3xl font-bold text-slate-900">{reportData.cplMapping.percentage}%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Target className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-slate-600">
                      {reportData.cplMapping.mappedCPL}/{reportData.cplMapping.totalCPL} CPL
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Dosen Aktif</p>
                  <p className="text-3xl font-bold text-slate-900">{reportData.dosenActivity.activeDosen}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-slate-600">
                      dari {reportData.dosenActivity.totalDosen} total dosen
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* RPS Submissions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Pengajuan RPS per Bulan
              </CardTitle>
              <CardDescription>
                Tren pengajuan RPS dalam 4 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reportData.rpsSubmissions.byMonth.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium text-slate-600">
                      {item.month}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">{item.count} submissions</span>
                        <span className="text-sm font-medium">{Math.round((item.count / 15) * 100)}%</span>
                      </div>
                      <Progress value={(item.count / 15) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RPS Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Status RPS
              </CardTitle>
              <CardDescription>
                Distribusi status RPS saat ini
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-slate-900">Disetujui</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{reportData.rpsSubmissions.approved}</p>
                    <p className="text-sm text-slate-600">
                      {Math.round((reportData.rpsSubmissions.approved / reportData.rpsSubmissions.total) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-slate-900">Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{reportData.rpsSubmissions.pending}</p>
                    <p className="text-sm text-slate-600">
                      {Math.round((reportData.rpsSubmissions.pending / reportData.rpsSubmissions.total) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-slate-900">Ditolak</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{reportData.rpsSubmissions.rejected}</p>
                    <p className="text-sm text-slate-600">
                      {Math.round((reportData.rpsSubmissions.rejected / reportData.rpsSubmissions.total) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CPL Mapping Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Analisis Pemetaan CPL
            </CardTitle>
            <CardDescription>
              Status pemetaan CPL per mata kuliah
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {reportData.cplMapping.byCourse.map((course, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">{course.course}</h4>
                    <Badge 
                      className={
                        (course.mapped / course.total) >= 0.8 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : (course.mapped / course.total) >= 0.6
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {Math.round((course.mapped / course.total) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">
                          {course.mapped} dari {course.total} CPL
                        </span>
                      </div>
                      <Progress value={(course.mapped / course.total) * 100} className="h-2" />
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Distribution and Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Course Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Distribusi Mata Kuliah
              </CardTitle>
              <CardDescription>
                Kategori mata kuliah berdasarkan jenis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reportData.courseDistribution.byCategory.map((category, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{category.category}</span>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                      <Progress 
                        value={(category.count / reportData.courseDistribution.totalCourses) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="font-bold text-green-600">{reportData.courseDistribution.withRPS}</p>
                      <p className="text-slate-600">Dengan RPS</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="font-bold text-red-600">{reportData.courseDistribution.withoutRPS}</p>
                      <p className="text-slate-600">Tanpa RPS</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dosen Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Aktivitas Dosen
              </CardTitle>
              <CardDescription>
                Ringkasan aktivitas dosen bulan ini
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{reportData.dosenActivity.totalDosen}</p>
                    <p className="text-sm text-slate-600">Total Dosen</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{reportData.dosenActivity.activeDosen}</p>
                    <p className="text-sm text-slate-600">Dosen Aktif</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium">Total Submissions</span>
                    </div>
                    <span className="font-bold">{reportData.dosenActivity.submissions}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium">Avg Response Time</span>
                    </div>
                    <span className="font-bold">{reportData.dosenActivity.avgResponseTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Activity Rate</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {Math.round((reportData.dosenActivity.activeDosen / reportData.dosenActivity.totalDosen) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Laporan</CardTitle>
            <CardDescription>
              Pilih format export yang diinginkan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('excel')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}