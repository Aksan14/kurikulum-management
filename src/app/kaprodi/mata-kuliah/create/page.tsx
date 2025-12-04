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
  BookOpen,
  Plus,
  X,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { mockUsers } from '@/lib/mock-data'

interface MataKuliahForm {
  kode: string
  nama: string
  sks: number
  semester: number
  jenis: 'wajib' | 'pilihan'
  deskripsi: string
  prasyarat: string[]
  dosenPengampu: string[]
  cpl: string[]
  kompetensi: string[]
  status: 'aktif' | 'nonaktif'
}

export default function CreateMataKuliahPage() {
  const router = useRouter()
  const user = mockUsers[0] // Kaprodi user
  
  const [form, setForm] = useState<MataKuliahForm>({
    kode: '',
    nama: '',
    sks: 3,
    semester: 1,
    jenis: 'wajib',
    deskripsi: '',
    prasyarat: [],
    dosenPengampu: [],
    cpl: [],
    kompetensi: [],
    status: 'aktif'
  })
  
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [newCPL, setNewCPL] = useState('')
  const [newKompetensi, setNewKompetensi] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data
  const dosenList = mockUsers.filter(user => user.role === 'dosen')
  const existingMataKuliah = [
    'TIF101 - Algoritma dan Pemrograman',
    'TIF102 - Matematika Diskrit',
    'TIF201 - Struktur Data',
    'TIF202 - Basis Data'
  ]

  const mockCPLList = [
    'CPL-1: Mampu menerapkan pengetahuan matematika, sains, dan rekayasa',
    'CPL-2: Mampu mengidentifikasi, merumuskan, dan menyelesaikan masalah',
    'CPL-3: Mampu merancang sistem/komponen sesuai kebutuhan',
    'CPL-4: Mampu berkomunikasi secara efektif',
    'CPL-5: Mampu bekerja dalam tim multidisiplin'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Mata Kuliah created:', form)
      
      // Redirect back to mata kuliah list
      router.push('/kaprodi/mata-kuliah')
    } catch (error) {
      console.error('Error creating mata kuliah:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (type: 'prasyarat' | 'cpl' | 'kompetensi', value: string, setValue: (val: string) => void) => {
    if (value.trim() && !form[type].includes(value.trim())) {
      setForm(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }))
      setValue('')
    }
  }

  const removeItem = (type: 'prasyarat' | 'cpl' | 'kompetensi', index: number) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const toggleDosen = (dosenId: string) => {
    setForm(prev => ({
      ...prev,
      dosenPengampu: prev.dosenPengampu.includes(dosenId)
        ? prev.dosenPengampu.filter(id => id !== dosenId)
        : [...prev.dosenPengampu, dosenId]
    }))
  }

  return (
    <DashboardLayout user={user}>
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
              <h1 className="text-2xl font-bold text-slate-900">Tambah Mata Kuliah Baru</h1>
              <p className="text-slate-600">Buat mata kuliah baru dalam kurikulum program studi</p>
            </div>
          </div>
        </div>

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
                    <Label htmlFor="kode">Kode Mata Kuliah *</Label>
                    <Input
                      id="kode"
                      placeholder="TIF301"
                      value={form.kode}
                      onChange={(e) => setForm(prev => ({ ...prev, kode: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sks">SKS *</Label>
                    <select
                      id="sks"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.sks}
                      onChange={(e) => setForm(prev => ({ ...prev, sks: Number(e.target.value) }))}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map(sks => (
                        <option key={sks} value={sks}>{sks} SKS</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Mata Kuliah *</Label>
                  <Input
                    id="nama"
                    placeholder="Rekayasa Perangkat Lunak"
                    value={form.nama}
                    onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Deskripsi mata kuliah, tujuan pembelajaran, dan cakupan materi..."
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => setForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <select
                      id="semester"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.semester}
                      onChange={(e) => setForm(prev => ({ ...prev, semester: Number(e.target.value) }))}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenis">Jenis *</Label>
                    <select
                      id="jenis"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.jenis}
                      onChange={(e) => setForm(prev => ({ ...prev, jenis: e.target.value as 'wajib' | 'pilihan' }))}
                      required
                    >
                      <option value="wajib">Wajib</option>
                      <option value="pilihan">Pilihan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as 'aktif' | 'nonaktif' }))}
                      required
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Non-aktif</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Prasyarat Mata Kuliah
                </CardTitle>
                <CardDescription>
                  Mata kuliah yang harus diselesaikan sebelum mengambil mata kuliah ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                  >
                    <option value="">Pilih mata kuliah prasyarat...</option>
                    {existingMataKuliah.map((mk) => (
                      <option key={mk} value={mk}>{mk}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={() => addItem('prasyarat', newPrerequisite, setNewPrerequisite)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.prasyarat.length > 0 && (
                  <div className="space-y-2">
                    {form.prasyarat.map((prasyarat, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <Target className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{prasyarat}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('prasyarat', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CPL Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Pemetaan CPL
                </CardTitle>
                <CardDescription>
                  Capaian Pembelajaran Lulusan yang terkait dengan mata kuliah ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCPL}
                    onChange={(e) => setNewCPL(e.target.value)}
                  >
                    <option value="">Pilih CPL...</option>
                    {mockCPLList.map((cpl) => (
                      <option key={cpl} value={cpl}>{cpl}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={() => addItem('cpl', newCPL, setNewCPL)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.cpl.length > 0 && (
                  <div className="space-y-2">
                    {form.cpl.map((cpl, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{cpl}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('cpl', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Kompetensi Mata Kuliah
                </CardTitle>
                <CardDescription>
                  Kompetensi spesifik yang akan dicapai dalam mata kuliah ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kompetensi mata kuliah..."
                    value={newKompetensi}
                    onChange={(e) => setNewKompetensi(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('kompetensi', newKompetensi, setNewKompetensi))}
                  />
                  <Button type="button" onClick={() => addItem('kompetensi', newKompetensi, setNewKompetensi)} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.kompetensi.length > 0 && (
                  <div className="space-y-2">
                    {form.kompetensi.map((kompetensi, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{kompetensi}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('kompetensi', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dosen Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Dosen Pengampu
                </CardTitle>
                <CardDescription>
                  Pilih dosen yang akan mengampu mata kuliah ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {dosenList.map((dosen) => (
                    <div
                      key={dosen.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        form.dosenPengampu.includes(dosen.id)
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleDosen(dosen.id)}
                    >
                      <input
                        type="checkbox"
                        checked={form.dosenPengampu.includes(dosen.id)}
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
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
              </Button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kode & Nama:</Label>
                  <p className="text-sm font-medium">
                    {form.kode || 'XXX'} - {form.nama || 'Nama Mata Kuliah'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline">{form.sks} SKS</Badge>
                  <Badge variant="outline">Semester {form.semester}</Badge>
                  <Badge className={form.jenis === 'wajib' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} variant="outline">
                    {form.jenis}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Prasyarat:</Label>
                  <p className="text-sm">{form.prasyarat.length} mata kuliah</p>
                </div>

                <div className="space-y-2">
                  <Label>CPL Terpetakan:</Label>
                  <p className="text-sm">{form.cpl.length} CPL</p>
                </div>

                <div className="space-y-2">
                  <Label>Kompetensi:</Label>
                  <p className="text-sm">{form.kompetensi.length} kompetensi</p>
                </div>

                <div className="space-y-2">
                  <Label>Dosen Pengampu:</Label>
                  <p className="text-sm">{form.dosenPengampu.length} dosen</p>
                </div>
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
                  <span>Pastikan prasyarat sudah benar</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Petakan ke CPL yang relevan</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}