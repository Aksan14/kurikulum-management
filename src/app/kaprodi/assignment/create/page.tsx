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
  Loader2,
  AlertTriangle,
  Settings
} from "lucide-react"
import { cplAssignmentService, CreateBulkAssignmentRequest, CPLAssignment, CreateAssignmentRequest } from "@/lib/api/cpl-assignment"
import { ApiError } from "@/lib/api/client"
import { cplService, CPL } from "@/lib/api/cpl"
import { usersService, User as ApiUser } from "@/lib/api/users"
import { mataKuliahService, MataKuliah } from "@/lib/api/mata-kuliah"
import { cplMKMappingService, CPLMKMapping } from "@/lib/api/cpl-mk-mapping"
import { authService } from "@/lib/api/auth"

export default function CreateAssignmentPage() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    mata_kuliah_id: "",
    dosen_id: "",
    deadline: "",
    catatan: ""
  })
  
  // Options state
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
  const [dosenList, setDosenList] = useState<ApiUser[]>([])
  const [mappedCPLs, setMappedCPLs] = useState<CPLMKMapping[]>([])
  
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
      const [usersResponse, mkResponse] = await Promise.all([
        usersService.getAll({ role: 'dosen', status: 'active', limit: 100 }),
        mataKuliahService.getAll({ status: 'aktif', limit: 100 })
      ])

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

  // Fetch mapped CPLs when mata kuliah changes
  const fetchMappedCPLs = useCallback(async (mkId: string) => {
    if (!mkId) {
      setMappedCPLs([])
      return
    }

    try {
      const response = await cplMKMappingService.getByMK(mkId)
      if (response.success && response.data && response.data.data) {
        setMappedCPLs(response.data.data)
      } else {
        setMappedCPLs([])
      }
    } catch (err) {
      console.error('Error fetching mapped CPLs:', err)
      setMappedCPLs([])
    }
  }, [])

  // Clear error on input change
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // Fetch mapped CPLs when mata kuliah changes
    if (field === 'mata_kuliah_id') {
      fetchMappedCPLs(value)
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.mata_kuliah_id) {
      newErrors.mata_kuliah_id = "Pilih mata kuliah yang akan ditugaskan"
    }
    if (!formData.dosen_id) {
      newErrors.dosen_id = "Pilih dosen yang akan ditugaskan"
    }
    if (mappedCPLs.length === 0) {
      newErrors.mata_kuliah_id = "Mata kuliah yang dipilih tidak memiliki mapping CPL. Silakan mapping CPL terlebih dahulu."
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
      // Get CPL IDs from mappings
      const cplIds = mappedCPLs.map(mapping => mapping.cpl_id)
      
      // Find mata kuliah name
      const selectedMK = mataKuliahList.find(mk => mk.id === formData.mata_kuliah_id)
      
      // Create assignments for each CPL individually
      const createdAssignments: CPLAssignment[] = []
      const failedAssignments: { cplId: string; error: string }[] = []
      const skippedAssignments: string[] = []
      
      for (const cplId of cplIds) {
        try {
          const assignmentData: CreateAssignmentRequest = {
            cpl_id: cplId,
            dosen_id: formData.dosen_id,
            mata_kuliah: selectedMK?.nama,
            mata_kuliah_id: formData.mata_kuliah_id,
          }
          
          if (formData.deadline && formData.deadline.trim() !== '') {
            assignmentData.deadline = new Date(formData.deadline).toISOString()
          }
          
          if (formData.catatan && formData.catatan.trim() !== '') {
            assignmentData.catatan = formData.catatan.trim()
          }
          
          console.log(`Creating assignment for CPL ${cplId}:`, assignmentData)
          
          const response = await cplAssignmentService.create(assignmentData)
          
          if (response.success && response.data) {
            createdAssignments.push(response.data)
          } else {
            failedAssignments.push({
              cplId,
              error: response.message || `Failed to create assignment for CPL ${cplId}`
            })
          }
        } catch (err) {
          let errorMessage = `Failed to create assignment for CPL ${cplId}`
          let isAlreadyExistsError = false
          
          if (err instanceof ApiError) {
            errorMessage = err.getDetailedMessage() || err.message
            // Check if this is an "assignment already exists" error
            isAlreadyExistsError = errorMessage.toLowerCase().includes('sudah ada') || 
                                   errorMessage.toLowerCase().includes('already exists') ||
                                   err.status === 409 // Conflict status
          } else if (err instanceof Error) {
            errorMessage = err.message
          }
          
          // Only count as failure if it's not an "already exists" error
          if (!isAlreadyExistsError) {
            failedAssignments.push({ cplId, error: errorMessage })
            console.error(`Error creating assignment for CPL ${cplId}:`, err)
          } else {
            skippedAssignments.push(cplId)
            console.log(`Assignment already exists for CPL ${cplId}, skipping`)
          }
        }
      }

      console.log('Successfully created assignments:', createdAssignments)
      console.log('Failed assignments:', failedAssignments)
      console.log('Skipped assignments (already exist):', skippedAssignments)
      
      // Check if any assignments were created successfully
      if (createdAssignments.length > 0) {
        // Some assignments succeeded, show partial success message
        let successMessage = `Berhasil membuat ${createdAssignments.length} penugasan`
        if (skippedAssignments.length > 0) {
          successMessage += `, ${skippedAssignments.length} sudah ada (diabaikan)`
        }
        if (failedAssignments.length > 0) {
          successMessage += `, ${failedAssignments.length} gagal`
        }
        
        // For now, redirect on partial success. In future, could show detailed results
        router.push('/kaprodi/assignment')
      } else if (skippedAssignments.length > 0) {
        // All assignments were skipped (already exist)
        throw new Error(`Semua penugasan sudah ada untuk mata kuliah dan dosen ini`)
      } else {
        // All assignments failed
        const errorMessages = failedAssignments.map(f => f.error).join('\n')
        throw new Error(`Semua penugasan gagal:\n${errorMessages}`)
      }
    } catch (err: unknown) {
      console.error('Full error object:', err)
      
      let errorMessage = 'Terjadi kesalahan saat membuat penugasan'
      
      // Check if it's an ApiError with detailed message
      if (err instanceof ApiError) {
        errorMessage = err.getDetailedMessage() || err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      console.error('Error message:', errorMessage)
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
                Pilih mata kuliah dan dosen yang akan ditugaskan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
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

              {/* Section 1: Mata Kuliah Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Pilih Mata Kuliah</h3>
                </div>
              <div className="space-y-2">
                <Label htmlFor="mata_kuliah_id">
                  Mata Kuliah <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.mata_kuliah_id}
                  onValueChange={(value) => handleInputChange('mata_kuliah_id', value)}
                >
                  <SelectTrigger className={errors.mata_kuliah_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih mata kuliah yang akan ditugaskan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mataKuliahList.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span>{mk.nama}</span>
                          <span className="text-slate-400 text-sm">({mk.kode})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mata_kuliah_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mata_kuliah_id}
                  </p>
                )}
                {mataKuliahList.length === 0 && (
                  <p className="text-sm text-yellow-600">
                    Tidak ada mata kuliah aktif. Tambahkan mata kuliah terlebih dahulu.
                  </p>
                )}
              </div>
              </div>

              {/* Section 2: CPL Preview */}
              {formData.mata_kuliah_id && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Target className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-slate-800">CPL yang Akan Ditugaskan</h3>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {mappedCPLs.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700 font-medium">
                          Mata kuliah ini akan mencakup {mappedCPLs.length} CPL berikut:
                        </p>
                        <div className="grid gap-2">
                          {mappedCPLs.map((mapping) => (
                            <div key={mapping.id} className="flex items-center justify-between bg-white rounded-md p-3 border">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {mapping.cpl?.kode}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {mapping.cpl?.nama}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  mapping.level === 'tinggi' ? 'bg-green-100 text-green-800' :
                                  mapping.level === 'sedang' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {mapping.level === 'tinggi' ? 'Tinggi' :
                                   mapping.level === 'sedang' ? 'Sedang' : 'Rendah'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-yellow-700">
                          Mata kuliah ini belum memiliki mapping CPL.
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Silakan mapping CPL ke mata kuliah ini terlebih dahulu di halaman Mapping.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Dosen Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-slate-800">Pilih Dosen</h3>
                </div>
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
              </div>

              {/* Section 4: Optional Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Settings className="h-4 w-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-800">Pengaturan Tambahan (Opsional)</h3>
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
              disabled={isSubmitting || !formData.mata_kuliah_id || mappedCPLs.length === 0 || dosenList.length === 0}
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
