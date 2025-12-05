"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Target,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cplAssignmentService, CreateAssignmentRequest } from "@/lib/api/cpl-assignment"
import { cplService, CPL } from "@/lib/api/cpl"
import { usersService, User as ApiUser } from "@/lib/api/users"
import { mataKuliahService, MataKuliah } from "@/lib/api/mata-kuliah"
import { authService } from "@/lib/api/auth"

export default function CreateAssignmentPage() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    cpl_id: "",
    dosen_id: "",
    mata_kuliah_id: "",
    deadline: "",
    catatan: ""
  })
  
  // Options state
  const [cplList, setCplList] = useState<CPL[]>([])
  const [dosenList, setDosenList] = useState<ApiUser[]>([])
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch options
  const fetchOptions = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const [cplResponse, usersResponse, mkResponse] = await Promise.all([
        cplService.getAll({ status: 'published', limit: 100 }),
        usersService.getAll({ role: 'dosen', status: 'active', limit: 100 }),
        mataKuliahService.getAll({ status: 'aktif', limit: 100 })
      ])

      if (cplResponse.success && cplResponse.data?.data) {
        setCplList(cplResponse.data.data)
      }
      if (usersResponse.success && usersResponse.data?.data) {
        setDosenList(usersResponse.data.data)
      }
      if (mkResponse.success && mkResponse.data?.data) {
        setMataKuliahList(mkResponse.data.data)
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  // Clear error on input change
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cpl_id) {
      newErrors.cpl_id = "Pilih CPL yang akan ditugaskan"
    }
    if (!formData.dosen_id) {
      newErrors.dosen_id = "Pilih dosen yang akan ditugaskan"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Build request data - only include fields with values
      const requestData: CreateAssignmentRequest = {
        cpl_id: formData.cpl_id,
        dosen_id: formData.dosen_id,
      }
      
      // Only add optional fields if they have values
      if (formData.mata_kuliah_id && formData.mata_kuliah_id.trim() !== '') {
        requestData.mata_kuliah_id = formData.mata_kuliah_id
        // Find mata kuliah name
        const selectedMK = mataKuliahList.find(mk => mk.id === formData.mata_kuliah_id)
        if (selectedMK) {
          requestData.mata_kuliah = selectedMK.nama
        }
      }
      
      if (formData.deadline && formData.deadline.trim() !== '') {
        // Convert datetime-local to ISO format
        requestData.deadline = new Date(formData.deadline).toISOString()
      }
      
      if (formData.catatan && formData.catatan.trim() !== '') {
        requestData.catatan = formData.catatan.trim()
      }

      console.log('Sending assignment data:', requestData)

      const response = await cplAssignmentService.create(requestData)
      
      if (response.success) {
        router.push('/kaprodi/assignment')
      } else {
        setSubmitError(response.message || 'Gagal membuat penugasan')
      }
    } catch (err: unknown) {
      console.error('Full error object:', err)
      console.error('Error type:', typeof err)
      console.error('Error JSON:', JSON.stringify(err, null, 2))
      
      let errorMessage = 'Terjadi kesalahan saat membuat penugasan'
      
      if (err && typeof err === 'object') {
        const errorObj = err as { 
          message?: string
          status?: number
          data?: { 
            message?: string
            error?: string
            errors?: Record<string, string[]>
            details?: string
          } 
        }
        
        console.log('Error status:', errorObj.status)
        console.log('Error data:', errorObj.data)
        
        // Try to get the most specific error message
        if (errorObj.data?.errors) {
          // Handle validation errors object
          const validationErrors = Object.entries(errorObj.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
          errorMessage = `Validasi gagal:\n${validationErrors}`
        } else if (errorObj.data?.details) {
          errorMessage = errorObj.data.details
        } else if (errorObj.data?.error) {
          errorMessage = errorObj.data.error
        } else if (errorObj.data?.message) {
          errorMessage = errorObj.data.message
        } else if (errorObj.message) {
          errorMessage = errorObj.message
        }
        
        // Add status code info
        if (errorObj.status) {
          errorMessage = `[${errorObj.status}] ${errorMessage}`
        }
      }
      
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/kaprodi/assignment">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat Penugasan Baru</h1>
            <p className="text-slate-600 mt-1">
              Tugaskan CPL kepada dosen untuk pengembangan kurikulum
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Informasi Penugasan
              </CardTitle>
              <CardDescription>
                Pilih CPL dan dosen yang akan ditugaskan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Submit Error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Gagal Membuat Penugasan</h4>
                    <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap font-sans">{submitError}</pre>
                  </div>
                </div>
              )}

              {/* CPL Selection */}
              <div className="space-y-2">
                <Label htmlFor="cpl_id">
                  CPL <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.cpl_id} 
                  onValueChange={(value) => handleInputChange('cpl_id', value)}
                >
                  <SelectTrigger className={errors.cpl_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih CPL yang akan ditugaskan" />
                  </SelectTrigger>
                  <SelectContent>
                    {cplList.map((cpl) => (
                      <SelectItem key={cpl.id} value={cpl.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-600">{cpl.kode}</span>
                          <span className="text-slate-600">- {cpl.nama}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cpl_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cpl_id}
                  </p>
                )}
                {cplList.length === 0 && (
                  <p className="text-sm text-yellow-600">
                    Tidak ada CPL dengan status published. Publish CPL terlebih dahulu.
                  </p>
                )}
              </div>

              {/* Dosen Selection */}
              <div className="space-y-2">
                <Label htmlFor="dosen_id">
                  Dosen <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.dosen_id} 
                  onValueChange={(value) => handleInputChange('dosen_id', value)}
                >
                  <SelectTrigger className={errors.dosen_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih dosen yang akan ditugaskan" />
                  </SelectTrigger>
                  <SelectContent>
                    {dosenList.map((dosen) => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{dosen.nama}</span>
                          <span className="text-slate-400 text-sm">({dosen.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dosen_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dosen_id}
                  </p>
                )}
                {dosenList.length === 0 && (
                  <p className="text-sm text-yellow-600">
                    Tidak ada dosen aktif. Tambahkan dosen terlebih dahulu.
                  </p>
                )}
              </div>

              {/* Mata Kuliah Selection (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="mata_kuliah_id">
                  Mata Kuliah <span className="text-slate-400">(Opsional)</span>
                </Label>
                <Select 
                  value={formData.mata_kuliah_id || 'none'} 
                  onValueChange={(value) => handleInputChange('mata_kuliah_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata kuliah terkait (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {mataKuliahList.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="font-mono text-xs text-slate-500">{mk.kode}</span>
                          <span>{mk.nama}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Pilih mata kuliah jika penugasan terkait dengan mata kuliah tertentu
                </p>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Deadline <span className="text-slate-400">(Opsional)</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-slate-500">
                  Tentukan batas waktu pengerjaan jika diperlukan
                </p>
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="catatan">
                  Catatan <span className="text-slate-400">(Opsional)</span>
                </Label>
                <Textarea
                  id="catatan"
                  placeholder="Tambahkan catatan atau instruksi untuk dosen..."
                  value={formData.catatan}
                  onChange={(e) => handleInputChange('catatan', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" asChild>
              <Link href="/kaprodi/assignment">Batal</Link>
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || cplList.length === 0 || dosenList.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Buat Penugasan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
