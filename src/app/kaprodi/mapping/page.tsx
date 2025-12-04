"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  GitBranch,
  Download,
  Filter,
  CheckCircle,
  Circle,
  Info,
  Grid3X3,
  List,
  FileSpreadsheet
} from "lucide-react"
import { mockUsers, mockCPLs, mockRPS, mockMataKuliah } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// Mapping level colors
const levelColors = {
  tinggi: { bg: 'bg-emerald-500', text: 'text-white', label: 'Tinggi (T)' },
  sedang: { bg: 'bg-amber-400', text: 'text-slate-900', label: 'Sedang (S)' },
  rendah: { bg: 'bg-blue-400', text: 'text-white', label: 'Rendah (R)' },
  none: { bg: 'bg-slate-100', text: 'text-slate-400', label: '-' }
}

// Mock mapping data
const mockMappingData = [
  { mkId: 'mk1', cplId: '1', level: 'tinggi' },
  { mkId: 'mk1', cplId: '3', level: 'sedang' },
  { mkId: 'mk2', cplId: '3', level: 'tinggi' },
  { mkId: 'mk2', cplId: '5', level: 'sedang' },
  { mkId: 'mk2', cplId: '6', level: 'tinggi' },
  { mkId: 'mk3', cplId: '1', level: 'sedang' },
  { mkId: 'mk3', cplId: '3', level: 'rendah' },
  { mkId: 'mk4', cplId: '2', level: 'sedang' },
  { mkId: 'mk4', cplId: '5', level: 'tinggi' },
  { mkId: 'mk5', cplId: '1', level: 'tinggi' },
  { mkId: 'mk5', cplId: '3', level: 'tinggi' },
  { mkId: 'mk6', cplId: '1', level: 'tinggi' },
  { mkId: 'mk7', cplId: '1', level: 'tinggi' },
  { mkId: 'mk7', cplId: '3', level: 'sedang' },
  { mkId: 'mk8', cplId: '3', level: 'tinggi' },
  { mkId: 'mk8', cplId: '6', level: 'sedang' },
]

