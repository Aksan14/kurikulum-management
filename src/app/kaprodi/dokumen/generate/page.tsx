"use client"

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileOutput,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { documentService } from '@/lib/api'
import type { Document, DocumentTemplate } from '@/lib/api/documents'

const formatColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-800',
  docx: 'bg-blue-100 text-blue-800',
  xlsx: 'bg-green-100 text-green-800'
}

const statusColors: Record<string, string> = {
  ready: 'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function GenerateDocumentPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [generatingDocs, setGeneratingDocs] = useState<Set<string>>(new Set())
  
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [generateForm, setGenerateForm] = useState({
    tahun: new Date().getFullYear().toString(),
    file_type: 'pdf' as 'pdf' | 'docx' | 'xlsx',
    sections: [] as string[]
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [templatesRes, documentsRes] = await Promise.all([
        documentService.templates.getAll(),
        documentService.getAll({ limit: 50 })
      ])

      if (templatesRes.data) {
        setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : [])
      }

      if (documentsRes.data) {
        const docs = Array.isArray(documentsRes.data) 
          ? documentsRes.data 
          : (documentsRes.data as { data?: Document[] }).data || []
        setDocuments(docs)
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Gagal memuat data dokumen')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerate = async () => {
    if (!selectedTemplate) return

    try {
      setGeneratingDocs(prev => new Set(prev).add(selectedTemplate.id))
      setShowGenerateDialog(false)

      const response = await documentService.generate({
        template_id: selectedTemplate.id,
        tahun: generateForm.tahun,
        file_type: generateForm.file_type,
        sections: generateForm.sections.length > 0 ? generateForm.sections : undefined
      })

      if (response.success) {
        await fetchData()
        alert('Dokumen berhasil digenerate!')
      }
    } catch (err) {
      console.error('Error generating document:', err)
      alert('Gagal generate dokumen')
    } finally {
      setGeneratingDocs(prev => {
        const newSet = new Set(prev)
        if (selectedTemplate) newSet.delete(selectedTemplate.id)
        return newSet
      })
    }
  }

  const handleDownload = (doc: Document) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    } else {
      const url = documentService.getDownloadUrl(doc.id)
      window.open(url, '_blank')
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return

    try {
      await documentService.delete(docId)
      await fetchData()
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Gagal menghapus dokumen')
    }
  }

  const openGenerateDialog = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    setGenerateForm({
      tahun: new Date().getFullYear().toString(),
      file_type: 'pdf',
      sections: []
    })
    setShowGenerateDialog(true)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredDocuments = documents.filter(doc => {
    const matchesFormat = selectedFormat === 'all' || doc.file_type === selectedFormat
    return matchesFormat
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return CheckCircle
      case 'processing': return Clock
      case 'failed': return AlertTriangle
      default: return FileText
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Generate Dokumen</h1>
          <p className="text-slate-600">Generate dan unduh berbagai dokumen kurikulum, RPS, dan laporan</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {error}
              <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Template</p>
                  <p className="text-2xl font-bold text-slate-900">{templates.length}</p>
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
                  <p className="text-sm font-medium text-slate-600">Dokumen Tersedia</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documents.filter(d => d.status === 'ready').length}
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
                  <p className="text-sm font-medium text-slate-600">Sedang Diproses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documents.filter(d => d.status === 'processing').length + generatingDocs.size}
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
                  <p className="text-sm font-medium text-slate-600">Total Dokumen</p>
                  <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Template Dokumen</TabsTrigger>
            <TabsTrigger value="generated">Dokumen yang Digenerate</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Cari template dokumen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Tidak ada template ditemukan</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.nama}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">v{template.version}</Badge>
                            {template.is_active && <Badge className="bg-green-100 text-green-700">Aktif</Badge>}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{template.deskripsi || 'Tidak ada deskripsi'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => openGenerateDialog(template)}
                        disabled={generatingDocs.has(template.id) || !template.is_active}
                      >
                        {generatingDocs.has(template.id) ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                          <><FileOutput className="h-4 w-4 mr-2" />Generate</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-6">
            <Card>
              <CardContent className="p-6 flex gap-4">
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Format</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Word</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />Refresh
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumen yang Digenerate</CardTitle>
                <CardDescription>Daftar dokumen yang telah digenerate</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada dokumen yang digenerate</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map((doc) => {
                      const StatusIcon = getStatusIcon(doc.status)
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${formatColors[doc.file_type] || 'bg-gray-100'}`}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.template_name || 'Dokumen'}</p>
                              <p className="text-sm text-slate-500">
                                {doc.tahun} • {doc.file_type.toUpperCase()} • {new Date(doc.created_at).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[doc.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {doc.status === 'ready' ? 'Siap' : doc.status === 'processing' ? 'Memproses' : doc.status === 'failed' ? 'Gagal' : doc.status}
                            </Badge>
                            {doc.status === 'ready' && (
                              <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Dokumen</DialogTitle>
            <DialogDescription>{selectedTemplate?.nama}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Input
                value={generateForm.tahun}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, tahun: e.target.value }))}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Format Output</Label>
              <Select 
                value={generateForm.file_type} 
                onValueChange={(value: 'pdf' | 'docx' | 'xlsx') => setGenerateForm(prev => ({ ...prev, file_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Batal</Button>
            <Button onClick={handleGenerate}>
              <FileOutput className="h-4 w-4 mr-2" />Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
