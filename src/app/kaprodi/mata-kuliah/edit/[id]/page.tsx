"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Save,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { mataKuliahService, UpdateMataKuliahRequest } from '@/lib/api/mata-kuliah'

interface MataKuliahForm {
  kode: string
  nama: string
  sks: number
  semester: number
  jenis: 'wajib' | 'pilihan'
  deskripsi: string
  status: 'aktif' | 'nonaktif'
}

export default function EditMataKuliahPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [form, setForm] = useState<MataKuliahForm>({
    kode: '',
    nama: '',
    sks: 3,
    semester: 1,
    jenis: 'wajib',
    deskripsi: '',
    status: 'aktif'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load mata kuliah data
  const loadMataKuliah = useCallback(async () => {
    if (!id) return
    
    setIsLoading(true)
    setLoadError(null)
    
    try {
      const response = await mataKuliahService.getById(id)
      
      if (response.success && response.data) {
        const mk = response.data
        setForm({
          kode: mk.kode || '',
          nama: mk.nama || '',
          sks: mk.sks || 3,
          semester: mk.semester || 1,
          jenis: mk.jenis || 'wajib',
          deskripsi: mk.deskripsi || '',
          status: mk.status === 'aktif' || mk.status === 'nonaktif' ? mk.status : 'aktif'
        })
      } else {
        setLoadError(response.message || 'Gagal memuat data mata kuliah')
      }
    } catch (err: unknown) {
      console.error('Error loading mata kuliah:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        setLoadError((err as { message: string }).message)
      } else {
        setLoadError('Terjadi kesalahan saat memuat data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadMataKuliah()
  }, [loadMataKuliah])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!form.kode.trim()) {
      newErrors.kode = 'Kode mata kuliah wajib diisi'
    } else if (form.kode.length < 3) {
      newErrors.kode = 'Kode minimal 3 karakter'
    }
    
    if (!form.nama.trim()) {
      newErrors.nama = 'Nama mata kuliah wajib diisi'
    }
    
    if (form.sks < 1 || form.sks > 6) {
      newErrors.sks = 'SKS harus antara 1-6'
    }
    
    if (form.semester < 1 || form.semester > 8) {
      newErrors.semester = 'Semester harus antara 1-8'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const data: UpdateMataKuliahRequest = {
        kode: form.kode.trim().toUpperCase(),
        nama: form.nama.trim(),
        sks: form.sks,
        semester: form.semester,
        jenis: form.jenis,
        deskripsi: form.deskripsi.trim() || undefined,
        status: form.status
      }

      console.log('Updating mata kuliah:', data)

      const response = await mataKuliahService.update(id, data)
      
      if (response.success) {
        router.push('/kaprodi/mata-kuliah')
      } else {
        setError(response.message || 'Gagal mengupdate mata kuliah')
      }
    } catch (err: unknown) {
      console.error('Error updating mata kuliah:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string; data?: { message?: string; errors?: Record<string, string[]> } }
        if (errorObj.data?.errors) {
          const validationErrors = Object.entries(errorObj.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
          setError(validationErrors)
        } else {
          setError(errorObj.data?.message || errorObj.message || 'Terjadi kesalahan')
        }
      } else {
        setError('Terjadi kesalahan saat mengupdate mata kuliah')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof MataKuliahForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data mata kuliah...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/kaprodi/mata-kuliah">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Gagal Memuat Data</h4>
              <p className="text-sm text-red-700 mt-1">{loadError}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/kaprodi/mata-kuliah">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Mata Kuliah</h1>
              <p className="text-slate-600">Ubah informasi mata kuliah {form.kode}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Gagal Mengupdate Mata Kuliah</h4>
              <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Informasi Dasar
                </CardTitle>
                <CardDescription>
                  Informasi dasar mata kuliah
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode">Kode Mata Kuliah <span className="text-red-500">*</span></Label>
                    <Input
                      id="kode"
                      placeholder="TIF301"
                      value={form.kode}
                      onChange={(e) => handleInputChange('kode', e.target.value.toUpperCase())}
                      className={errors.kode ? 'border-red-500' : ''}
                    />
                    {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sks">SKS <span className="text-red-500">*</span></Label>
                    <select
                      id="sks"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sks ? 'border-red-500' : 'border-slate-200'}`}
                      value={form.sks}
                      onChange={(e) => handleInputChange('sks', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(sks => (
                        <option key={sks} value={sks}>{sks} SKS</option>
                      ))}
                    </select>
                    {errors.sks && <p className="text-sm text-red-500">{errors.sks}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Mata Kuliah <span className="text-red-500">*</span></Label>
                  <Input
                    id="nama"
                    placeholder="Rekayasa Perangkat Lunak"
                    value={form.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    className={errors.nama ? 'border-red-500' : ''}
                  />
                  {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Deskripsi mata kuliah, tujuan pembelajaran, dan cakupan materi..."
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
                    <select
                      id="semester"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.semester ? 'border-red-500' : 'border-slate-200'}`}
                      value={form.semester}
                      onChange={(e) => handleInputChange('semester', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    {errors.semester && <p className="text-sm text-red-500">{errors.semester}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenis">Jenis <span className="text-red-500">*</span></Label>
                    <select
                      id="jenis"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.jenis}
                      onChange={(e) => handleInputChange('jenis', e.target.value)}
                    >
                      <option value="wajib">Wajib</option>
                      <option value="pilihan">Pilihan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Non-aktif</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Mata Kuliah
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Preview Perubahan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kode & Nama:</Label>
                  <p className="text-sm font-medium">
                    {form.kode || 'XXX'} - {form.nama || 'Nama Mata Kuliah'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{form.sks} SKS</Badge>
                  <Badge variant="outline">Semester {form.semester}</Badge>
                  <Badge className={form.jenis === 'wajib' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} variant="outline">
                    {form.jenis === 'wajib' ? 'Wajib' : 'Pilihan'}
                  </Badge>
                  <Badge className={form.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} variant="outline">
                    {form.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </div>

                {form.deskripsi && (
                  <div className="space-y-2">
                    <Label>Deskripsi:</Label>
                    <p className="text-sm text-slate-600 line-clamp-3">{form.deskripsi}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Panduan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Gunakan kode mata kuliah sesuai standar</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pilih semester sesuai urutan kurikulum</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Deskripsi opsional tapi disarankan</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}