export default function MappingPage() {
  const user = mockUsers[0]
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix')
  const [filterSemester, setFilterSemester] = useState<string>('all')

  const publishedCPLs = mockCPLs.filter(cpl => cpl.status === 'published')
  
  const filteredMK = filterSemester === 'all' 
    ? mockMataKuliah 
    : mockMataKuliah.filter(mk => mk.semester === Number(filterSemester))

  const getMapping = (mkId: string, cplId: string) => {
    const mapping = mockMappingData.find(m => m.mkId === mkId && m.cplId === cplId)
    return mapping?.level || 'none'
  }

  const getCPLStats = (cplId: string) => {
    const mappings = mockMappingData.filter(m => m.cplId === cplId)
    return {
      total: mappings.length,
      tinggi: mappings.filter(m => m.level === 'tinggi').length,
      sedang: mappings.filter(m => m.level === 'sedang').length,
      rendah: mappings.filter(m => m.level === 'rendah').length,
    }
  }

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mapping CPL - Mata Kuliah</h1>
            <p className="mt-1 text-slate-500">
              Matriks pemetaan Capaian Pembelajaran Lulusan dengan Mata Kuliah
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Legend & Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Keterangan:</span>
                <div className="flex items-center gap-2">
                  <div className={cn("h-6 w-6 rounded", levelColors.tinggi.bg)} />
                  <span className="text-sm">Tinggi (T)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-6 w-6 rounded", levelColors.sedang.bg)} />
                  <span className="text-sm">Sedang (S)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-6 w-6 rounded", levelColors.rendah.bg)} />
                  <span className="text-sm">Rendah (R)</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg border border-slate-200 p-1">
                  <Button 
                    variant={viewMode === 'matrix' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('matrix')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                Matriks CPL - Mata Kuliah
              </CardTitle>
              <CardDescription>
                Klik pada sel untuk mengubah level pemetaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white border border-slate-200 p-3 text-left min-w-[200px]">
                        <span className="text-sm font-semibold text-slate-700">Mata Kuliah</span>
                      </th>
                      {publishedCPLs.map((cpl) => (
                        <th key={cpl.id} className="border border-slate-200 p-2 text-center min-w-[80px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono font-bold text-blue-600">{cpl.kode}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-2">{cpl.judul}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMK.map((mk) => (
                      <tr key={mk.id} className="hover:bg-slate-50">
                        <td className="sticky left-0 z-10 bg-white border border-slate-200 p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-500">{mk.kode}</span>
                              <Badge variant="outline" className="text-[10px]">
                                S{mk.semester}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-900">{mk.nama}</p>
                          </div>
                        </td>
                        {publishedCPLs.map((cpl) => {
                          const level = getMapping(mk.id, cpl.id) as keyof typeof levelColors
                          const colors = levelColors[level]
                          
                          return (
                            <td 
                              key={cpl.id} 
                              className="border border-slate-200 p-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <div 
                                className={cn(
                                  "mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold",
                                  colors.bg, colors.text
                                )}
                              >
                                {level === 'tinggi' ? 'T' : level === 'sedang' ? 'S' : level === 'rendah' ? 'R' : ''}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* CPL Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan per CPL</CardTitle>
                <CardDescription>Jumlah mata kuliah yang mendukung setiap CPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {publishedCPLs.map((cpl) => {
                  const stats = getCPLStats(cpl.id)
                  const coverage = (stats.total / mockMataKuliah.length) * 100
                  
                  return (
                    <div key={cpl.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-blue-600">{cpl.kode}</span>
                            <Badge variant="outline">{cpl.aspek}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{cpl.judul}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
                          <p className="text-xs text-slate-500">Mata Kuliah</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                          <div 
                            className="bg-emerald-500" 
                            style={{ width: `${(stats.tinggi / mockMataKuliah.length) * 100}%` }} 
                          />
                          <div 
                            className="bg-amber-400" 
                            style={{ width: `${(stats.sedang / mockMataKuliah.length) * 100}%` }} 
                          />
                          <div 
                            className="bg-blue-400" 
                            style={{ width: `${(stats.rendah / mockMataKuliah.length) * 100}%` }} 
                          />
                        </div>
                        <div className="mt-2 flex gap-4 text-xs text-slate-500">
                          <span>Tinggi: {stats.tinggi}</span>
                          <span>Sedang: {stats.sedang}</span>
                          <span>Rendah: {stats.rendah}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* MK Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan per Mata Kuliah</CardTitle>
                <CardDescription>CPL yang didukung oleh setiap mata kuliah</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredMK.map((mk) => {
                  const mappings = mockMappingData.filter(m => m.mkId === mk.id)
                  
                  return (
                    <div key={mk.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">{mk.kode}</span>
                            <Badge variant="outline" className="text-[10px]">S{mk.semester}</Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{mk.nama}</p>
                        </div>
                        <Badge>{mappings.length} CPL</Badge>
                      </div>
                      {mappings.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {mappings.map((m) => {
                            const cpl = publishedCPLs.find(c => c.id === m.cplId)
                            const level = m.level as keyof typeof levelColors
                            
                            return (
                              <Badge 
                                key={m.cplId}
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  level === 'tinggi' && "border-emerald-300 bg-emerald-50 text-emerald-700",
                                  level === 'sedang' && "border-amber-300 bg-amber-50 text-amber-700",
                                  level === 'rendah' && "border-blue-300 bg-blue-50 text-blue-700"
                                )}
                              >
                                {cpl?.kode}
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-900">{publishedCPLs.length}</p>
                <p className="text-sm text-blue-700">Total CPL Published</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-900">{mockMataKuliah.length}</p>
                <p className="text-sm text-emerald-700">Total Mata Kuliah</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-900">{mockMappingData.length}</p>
                <p className="text-sm text-amber-700">Total Mapping</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-900">
                  {((mockMappingData.length / (publishedCPLs.length * mockMataKuliah.length)) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-purple-700">Coverage Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
