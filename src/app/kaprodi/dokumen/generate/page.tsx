"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileOutput,
  Download,
  FileText,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Settings,
  RefreshCw,
  FileSpreadsheet,

  Loader2,
  BookOpen,
  GraduationCap,
  Users
} from 'lucide-react'
import { mockUsers, mockCPLs, mockRPS } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  type: 'kurikulum' | 'rps' | 'cpl' | 'laporan'
  format: 'pdf' | 'docx' | 'xlsx'
  icon: any
  lastGenerated?: string
  status: 'available' | 'generating' | 'error'
  downloadCount: number
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Dokumen Kurikulum Lengkap',
    description: 'Dokumen kurikulum program studi lengkap dengan semua CPL dan mata kuliah',
    type: 'kurikulum',
    format: 'pdf',
    icon: BookOpen,
    lastGenerated: '2024-11-20T10:30:00',
    status: 'available',
    downloadCount: 15
  },
  {
    id: '2',
    name: 'Matrix CPL-CPMK',
    description: 'Matrix pemetaan Capaian Pembelajaran Lulusan dengan CPMK',
    type: 'cpl',
    format: 'xlsx',
    icon: FileSpreadsheet,
    lastGenerated: '2024-11-18T14:20:00',
    status: 'available',
    downloadCount: 8
  },
  {
    id: '3',
    name: 'Kumpulan RPS Semester',
    description: 'Kumpulan RPS untuk semester yang dipilih',
    type: 'rps',
    format: 'pdf',
    icon: FileText,
    lastGenerated: '2024-11-15T09:15:00',
    status: 'available',
    downloadCount: 23
  },
  {
    id: '4',
    name: 'Laporan Evaluasi Kurikulum',
    description: 'Laporan evaluasi dan analisis kurikulum program studi',
    type: 'laporan',
    format: 'pdf',
    icon: FileOutput,
    status: 'generating',
    downloadCount: 5
  },
  {
    id: '5',
    name: 'Silabus Mata Kuliah',
    description: 'Silabus lengkap semua mata kuliah dalam program studi',
    type: 'kurikulum',
    format: 'docx',
    icon: BookOpen,
    lastGenerated: '2024-11-10T16:45:00',
    status: 'available',
    downloadCount: 12
  },
  {
    id: '6',
    name: 'Distribusi CPL per Semester',
    description: 'Grafik dan tabel distribusi CPL per semester',
    type: 'cpl',
    format: 'pdf',
    icon: GraduationCap,
    status: 'error',
    downloadCount: 3
  }
]

const formatColors = {
  pdf: 'bg-red-100 text-red-800',
  docx: 'bg-blue-100 text-blue-800',
  xlsx: 'bg-green-100 text-green-800'
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  generating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  available: CheckCircle,
  generating: Clock,
  error: AlertTriangle
}

export default function GenerateDocumentPage() {
  const user = mockUsers[0] // Kaprodi user
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [generatingDocs, setGeneratingDocs] = useState<Set<string>>(new Set())

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || template.type === selectedType
    const matchesFormat = selectedFormat === 'all' || template.format === selectedFormat
    
    return matchesSearch && matchesType && matchesFormat
  })

  const handleGenerate = async (templateId: string) => {
    setGeneratingDocs(prev => new Set(prev).add(templateId))
    
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      console.log('Document generated:', templateId)
      
      // In real app, this would trigger download
      const template = documentTemplates.find(t => t.id === templateId)
      if (template) {
        const blob = new Blob(['Mock document content'], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.name}.${template.format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating document:', error)
    } finally {
      setGeneratingDocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(templateId)
        return newSet
      })
    }
  }

  const handlePreview = (templateId: string) => {
    console.log('Preview document:', templateId)
    // In real app, this would show preview modal or redirect to preview page
  }

  const getGenerationProgress = () => {
    const totalDocs = documentTemplates.length
    const availableDocs = documentTemplates.filter(t => t.status === 'available').length
    return (availableDocs / totalDocs) * 100
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Generate Dokumen</h1>
          <p className="text-slate-600">
            Generate dan unduh berbagai dokumen kurikulum, RPS, dan laporan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Template</p>
                  <p className="text-2xl font-bold text-slate-900">{documentTemplates.length}</p>
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
                  <p className="text-sm font-medium text-slate-600">Tersedia</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documentTemplates.filter(t => t.status === 'available').length}
                  </p>
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
                  <p className="text-sm font-medium text-slate-600">Sedang Generate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documentTemplates.filter(t => t.status === 'generating').length + generatingDocs.size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Download</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documentTemplates.reduce((sum, t) => sum + t.downloadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Progress Generation
            </CardTitle>
            <CardDescription>
              Status keseluruhan generation dokumen kurikulum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dokumen tersedia</span>
                <span>{Math.round(getGenerationProgress())}%</span>
              </div>
              <Progress value={getGenerationProgress()} />
              <p className="text-xs text-slate-600">
                {documentTemplates.filter(t => t.status === 'available').length} dari {documentTemplates.length} template tersedia
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Template Dokumen</TabsTrigger>
            <TabsTrigger value="history">Riwayat Generate</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Cari template dokumen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="kurikulum">Kurikulum</option>
                      <option value="rps">RPS</option>
                      <option value="cpl">CPL</option>
                      <option value="laporan">Laporan</option>
                    </select>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Semua Format</option>
                      <option value="pdf">PDF</option>
                      <option value="docx">Word</option>
                      <option value="xlsx">Excel</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Templates Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const StatusIcon = statusIcons[template.status]
                const TemplateIcon = template.icon
                const isGenerating = generatingDocs.has(template.id) || template.status === 'generating'
                
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                            <TemplateIcon className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={formatColors[template.format]} variant="outline">
                                {template.format.toUpperCase()}
                              </Badge>
                              <Badge className={statusColors[template.status]} variant="outline">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {template.status === 'available' ? 'Tersedia' :
                                 template.status === 'generating' ? 'Generating' : 'Error'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {template.lastGenerated && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>Terakhir: {new Date(template.lastGenerated).toLocaleString('id-ID')}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Download className="h-4 w-4" />
                          <span>{template.downloadCount} kali diunduh</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreview(template.id)}
                            disabled={template.status === 'error'}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleGenerate(template.id)}
                            disabled={isGenerating || template.status === 'error'}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <FileOutput className="h-4 w-4 mr-2" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate'}
                          </Button>
                        </div>

                        {template.status === 'error' && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Generation gagal. Silakan coba lagi.</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Tidak ada template ditemukan</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Coba ubah filter atau kata kunci pencarian Anda
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Generation Dokumen</CardTitle>
                <CardDescription>
                  Daftar dokumen yang pernah di-generate dalam 30 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Riwayat Generation</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Fitur riwayat generation akan segera tersedia
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Pengaturan Generation
                </CardTitle>
                <CardDescription>
                  Konfigurasi pengaturan generation dokumen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Settings className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Pengaturan Generation</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Fitur pengaturan generation akan segera tersedia
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}