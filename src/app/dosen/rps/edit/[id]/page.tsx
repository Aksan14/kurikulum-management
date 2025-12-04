"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockRPS, mockMataKuliah, mockCPLs, mockUsers } from "@/lib/mock-data"

export default function EditRPSPage() {
  const params = useParams()
  const router = useRouter()
  const rpsId = params.id as string
  
  const existingRPS = mockRPS.find(r => r.id === rpsId)
  const mataKuliah = mockMataKuliah.find(mk => mk.id === existingRPS?.mataKuliahId)
  
  const [activeTab, setActiveTab] = useState("dasar")
  const [isSaving, setIsSaving] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    deskripsi: existingRPS?.deskripsi || "",
    tujuan: existingRPS?.tujuan || "",
    metode: existingRPS?.metode || ["Ceramah"],
    bobotNilai: existingRPS?.bobotNilai || {
      tugas: 20,
      uts: 25,
      uas: 35,
      kehadiran: 10,
      praktikum: 10
    },
    cpmk: existingRPS?.cpmk || [],
    rencanaPembelajaran: existingRPS?.rencanaPembelajaran || [],
    bahanBacaan: existingRPS?.bahanBacaan || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi mata kuliah wajib diisi"
    }
    if (!formData.tujuan.trim()) {
      newErrors.tujuan = "Tujuan pembelajaran wajib diisi"
    }

    const totalBobot = Object.values(formData.bobotNilai).reduce((sum, val) => sum + val, 0)
    if (totalBobot !== 100) {
      newErrors.bobot = `Total bobot penilaian harus 100% (saat ini ${totalBobot}%)`
    }

    if (formData.cpmk.length === 0) {
      newErrors.cpmk = "Minimal harus ada 1 CPMK"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (isDraft = false) => {
    if (!validateForm()) return

    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    
    router.push(`/dosen/rps/${rpsId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  const addCPMK = () => {
    const newCPMK = {
      id: `cpmk-${formData.cpmk.length + 1}`,
      kode: `CPMK-${String(formData.cpmk.length + 1).padStart(2, '0')}`,
      deskripsi: "",
      cplIds: []
    }
    setFormData({ ...formData, cpmk: [...formData.cpmk, newCPMK] })
  }

  const updateCPMK = (index: number, field: string, value: any) => {
    const updatedCPMK = [...formData.cpmk]
    updatedCPMK[index] = { ...updatedCPMK[index], [field]: value }
    setFormData({ ...formData, cpmk: updatedCPMK })
  }

  const removeCPMK = (index: number) => {
    const updatedCPMK = formData.cpmk.filter((_, i) => i !== index)
    setFormData({ ...formData, cpmk: updatedCPMK })
  }

  const addPertemuan = () => {
    const newPertemuan = {
      pertemuan: formData.rencanaPembelajaran.length + 1,
      topik: "",
      subTopik: [],
      metode: "Ceramah",
      waktu: 150,
      cpmkIds: [],
      materi: ""
    }
    setFormData({ 
      ...formData, 
      rencanaPembelajaran: [...formData.rencanaPembelajaran, newPertemuan] 
    })
  }

  // Get dosen user (second user in mockUsers)
  const dosenUser = mockUsers.find(user => user.role === 'dosen') || mockUsers[1]

  return (
    <DashboardLayout user={{...dosenUser, role: 'dosen'}} unreadNotifications={2}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit RPS</h1>
              <p className="text-gray-600">{mataKuliah?.nama} ({mataKuliah?.kode})</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSaving} variant="outline">
              Simpan Draft
            </Button>
            <Button onClick={() => handleSave()} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan & Ajukan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Terdapat kesalahan pada form:</h4>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {Object.values(errors).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="dasar" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Informasi Dasar
            </TabsTrigger>
            <TabsTrigger value="cpmk" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              CPMK
            </TabsTrigger>
            <TabsTrigger value="pertemuan" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Rencana Pertemuan
            </TabsTrigger>
            <TabsTrigger value="penilaian" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Penilaian
            </TabsTrigger>
          </TabsList>

          {/* Informasi Dasar Tab */}
          <TabsContent value="dasar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi Mata Kuliah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi *</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Mata kuliah ini membahas..."
                    rows={4}
                    className={errors.deskripsi ? "border-red-500" : ""}
                  />
                  {errors.deskripsi && (
                    <p className="text-sm text-red-500">{errors.deskripsi}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tujuan">Tujuan Pembelajaran *</Label>
                  <Textarea
                    id="tujuan"
                    value={formData.tujuan}
                    onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                    placeholder="Setelah menyelesaikan mata kuliah ini, mahasiswa diharapkan..."
                    rows={4}
                    className={errors.tujuan ? "border-red-500" : ""}
                  />
                  {errors.tujuan && (
                    <p className="text-sm text-red-500">{errors.tujuan}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembelajaran</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Ceramah", "Diskusi", "Praktikum", "Project-Based Learning", "Problem-Based Learning", "Simulasi"].map(metode => (
                      <label key={metode} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.metode.includes(metode)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, metode: [...formData.metode, metode] })
                            } else {
                              setFormData({ ...formData, metode: formData.metode.filter(m => m !== metode) })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{metode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CPMK Tab */}
          <TabsContent value="cpmk" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                  <CardDescription>Definisikan CPMK dan mapping ke CPL</CardDescription>
                </div>
                <Button onClick={addCPMK} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah CPMK
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.cpmk && (
                  <p className="text-sm text-red-500">{errors.cpmk}</p>
                )}
                
                {formData.cpmk.map((cpmk, index) => (
                  <div key={cpmk.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-700">{cpmk.kode}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCPMK(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Deskripsi CPMK *</Label>
                      <Textarea
                        value={cpmk.deskripsi}
                        onChange={(e) => updateCPMK(index, 'deskripsi', e.target.value)}
                        placeholder="Mahasiswa mampu..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mapping ke CPL</Label>
                      <div className="flex flex-wrap gap-2">
                        {mockCPLs.filter(cpl => cpl.status === "published").map(cpl => (
                          <label key={cpl.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cpmk.cplIds.includes(cpl.id)}
                              onChange={(e) => {
                                const newCplIds = e.target.checked
                                  ? [...cpmk.cplIds, cpl.id]
                                  : cpmk.cplIds.filter(id => id !== cpl.id)
                                updateCPMK(index, 'cplIds', newCplIds)
                              }}
                              className="rounded"
                            />
                            <Badge variant="outline" className="text-xs">{cpl.kode}</Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rencana Pertemuan Tab */}
          <TabsContent value="pertemuan" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rencana Pembelajaran Semester</CardTitle>
                  <CardDescription>Rencana kegiatan 14 pertemuan</CardDescription>
                </div>
                <Button onClick={addPertemuan} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pertemuan
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.rencanaPembelajaran.map((pertemuan, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedWeek(expandedWeek === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm">
                          {pertemuan.pertemuan}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {pertemuan.topik || `Pertemuan ${pertemuan.pertemuan}`}
                          </p>
                        </div>
                      </div>
                      {expandedWeek === index 
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />
                      }
                    </button>
                    
                    {expandedWeek === index && (
                      <div className="px-4 pb-4 border-t bg-gray-50 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 pt-4">
                          <div className="space-y-2">
                            <Label>Topik Pertemuan *</Label>
                            <Input
                              value={pertemuan.topik}
                              onChange={(e) => {
                                const updated = [...formData.rencanaPembelajaran]
                                updated[index] = { ...updated[index], topik: e.target.value }
                                setFormData({ ...formData, rencanaPembelajaran: updated })
                              }}
                              placeholder="Pengantar Sistem Basis Data"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Metode</Label>
                            <select
                              value={pertemuan.metode}
                              onChange={(e) => {
                                const updated = [...formData.rencanaPembelajaran]
                                updated[index] = { ...updated[index], metode: e.target.value }
                                setFormData({ ...formData, rencanaPembelajaran: updated })
                              }}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              <option value="Ceramah">Ceramah</option>
                              <option value="Diskusi">Diskusi</option>
                              <option value="Praktikum">Praktikum</option>
                              <option value="Ceramah & Praktikum">Ceramah & Praktikum</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Penilaian Tab */}
          <TabsContent value="penilaian" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Komponen Penilaian</CardTitle>
                <CardDescription>Distribusi bobot penilaian (total harus 100%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {errors.bobot && (
                  <p className="text-sm text-red-500">{errors.bobot}</p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(formData.bobotNilai).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key === 'tugas' ? 'Tugas' :
                         key === 'uts' ? 'UTS' :
                         key === 'uas' ? 'UAS' :
                         key === 'kehadiran' ? 'Kehadiran' :
                         key === 'praktikum' ? 'Praktikum' : key} (%)
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => {
                          const newBobot = { ...formData.bobotNilai, [key]: parseInt(e.target.value) || 0 }
                          setFormData({ ...formData, bobotNilai: newBobot })
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Bobot:</span>
                    <span className={`text-lg font-bold ${
                      Object.values(formData.bobotNilai).reduce((sum, val) => sum + val, 0) === 100 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {Object.values(formData.bobotNilai).reduce((sum, val) => sum + val, 0)}%
                    </span>
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