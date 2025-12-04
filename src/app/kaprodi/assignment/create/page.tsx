"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Send,
  Plus,
  X,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { mockUsers, mockMataKuliah } from '@/lib/mock-data'

interface AssignmentForm {
  title: string
  description: string
  mataKuliah: string
  dosenIds: string[]
  deadline: string
  priority: 'low' | 'medium' | 'high'
  type: 'rps' | 'mapping' | 'review'
  requirements: string[]
}

export default function CreateAssignmentPage() {
  const router = useRouter()
  const user = mockUsers[0] // Kaprodi user
  
  const [form, setForm] = useState<AssignmentForm>({
    title: '',
    description: '',
    mataKuliah: '',
    dosenIds: [],
    deadline: '',
    priority: 'medium',
    type: 'rps',
    requirements: []
  })
  
  const [newRequirement, setNewRequirement] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter dosen users
  const dosenList = mockUsers.filter(user => user.role === 'dosen')
  const availableMataKuliah = mockMataKuliah || []

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }

  const typeLabels = {
    rps: 'Pengisian RPS',
    mapping: 'Mapping CPL/CPMK',
    review: 'Review Dokumen'
  }

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'send') => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Assignment submitted:', { ...form, status: action === 'send' ? 'assigned' : 'draft' })
      
      // Redirect back to assignments
      router.push('/kaprodi/assignment')
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !form.requirements.includes(newRequirement.trim())) {
      setForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const toggleDosen = (dosenId: string) => {
    setForm(prev => ({
      ...prev,
      dosenIds: prev.dosenIds.includes(dosenId)
        ? prev.dosenIds.filter(id => id !== dosenId)
        : [...prev.dosenIds, dosenId]
    }))
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/kaprodi/assignment">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Buat Penugasan Baru</h1>
              <p className="text-slate-600">Buat penugasan untuk dosen mengisi RPS atau tugas lainnya</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => handleSubmit(e, 'send')} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Informasi Dasar
                  </CardTitle>
                  <CardDescription>
                    Isi informasi dasar tentang penugasan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Penugasan *</Label>
                    <Input
                      id="title"
                      placeholder="Contoh: Pengisian RPS Semester Ganjil 2024/2025"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Jelaskan detail penugasan yang harus dikerjakan..."
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Jenis Penugasan *</Label>
                      <select
                        id="type"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.type}
                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                        required
                      >
                        <option value="rps">Pengisian RPS</option>
                        <option value="mapping">Mapping CPL/CPMK</option>
                        <option value="review">Review Dokumen</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas *</Label>
                      <select
                        id="priority"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.priority}
                        onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        required
                      >
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mataKuliah">Mata Kuliah</Label>
                      <select
                        id="mataKuliah"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.mataKuliah}
                        onChange={(e) => setForm(prev => ({ ...prev, mataKuliah: e.target.value }))}
                      >
                        <option value="">Semua Mata Kuliah</option>
                        {availableMataKuliah.map((mk) => (
                          <option key={mk.id} value={mk.id}>
                            {mk.kode} - {mk.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline *</Label>
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={form.deadline}
                        onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Persyaratan Penugasan
                  </CardTitle>
                  <CardDescription>
                    Tambahkan persyaratan atau checklist yang harus dipenuhi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tambahkan persyaratan..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {form.requirements.length > 0 && (
                    <div className="space-y-2">
                      <Label>Persyaratan yang ditambahkan:</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {form.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="flex-1 text-sm">{req}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRequirement(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dosen Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Pilih Dosen
                  </CardTitle>
                  <CardDescription>
                    Pilih dosen yang akan diberi penugasan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {dosenList.map((dosen) => (
                      <div
                        key={dosen.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          form.dosenIds.includes(dosen.id)
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => toggleDosen(dosen.id)}
                      >
                        <input
                          type="checkbox"
                          checked={form.dosenIds.includes(dosen.id)}
                          onChange={() => toggleDosen(dosen.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{dosen.nama}</p>
                          <p className="text-sm text-slate-600">{dosen.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {form.dosenIds.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                      <p>Pilih minimal satu dosen untuk penugasan</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleSubmit(e as any, 'save')}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || form.dosenIds.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Penugasan'}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Preview Penugasan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul:</Label>
                  <p className="text-sm font-medium">{form.title || 'Belum diisi'}</p>
                </div>

                <div className="space-y-2">
                  <Label>Jenis:</Label>
                  <Badge variant="outline">{typeLabels[form.type]}</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Prioritas:</Label>
                  <Badge className={priorityColors[form.priority]} variant="outline">
                    {form.priority === 'low' ? 'Rendah' : 
                     form.priority === 'medium' ? 'Sedang' : 'Tinggi'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Deadline:</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {form.deadline ? new Date(form.deadline).toLocaleString('id-ID') : 'Belum diatur'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dosen Ditugaskan:</Label>
                  <p className="text-sm">{form.dosenIds.length} orang dipilih</p>
                </div>

                <div className="space-y-2">
                  <Label>Persyaratan:</Label>
                  <p className="text-sm">{form.requirements.length} persyaratan</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Berikan judul yang jelas dan deskriptif</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Atur deadline yang realistis</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Tambahkan persyaratan yang spesifik</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pilih dosen yang relevan dengan mata kuliah</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}