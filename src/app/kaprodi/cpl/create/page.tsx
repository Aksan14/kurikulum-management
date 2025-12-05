"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Save, 
  Send,
  GraduationCap,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { cplService, CreateCPLRequest } from "@/lib/api/cpl"

export default function CreateCPLPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    deskripsi: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // User for layout
  const user = authUser ? {
    id: authUser.id,
    nama: authUser.nama,
    email: authUser.email,
    role: authUser.role as "kaprodi" | "dosen" | "admin",
    avatar: "/avatars/default.png",
  } : {
    id: '',
    nama: 'Guest',
    email: '',
    role: 'dosen' as const,
    avatar: '/avatars/default.png'
  }

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
      newErrors.kode = 'Kode CPL wajib diisi'
    } else if (formData.kode.trim().length < 2) {
      newErrors.kode = 'Kode CPL minimal 2 karakter, contoh: CPL-01'
    } else if (!/^[A-Za-z0-9\-]+$/.test(formData.kode.trim())) {
      newErrors.kode = 'Kode CPL hanya boleh berisi huruf, angka, dan tanda hubung (-)'
    }

    // Nama CPL validation
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama CPL wajib diisi'
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama CPL minimal 3 karakter, contoh: Mampu menganalisis masalah'
    } else if (/^[\-\s]+$/.test(formData.nama.trim())) {
      newErrors.nama = 'Nama CPL harus berisi teks yang valid'
    }

    // Deskripsi validation
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi wajib diisi'
    } else if (formData.deskripsi.trim().length < 10) {
      newErrors.deskripsi = 'Deskripsi minimal 10 karakter untuk menjelaskan capaian pembelajaran'
    } else if (/^[\-\s]+$/.test(formData.deskripsi.trim())) {
      newErrors.deskripsi = 'Deskripsi harus berisi penjelasan yang valid'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'published') => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setErrors({})

    try {
      const requestData: CreateCPLRequest = {
        kode: formData.kode.trim(),
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        status: action
      }

      const response = await cplService.create(requestData)
      
      if (response.success) {
        router.push('/kaprodi/cpl')
      } else {
        // Parse error message from API
        const errorMsg = response.message || response.error || 'Gagal membuat CPL'
        setSubmitError(errorMsg)
      }
    } catch (err: unknown) {
      console.error('Error creating CPL:', err)
      // Handle different error types
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string; data?: { message?: string } }
        setSubmitError(errorObj.data?.message || errorObj.message || 'Terjadi kesalahan saat membuat CPL')
      } else {
        setSubmitError('Terjadi kesalahan saat membuat CPL. Pastikan data yang diisi valid.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/kaprodi/cpl">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Buat CPL Baru</h1>
            <p className="mt-1 text-slate-500">
              Tambah Capaian Pembelajaran Lulusan baru
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, 'draft')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Informasi CPL
              </CardTitle>
              <CardDescription>
                Isi informasi dasar Capaian Pembelajaran Lulusan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kode CPL */}
              <div className="grid gap-2">
                <Label htmlFor="kode">
                  Kode CPL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kode"
                  placeholder="Contoh: CPL-01"
                  value={formData.kode}
                  onChange={(e) => handleInputChange('kode', e.target.value)}
                  className={errors.kode ? 'border-red-500' : ''}
                />
                {errors.kode && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.kode}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Kode unik untuk mengidentifikasi CPL
                </p>
              </div>

              {/* Nama CPL */}
              <div className="grid gap-2">
                <Label htmlFor="nama">
                  Nama CPL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Mampu merancang dan mengembangkan sistem informasi"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  className={errors.nama ? 'border-red-500' : ''}
                />
                {errors.nama && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nama}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="grid gap-2">
                <Label htmlFor="deskripsi">
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsikan capaian pembelajaran lulusan secara lengkap..."
                  rows={4}
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  className={errors.deskripsi ? 'border-red-500' : ''}
                />
                {errors.deskripsi && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.deskripsi}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Jelaskan kompetensi yang diharapkan mahasiswa setelah lulus (minimal 10 karakter)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Tips Menulis CPL yang Baik</h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li>• Gunakan kata kerja operasional yang terukur (mampu, dapat, menguasai)</li>
                    <li>• Pastikan CPL sesuai dengan profil lulusan yang diharapkan</li>
                    <li>• Hindari deskripsi yang terlalu umum atau abstrak</li>
                    <li>• Perhatikan taksonomi Bloom untuk level kognitif</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Error */}
          {submitError && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/kaprodi/cpl">
                Batal
              </Link>
            </Button>
            <div className="flex gap-3">
              <Button type="submit" variant="outline" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan sebagai Draft
              </Button>
              <Button type="button" onClick={(e) => handleSubmit(e, 'published')} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Simpan & Publish
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
