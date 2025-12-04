"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Target,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { mockCPLs } from "@/lib/mock-data"

export default function EditCPLPage() {
  const params = useParams()
  const router = useRouter()
  const cplId = params.id as string
  
  const existingCPL = mockCPLs.find(c => c.id === cplId)
  
  const [formData, setFormData] = useState({
    kode: existingCPL?.kode || "",
    judul: existingCPL?.judul || "",
    deskripsi: existingCPL?.deskripsi || "",
    aspek: existingCPL?.aspek || "pengetahuan",
    kategori: existingCPL?.kategori || "Kompetensi Utama"
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.kode.trim()) {
      newErrors.kode = "Kode CPL wajib diisi"
    }
    if (!formData.judul.trim()) {
      newErrors.judul = "Judul CPL wajib diisi"
    }
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi CPL wajib diisi"
    }
    if (formData.deskripsi.length < 50) {
      newErrors.deskripsi = "Deskripsi minimal 50 karakter"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (isDraft = false) => {
    if (!validateForm()) return

    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    
    // Simulate save success
    router.push(`/kaprodi/cpl/${cplId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <DashboardLayout>
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
            <div className="bg-blue-100 p-3 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit CPL</h1>
              <p className="text-gray-600">Ubah informasi Capaian Pembelajaran Lulusan</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={() => handleSave()} disabled={isSaving}>
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
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Informasi utama CPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kode">Kode CPL *</Label>
                    <Input
                      id="kode"
                      value={formData.kode}
                      onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                      placeholder="CPL-01"
                      className={errors.kode ? "border-red-500" : ""}
                    />
                    {errors.kode && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.kode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori *</Label>
                    <select
                      id="kategori"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Kompetensi Utama">Kompetensi Utama</option>
                      <option value="Kompetensi Pendukung">Kompetensi Pendukung</option>
                      <option value="Kompetensi Lainnya">Kompetensi Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judul">Judul CPL *</Label>
                  <Input
                    id="judul"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Kemampuan Berpikir Kritis"
                    className={errors.judul ? "border-red-500" : ""}
                  />
                  {errors.judul && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.judul}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspek">Aspek CPL *</Label>
                  <select
                    id="aspek"
                    value={formData.aspek}
                    onChange={(e) => setFormData({ ...formData, aspek: e.target.value as "pengetahuan" | "keterampilan_umum" | "keterampilan_khusus" | "sikap" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pengetahuan">Pengetahuan</option>
                    <option value="keterampilan_umum">Keterampilan Umum</option>
                    <option value="keterampilan_khusus">Keterampilan Khusus</option>
                    <option value="sikap">Sikap</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi CPL *</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi..."
                    rows={6}
                    className={errors.deskripsi ? "border-red-500" : ""}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formData.deskripsi.length}/500 karakter (minimal 50)
                    </span>
                    {errors.deskripsi && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status Saat Ini</Label>
                  <Badge className={
                    existingCPL?.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }>
                    {existingCPL?.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Versi</Label>
                  <p className="text-sm text-gray-600">{existingCPL?.version || 1}</p>
                </div>

                {existingCPL?.createdAt && (
                  <div className="space-y-2">
                    <Label>Dibuat</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(existingCPL.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Panduan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Gunakan kata kerja operasional yang terukur</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Deskripsi harus jelas dan spesifik</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Pilih aspek yang sesuai dengan capaian</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Pastikan konsistensi dengan kurikulum</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}