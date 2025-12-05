"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Target,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { cplService, CPL as ApiCPL, UpdateCPLRequest } from "@/lib/api/cpl"

interface DisplayCPL {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditCPLPage() {
  const params = useParams()
  const router = useRouter()
  const { user: authUser } = useAuth()
  const cplId = params.id as string
  
  // State for CPL data
  const [existingCPL, setExistingCPL] = useState<DisplayCPL | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    deskripsi: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch CPL data
  useEffect(() => {
    const fetchCPL = async () => {
      // Check authentication first
      const { authService } = await import('@/lib/api/auth')
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }
      
      setLoading(true)
      setLoadError(null)
      try {
        const response = await cplService.getById(cplId)
        if (response.success && response.data) {
          const cpl: DisplayCPL = {
            id: response.data.id,
            kode: response.data.kode,
            nama: response.data.nama,
            deskripsi: response.data.deskripsi,
            status: response.data.status,
            version: response.data.version,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          }
          setExistingCPL(cpl)
          setFormData({
            kode: cpl.kode,
            nama: cpl.nama,
            deskripsi: cpl.deskripsi
          })
        } else {
          setLoadError('CPL tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching CPL:', err)
        setLoadError('Gagal memuat data CPL. Pastikan server API berjalan.')
      } finally {
        setLoading(false)
      }
    }

    if (cplId) {
      fetchCPL()
    }
  }, [cplId])

  // Clear error when user starts typing
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Kode CPL validation
    if (!formData.kode.trim()) {
      newErrors.kode = "Kode CPL wajib diisi"
    } else if (formData.kode.trim().length < 2) {
      newErrors.kode = "Kode CPL minimal 2 karakter, contoh: CPL-01"
    } else if (!/^[A-Za-z0-9\-]+$/.test(formData.kode.trim())) {
      newErrors.kode = "Kode CPL hanya boleh berisi huruf, angka, dan tanda hubung (-)"
    }

    // Nama CPL validation
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama CPL wajib diisi"
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama CPL minimal 3 karakter, contoh: Mampu menganalisis masalah"
    } else if (/^[\-\s]+$/.test(formData.nama.trim())) {
      newErrors.nama = "Nama CPL harus berisi teks yang valid"
    }

    // Deskripsi validation
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi CPL wajib diisi"
    } else if (formData.deskripsi.trim().length < 10) {
      newErrors.deskripsi = "Deskripsi CPL minimal 10 karakter untuk menjelaskan capaian pembelajaran"
    } else if (/^[\-\s]+$/.test(formData.deskripsi.trim())) {
      newErrors.deskripsi = "Deskripsi harus berisi penjelasan yang valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (isDraft = false) => {
    if (!validateForm()) return

    // Check authentication
    const { authService } = await import('@/lib/api/auth')
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setIsSaving(true)
    setSubmitError(null)
    
    try {
      const updateData: UpdateCPLRequest = {
        kode: formData.kode.trim(),
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim()
      }

      const response = await cplService.update(cplId, updateData)
      
      if (response.success) {
        router.push(`/kaprodi/cpl/${cplId}`)
      } else {
        // Parse error message from API
        const errorMsg = response.message || response.error || 'Gagal menyimpan perubahan'
        setSubmitError(errorMsg)
      }
    } catch (err: unknown) {
      console.error('Error updating CPL:', err)
      // Handle different error types
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string; data?: { message?: string } }
        setSubmitError(errorObj.data?.message || errorObj.message || 'Terjadi kesalahan saat menyimpan')
      } else {
        setSubmitError('Terjadi kesalahan saat menyimpan. Pastikan data yang diisi valid.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (loadError || !existingCPL) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{loadError || 'CPL tidak ditemukan'}</h3>
          <Button className="mt-4" onClick={() => router.push('/kaprodi/cpl')}>
            Kembali ke Daftar CPL
          </Button>
        </div>
      </DashboardLayout>
    )
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
            {/* Submit Error Alert */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Gagal Menyimpan</h4>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Informasi utama CPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode CPL *</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => handleInputChange('kode', e.target.value)}
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
                  <Label htmlFor="nama">Nama CPL *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    placeholder="Mampu merancang dan mengembangkan sistem informasi"
                    className={errors.nama ? "border-red-500" : ""}
                  />
                  {errors.nama && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nama}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi CPL *</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                    placeholder="Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi..."
                    rows={6}
                    className={errors.deskripsi ? "border-red-500" : ""}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formData.deskripsi.length}/500 karakter (minimal 10)
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