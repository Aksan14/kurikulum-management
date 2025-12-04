"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  FileOutput,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Archive,
  FileText,
  Loader2,
  Plus,
  Trash2,
  FolderOpen,
  FileSpreadsheet,
  Calendar
} from "lucide-react"
import { mockUsers, mockGeneratedDocuments, mockDocumentTemplates } from "@/lib/mock-data"
import { cn, formatDateTime } from "@/lib/utils"
import Link from "next/link"

const statusConfig = {
  processing: { label: 'Sedang Diproses', variant: 'warning' as const, icon: Loader2 },
  ready: { label: 'Siap Diunduh', variant: 'success' as const, icon: CheckCircle },
  archived: { label: 'Diarsipkan', variant: 'outline' as const, icon: Archive },
}

const sectionOptions = [
  { id: 'profil_lulusan', label: 'Profil Lulusan', description: 'Deskripsi profil dan kompetensi lulusan' },
  { id: 'cpl', label: 'Capaian Pembelajaran Lulusan', description: 'Daftar lengkap CPL' },
  { id: 'matriks_cpl_mk', label: 'Matriks CPL - Mata Kuliah', description: 'Tabel pemetaan CPL dengan MK' },
  { id: 'rps_ringkasan', label: 'Ringkasan RPS', description: 'Rangkuman RPS semua mata kuliah' },
  { id: 'rps_detail', label: 'RPS Detail', description: 'RPS lengkap setiap mata kuliah' },
  { id: 'silabus', label: 'Silabus', description: 'Silabus mata kuliah' },
  { id: 'jadwal_pertemuan', label: 'Jadwal Pertemuan', description: 'Rencana pertemuan per minggu' },
  { id: 'evaluasi', label: 'Evaluasi', description: 'Metode dan instrumen evaluasi' },
  { id: 'pemetaan_cpl_cpmk', label: 'Pemetaan CPL-CPMK', description: 'Mapping CPL dengan CPMK' },
]

export default function DokumenPage() {
  const user = mockUsers[0]
  const [activeTab, setActiveTab] = useState('riwayat')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedYear, setSelectedYear] = useState('2024/2025')
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState(0)

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenerateProgress(0)
    
    // Simulate progress
    const interval = setInterval(() => {
      setGenerateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setShowGenerateDialog(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(s => s !== sectionId))
    } else {
      setSelectedSections([...selectedSections, sectionId])
    }
  }

  const selectAllSections = () => {
    if (selectedSections.length === sectionOptions.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(sectionOptions.map(s => s.id))
    }
  }

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Generate Dokumen</h1>
            <p className="mt-1 text-slate-500">
              Buat dan kelola dokumen kurikulum
            </p>
          </div>
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Plus className="h-4 w-4" />
            Generate Dokumen Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FileOutput className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{mockGeneratedDocuments.length}</p>
                  <p className="text-sm text-slate-500">Total Dokumen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {mockGeneratedDocuments.filter(d => d.status === 'ready').length}
                  </p>
                  <p className="text-sm text-emerald-700">Siap Diunduh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {mockGeneratedDocuments.filter(d => d.status === 'processing').length}
                  </p>
                  <p className="text-sm text-amber-700">Sedang Diproses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Archive className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockGeneratedDocuments.filter(d => d.status === 'archived').length}
                  </p>
                  <p className="text-sm text-slate-500">Diarsipkan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="riwayat" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Riwayat Dokumen
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Template
            </TabsTrigger>
          </TabsList>

          {/* Riwayat Dokumen */}
          <TabsContent value="riwayat" className="space-y-4">
            {mockGeneratedDocuments.map((doc) => {
              const status = statusConfig[doc.status]
              const StatusIcon = status.icon
              
              return (
                <Card key={doc.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
                          doc.status === 'ready' ? "bg-emerald-100" :
                          doc.status === 'processing' ? "bg-amber-100" :
                          "bg-slate-100"
                        )}>
                          {doc.fileType === 'docx' ? (
                            <FileText className={cn(
                              "h-7 w-7",
                              doc.status === 'ready' ? "text-emerald-600" :
                              doc.status === 'processing' ? "text-amber-600" :
                              "text-slate-600"
                            )} />
                          ) : (
                            <FileSpreadsheet className={cn(
                              "h-7 w-7",
                              doc.status === 'ready' ? "text-emerald-600" :
                              doc.status === 'processing' ? "text-amber-600" :
                              "text-slate-600"
                            )} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{doc.templateName}</h3>
                            <Badge variant={status.variant}>
                              {doc.status === 'processing' && (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              )}
                              {status.label}
                            </Badge>
                            <Badge variant="outline">{doc.fileType.toUpperCase()}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span>Tahun Akademik: {doc.tahun}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.sections.map(section => (
                              <Badge key={section} variant="outline" className="text-[10px]">
                                {sectionOptions.find(s => s.id === section)?.label || section}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            Dibuat: {formatDateTime(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'ready' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </>
                        )}
                        {doc.status === 'processing' && (
                          <div className="w-32">
                            <Progress value={65} className="h-2" />
                            <p className="mt-1 text-xs text-slate-500 text-center">65%</p>
                          </div>
                        )}
                        {doc.status === 'archived' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Template */}
          <TabsContent value="template" className="space-y-4">
            {mockDocumentTemplates.map((template) => (
              <Card key={template.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <FileSpreadsheet className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{template.nama}</h3>
                          <Badge variant="outline">v{template.version}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{template.deskripsi}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.sections.map(section => (
                            <Badge key={section} variant="outline" className="text-[10px]">
                              {sectionOptions.find(s => s.id === section)?.label || section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setSelectedSections(template.sections)
                        setShowGenerateDialog(true)
                      }}
                    >
                      <FileOutput className="h-4 w-4" />
                      Gunakan Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Generate Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Dokumen Kurikulum</DialogTitle>
              <DialogDescription>
                Pilih template dan section yang ingin disertakan dalam dokumen
              </DialogDescription>
            </DialogHeader>
            
            {!isGenerating ? (
              <div className="space-y-6 py-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Template Dokumen</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih template" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDocumentTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.nama}</span>
                            <Badge variant="outline" className="text-[10px]">v{template.version}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Selection */}
                <div className="space-y-2">
                  <Label>Tahun Akademik</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Section Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Section yang Disertakan</Label>
                    <Button variant="ghost" size="sm" onClick={selectAllSections}>
                      {selectedSections.length === sectionOptions.length ? 'Batalkan Semua' : 'Pilih Semua'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {sectionOptions.map((section) => (
                      <div 
                        key={section.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                          selectedSections.includes(section.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => toggleSection(section.id)}
                      >
                        <Checkbox 
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{section.label}</p>
                          <p className="text-xs text-slate-500">{section.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div className="space-y-2">
                  <Label>Format Output</Label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2">
                      <Checkbox checked />
                      <span className="text-sm font-medium">DOCX</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2">
                      <Checkbox />
                      <span className="text-sm">PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900">Sedang Generate Dokumen...</h3>
                    <p className="text-sm text-slate-500">Mohon tunggu, proses ini membutuhkan waktu beberapa saat</p>
                  </div>
                  <div className="w-full max-w-xs">
                    <Progress value={generateProgress} className="h-3" />
                    <p className="mt-2 text-center text-sm text-slate-500">{generateProgress}%</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              {!isGenerating && (
                <>
                  <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                    Batal
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    disabled={!selectedTemplate || selectedSections.length === 0}
                  >
                    <FileOutput className="h-4 w-4" />
                    Generate Dokumen
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
