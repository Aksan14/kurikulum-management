"use client"

import { useState, useEffect, useCallback } from "react"
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
  FileSpreadsheet,
  Loader2,
  Save,
  AlertCircle
} from "lucide-react"
import { cplService, CPL } from "@/lib/api/cpl"
import { mataKuliahService, MataKuliah } from "@/lib/api/mata-kuliah"
import { cplMKMappingService, CPLMKMapping } from "@/lib/api/cpl-mk-mapping"
import { cn } from "@/lib/utils"

// Mapping level colors
const levelColors = {
  tinggi: { bg: 'bg-emerald-500', text: 'text-white', label: 'Tinggi (T)' },
  sedang: { bg: 'bg-amber-400', text: 'text-slate-900', label: 'Sedang (S)' },
  rendah: { bg: 'bg-blue-400', text: 'text-white', label: 'Rendah (R)' },
  none: { bg: 'bg-slate-100', text: 'text-slate-400', label: '-' }
}

interface MappingData {
  id?: string
  mkId: string
  cplId: string
  level: string
}

export default function MappingPage() {
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix')
  const [filterSemester, setFilterSemester] = useState<string>('all')
  const [cplList, setCplList] = useState<CPL[]>([])
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [mappingData, setMappingData] = useState<MappingData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [cplRes, mkRes, mappingRes] = await Promise.all([
        cplService.getAll({ limit: 100 }),
        mataKuliahService.getAll({ limit: 100 }),
        cplMKMappingService.getAll({ limit: 1000 })
      ])
      
      console.log('CPL Response:', cplRes)
      console.log('MK Response:', mkRes)
      console.log('Mapping Response:', mappingRes)
      
      // Handle different response structures
      let cplData: CPL[] = []
      if (Array.isArray(cplRes.data)) {
        cplData = cplRes.data
      } else if (cplRes.data?.data && Array.isArray(cplRes.data.data)) {
        cplData = cplRes.data.data
      }
      
      let mkData: MataKuliah[] = []
      if (Array.isArray(mkRes.data)) {
        mkData = mkRes.data
      } else if (mkRes.data?.data && Array.isArray(mkRes.data.data)) {
        mkData = mkRes.data.data
      }
      
      console.log('CPL Data:', cplData)
      console.log('MK Data:', mkData)
      
      setCplList(cplData)
      setMataKuliahList(mkData)
      
      // Transform API mapping data to local format
      let apiMappings: CPLMKMapping[] = []
      if (Array.isArray(mappingRes.data)) {
        apiMappings = mappingRes.data
      } else if (mappingRes.data?.data && Array.isArray(mappingRes.data.data)) {
        apiMappings = mappingRes.data.data
      }
      
      const transformedMappings: MappingData[] = apiMappings.map((m: CPLMKMapping) => ({
        id: m.id,
        mkId: m.mata_kuliah_id,
        cplId: m.cpl_id,
        level: m.level
      }))
      setMappingData(transformedMappings)
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Gagal memuat data mapping')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  // Filter CPL - show published first, but show all if no published CPLs exist
  const publishedCPLs = cplList.filter(cpl => cpl.status === 'published')
  const displayCPLs = publishedCPLs.length > 0 ? publishedCPLs : cplList
  
  const filteredMK = filterSemester === 'all' 
    ? mataKuliahList 
    : mataKuliahList.filter(mk => mk.semester === Number(filterSemester))

  const getMapping = (mkId: string, cplId: string) => {
    const mapping = mappingData.find(m => m.mkId === mkId && m.cplId === cplId)
    return mapping?.level || 'none'
  }

  const getMappingId = (mkId: string, cplId: string) => {
    const mapping = mappingData.find(m => m.mkId === mkId && m.cplId === cplId)
    return mapping?.id
  }

  const getCPLStats = (cplId: string) => {
    const mappings = mappingData.filter(m => m.cplId === cplId)
    return {
      total: mappings.length,
      tinggi: mappings.filter(m => m.level === 'tinggi').length,
      sedang: mappings.filter(m => m.level === 'sedang').length,
      rendah: mappings.filter(m => m.level === 'rendah').length,
    }
  }

  // Handle mapping level change - cycle through: none -> tinggi -> sedang -> rendah -> none
  // Saves directly to API
  const handleMappingClick = async (mkId: string, cplId: string) => {
    const currentLevel = getMapping(mkId, cplId)
    const existingId = getMappingId(mkId, cplId)
    
    const levelCycle: Record<string, string> = {
      'none': 'tinggi',
      'tinggi': 'sedang', 
      'sedang': 'rendah',
      'rendah': 'none'
    }
    const newLevel = levelCycle[currentLevel] || 'tinggi'
    
    setSaving(true)
    setSaveMessage(null)
    
    try {
      if (newLevel === 'none') {
        // Delete mapping from API
        if (existingId) {
          await cplMKMappingService.delete(existingId)
        } else {
          // Try delete by pair if no ID
          await cplMKMappingService.deleteByPair(cplId, mkId)
        }
        
        // Update local state
        setMappingData(prev => prev.filter(m => !(m.mkId === mkId && m.cplId === cplId)))
        setSaveMessage({ type: 'success', text: 'Mapping dihapus' })
      } else {
        // Create or update mapping via upsert
        const response = await cplMKMappingService.upsert({
          cpl_id: cplId,
          mata_kuliah_id: mkId,
          level: newLevel as 'tinggi' | 'sedang' | 'rendah'
        })
        
        if (response.success && response.data) {
          // Update local state with response data
          setMappingData(prev => {
            const existingIndex = prev.findIndex(m => m.mkId === mkId && m.cplId === cplId)
            const newMapping: MappingData = {
              id: response.data.id,
              mkId,
              cplId,
              level: newLevel
            }
            
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = newMapping
              return updated
            } else {
              return [...prev, newMapping]
            }
          })
          setSaveMessage({ type: 'success', text: `Level diubah ke ${newLevel.toUpperCase()}` })
        }
      }
    } catch (err) {
      console.error('Error saving mapping:', err)
      setSaveMessage({ type: 'error', text: 'Gagal menyimpan mapping' })
    } finally {
      setSaving(false)
    }
  }

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
        {/* Save Status Notification */}
        {saveMessage && (
          <div className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all",
            saveMessage.type === 'success' ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
          )}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{saveMessage.text}</span>
          </div>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-blue-100 border border-blue-200 px-4 py-3 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Menyimpan...</span>
          </div>
        )}

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
                      {displayCPLs.map((cpl) => (
                        <th key={cpl.id} className="border border-slate-200 p-2 text-center min-w-[80px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono font-bold text-blue-600">{cpl.kode}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-2">{cpl.nama}</span>
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
                        {displayCPLs.map((cpl) => {
                          const level = getMapping(mk.id, cpl.id) as keyof typeof levelColors
                          const colors = levelColors[level]
                          
                          return (
                            <td 
                              key={cpl.id} 
                              className="border border-slate-200 p-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleMappingClick(mk.id, cpl.id)}
                              title={`Klik untuk mengubah: ${mk.kode} → ${cpl.kode}`}
                            >
                              <div 
                                className={cn(
                                  "mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all hover:scale-105",
                                  colors.bg, colors.text
                                )}
                              >
                                {level === 'tinggi' ? 'T' : level === 'sedang' ? 'S' : level === 'rendah' ? 'R' : '-'}
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
                {displayCPLs.map((cpl) => {
                  const stats = getCPLStats(cpl.id)
                  const coverage = (stats.total / mataKuliahList.length) * 100
                  
                  return (
                    <div key={cpl.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-blue-600">{cpl.kode}</span>
                            <Badge variant="outline">{cpl.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{cpl.nama}</p>
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
                            style={{ width: `${(stats.tinggi / mataKuliahList.length) * 100}%` }} 
                          />
                          <div 
                            className="bg-amber-400" 
                            style={{ width: `${(stats.sedang / mataKuliahList.length) * 100}%` }} 
                          />
                          <div 
                            className="bg-blue-400" 
                            style={{ width: `${(stats.rendah / mataKuliahList.length) * 100}%` }} 
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
                  const mappings = mappingData.filter(m => m.mkId === mk.id)
                  
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
                            const cpl = displayCPLs.find(c => c.id === m.cplId)
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
                <p className="text-3xl font-bold text-blue-900">{displayCPLs.length}</p>
                <p className="text-sm text-blue-700">Total CPL</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-900">{mataKuliahList.length}</p>
                <p className="text-sm text-emerald-700">Total Mata Kuliah</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-900">{mappingData.length}</p>
                <p className="text-sm text-amber-700">Total Mapping</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-900">
                  {displayCPLs.length > 0 && mataKuliahList.length > 0 
                    ? ((mappingData.length / (displayCPLs.length * mataKuliahList.length)) * 100).toFixed(0)
                    : 0}%
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
