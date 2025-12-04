"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Save, 
  Send,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  Calendar,
  Target,
  List,
  GraduationCap,
  AlertCircle
} from "lucide-react"
import { mockUsers, mockMataKuliah, mockCPLs } from "@/lib/mock-data"
import Link from "next/link"

export default function CreateRPSPage() {
  const user = mockUsers[1]
  const [activeTab, setActiveTab] = useState('informasi')
  
  const [formData, setFormData] = useState({
    mataKuliahId: '',
    tahunAkademik: '2024/2025',
    deskripsi: '',
    tujuan: '',
    metode: [] as string[],
    bobotNilai: {
      tugas: 20,
      uts: 25,
      uas: 35,
      kehadiran: 10,
      praktikum: 10
    }
  })

  const [cpmk, setCpmk] = useState([
    { id: '1', kode: 'CPMK-01', deskripsi: '', cplIds: [] as string[] }
  ])

  const [rencanaPembelajaran, setRencanaPembelajaran] = useState([
    { pertemuan: 1, topik: '', subTopik: '', metode: '', waktu: 150, cpmkIds: [] as string[], materi: '' }
  ])

  const [bahanBacaan, setBahanBacaan] = useState([
    { id: '1', judul: '', penulis: '', tahun: 2024, jenis: 'buku' }
  ])

  const metodeOptions = [
    'Ceramah', 'Diskusi', 'Praktikum', 'Tugas', 'Project-Based Learning',
    'Problem-Based Learning', 'Case Study', 'Simulasi', 'Presentasi'
  ]

  const publishedCPLs = mockCPLs.filter(cpl => cpl.status === 'published')

  const addCPMK = () => {
    setCpmk([...cpmk, { 
      id: String(cpmk.length + 1), 
      kode: `CPMK-${String(cpmk.length + 1).padStart(2, '0')}`, 
      deskripsi: '', 
      cplIds: [] 
    }])
  }

  const removeCPMK = (index: number) => {
    setCpmk(cpmk.filter((_, i) => i !== index))
  }

  const addPertemuan = () => {
    setRencanaPembelajaran([...rencanaPembelajaran, {
      pertemuan: rencanaPembelajaran.length + 1,
      topik: '',
      subTopik: '',
      metode: '',
      waktu: 150,
      cpmkIds: [],
      materi: ''
    }])
  }

  const removePertemuan = (index: number) => {
    setRencanaPembelajaran(rencanaPembelajaran.filter((_, i) => i !== index))
  }

  const addBahanBacaan = () => {
    setBahanBacaan([...bahanBacaan, {
      id: String(bahanBacaan.length + 1),
      judul: '',
      penulis: '',
      tahun: 2024,
      jenis: 'buku'
    }])
  }

  const removeBahanBacaan = (index: number) => {
    setBahanBacaan(bahanBacaan.filter((_, i) => i !== index))
  }

  return (
    <DashboardLayout user={{...user, role: 'dosen'}} unreadNotifications={2}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dosen/rps">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Buat RPS Baru</h1>
            <p className="mt-1 text-slate-500">
              Rencana Pembelajaran Semester
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Save className="h-4 w-4" />
              Simpan Draft
            </Button>
            <Button>
              <Send className="h-4 w-4" />
              Submit untuk Review
            </Button>
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="informasi" className="gap-2">
              <FileText className="h-4 w-4" />
              Informasi
            </TabsTrigger>
            <TabsTrigger value="cpmk" className="gap-2">
              <Target className="h-4 w-4" />
              CPMK
            </TabsTrigger>
            <TabsTrigger value="rencana" className="gap-2">
              <Calendar className="h-4 w-4" />
              Rencana
            </TabsTrigger>
            <TabsTrigger value="referensi" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Referensi
            </TabsTrigger>
            <TabsTrigger value="evaluasi" className="gap-2">
              <List className="h-4 w-4" />
              Evaluasi
            </TabsTrigger>
          </TabsList>

          {/* Tab: Informasi Umum */}
          <TabsContent value="informasi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Mata Kuliah</CardTitle>
                <CardDescription>Pilih mata kuliah dan lengkapi informasi dasar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mata Kuliah *</Label>
                    <Select 
                      value={formData.mataKuliahId}
                      onValueChange={(value) => setFormData({...formData, mataKuliahId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata kuliah" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMataKuliah.map((mk) => (
                          <SelectItem key={mk.id} value={mk.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{mk.kode}</span>
                              <span>{mk.nama}</span>
                              <Badge variant="outline" className="text-xs">{mk.sks} SKS</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Akademik *</Label>
                    <Select 
                      value={formData.tahunAkademik}
                      onValueChange={(value) => setFormData({...formData, tahunAkademik: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi Mata Kuliah *</Label>
                  <Textarea 
                    placeholder="Deskripsikan mata kuliah secara umum..."
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tujuan Pembelajaran *</Label>
                  <Textarea 
                    placeholder="Jelaskan tujuan pembelajaran yang ingin dicapai..."
                    rows={3}
                    value={formData.tujuan}
                    onChange={(e) => setFormData({...formData, tujuan: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembelajaran *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {metodeOptions.map((metode) => (
                      <div key={metode} className="flex items-center space-x-2">
                        <Checkbox 
                          id={metode}
                          checked={formData.metode.includes(metode)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({...formData, metode: [...formData.metode, metode]})
                            } else {
                              setFormData({...formData, metode: formData.metode.filter(m => m !== metode)})
                            }
                          }}
                        />
                        <label htmlFor={metode} className="text-sm">{metode}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bobot Penilaian</CardTitle>
                <CardDescription>Total bobot harus 100%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-2">
                    <Label>Tugas (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.bobotNilai.tugas}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bobotNilai: {...formData.bobotNilai, tugas: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UTS (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.bobotNilai.uts}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bobotNilai: {...formData.bobotNilai, uts: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UAS (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.bobotNilai.uas}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bobotNilai: {...formData.bobotNilai, uas: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kehadiran (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.bobotNilai.kehadiran}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bobotNilai: {...formData.bobotNilai, kehadiran: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Praktikum (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.bobotNilai.praktikum}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bobotNilai: {...formData.bobotNilai, praktikum: Number(e.target.value)}
                      })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Total:</span>
                  <Badge variant={
                    Object.values(formData.bobotNilai).reduce((a, b) => a + b, 0) === 100 
                      ? 'success' 
                      : 'danger'
                  }>
                    {Object.values(formData.bobotNilai).reduce((a, b) => a + b, 0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: CPMK */}
          <TabsContent value="cpmk" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Capaian Pembelajaran Mata Kuliah (CPMK)</CardTitle>
                  <CardDescription>Definisikan CPMK dan petakan ke CPL yang relevan</CardDescription>
                </div>
                <Button onClick={addCPMK}>
                  <Plus className="h-4 w-4" />
                  Tambah CPMK
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {cpmk.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <Input value={item.kode} readOnly className="font-mono" />
                          </div>
                          <div className="flex-1">
                            <Textarea 
                              placeholder="Deskripsi capaian pembelajaran mata kuliah..."
                              rows={2}
                              value={item.deskripsi}
                              onChange={(e) => {
                                const newCpmk = [...cpmk]
                                newCpmk[index].deskripsi = e.target.value
                                setCpmk(newCpmk)
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Pemetaan ke CPL:</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {publishedCPLs.map((cpl) => (
                              <Badge 
                                key={cpl.id}
                                variant={item.cplIds.includes(cpl.id) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newCpmk = [...cpmk]
                                  if (item.cplIds.includes(cpl.id)) {
                                    newCpmk[index].cplIds = item.cplIds.filter(id => id !== cpl.id)
                                  } else {
                                    newCpmk[index].cplIds = [...item.cplIds, cpl.id]
                                  }
                                  setCpmk(newCpmk)
                                }}
                              >
                                <GraduationCap className="mr-1 h-3 w-3" />
                                {cpl.kode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      {cpmk.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeCPMK(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Tips Menulis CPMK</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>• Gunakan kata kerja operasional yang terukur</li>
                      <li>• Pastikan setiap CPMK mendukung minimal satu CPL</li>
                      <li>• CPMK harus dapat dinilai/diukur pencapaiannya</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Rencana Pembelajaran */}
          <TabsContent value="rencana" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rencana Pertemuan</CardTitle>
                  <CardDescription>Detail setiap pertemuan perkuliahan</CardDescription>
                </div>
                <Button onClick={addPertemuan}>
                  <Plus className="h-4 w-4" />
                  Tambah Pertemuan
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {rencanaPembelajaran.map((item, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                        {item.pertemuan}
                      </div>
                      {rencanaPembelajaran.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removePertemuan(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Topik</Label>
                        <Input 
                          placeholder="Topik pertemuan"
                          value={item.topik}
                          onChange={(e) => {
                            const newRencana = [...rencanaPembelajaran]
                            newRencana[index].topik = e.target.value
                            setRencanaPembelajaran(newRencana)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Metode</Label>
                        <Select
                          value={item.metode}
                          onValueChange={(value) => {
                            const newRencana = [...rencanaPembelajaran]
                            newRencana[index].metode = value
                            setRencanaPembelajaran(newRencana)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                          <SelectContent>
                            {metodeOptions.map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Sub Topik</Label>
                        <Input 
                          placeholder="Sub topik (pisahkan dengan koma)"
                          value={item.subTopik}
                          onChange={(e) => {
                            const newRencana = [...rencanaPembelajaran]
                            newRencana[index].subTopik = e.target.value
                            setRencanaPembelajaran(newRencana)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Waktu (menit)</Label>
                        <Input 
                          type="number"
                          value={item.waktu}
                          onChange={(e) => {
                            const newRencana = [...rencanaPembelajaran]
                            newRencana[index].waktu = Number(e.target.value)
                            setRencanaPembelajaran(newRencana)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Materi/Bahan</Label>
                        <Input 
                          placeholder="Materi perkuliahan"
                          value={item.materi}
                          onChange={(e) => {
                            const newRencana = [...rencanaPembelajaran]
                            newRencana[index].materi = e.target.value
                            setRencanaPembelajaran(newRencana)
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-xs text-slate-500">CPMK yang dicapai:</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cpmk.map((c) => (
                          <Badge 
                            key={c.id}
                            variant={item.cpmkIds.includes(c.id) ? 'info' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const newRencana = [...rencanaPembelajaran]
                              if (item.cpmkIds.includes(c.id)) {
                                newRencana[index].cpmkIds = item.cpmkIds.filter(id => id !== c.id)
                              } else {
                                newRencana[index].cpmkIds = [...item.cpmkIds, c.id]
                              }
                              setRencanaPembelajaran(newRencana)
                            }}
                          >
                            {c.kode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Referensi */}
          <TabsContent value="referensi" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bahan Bacaan / Referensi</CardTitle>
                  <CardDescription>Daftar pustaka yang digunakan dalam perkuliahan</CardDescription>
                </div>
                <Button onClick={addBahanBacaan}>
                  <Plus className="h-4 w-4" />
                  Tambah Referensi
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {bahanBacaan.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Judul</Label>
                          <Input 
                            placeholder="Judul buku/artikel"
                            value={item.judul}
                            onChange={(e) => {
                              const newBahan = [...bahanBacaan]
                              newBahan[index].judul = e.target.value
                              setBahanBacaan(newBahan)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Penulis</Label>
                          <Input 
                            placeholder="Nama penulis"
                            value={item.penulis}
                            onChange={(e) => {
                              const newBahan = [...bahanBacaan]
                              newBahan[index].penulis = e.target.value
                              setBahanBacaan(newBahan)
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Tahun</Label>
                            <Input 
                              type="number"
                              value={item.tahun}
                              onChange={(e) => {
                                const newBahan = [...bahanBacaan]
                                newBahan[index].tahun = Number(e.target.value)
                                setBahanBacaan(newBahan)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Jenis</Label>
                            <Select
                              value={item.jenis}
                              onValueChange={(value) => {
                                const newBahan = [...bahanBacaan]
                                newBahan[index].jenis = value
                                setBahanBacaan(newBahan)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="buku">Buku</SelectItem>
                                <SelectItem value="jurnal">Jurnal</SelectItem>
                                <SelectItem value="artikel">Artikel</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      {bahanBacaan.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeBahanBacaan(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Evaluasi */}
          <TabsContent value="evaluasi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluasi Pembelajaran</CardTitle>
                <CardDescription>Metode dan instrumen evaluasi yang digunakan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-900">Ringkasan Bobot Penilaian</h4>
                  <div className="mt-4 grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{formData.bobotNilai.tugas}%</p>
                      <p className="text-sm text-slate-500">Tugas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{formData.bobotNilai.uts}%</p>
                      <p className="text-sm text-slate-500">UTS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{formData.bobotNilai.uas}%</p>
                      <p className="text-sm text-slate-500">UAS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{formData.bobotNilai.kehadiran}%</p>
                      <p className="text-sm text-slate-500">Kehadiran</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-600">{formData.bobotNilai.praktikum}%</p>
                      <p className="text-sm text-slate-500">Praktikum</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Detail Evaluasi</h4>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Jenis Evaluasi</Label>
                        <Select defaultValue="tugas">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tugas">Tugas Individu</SelectItem>
                            <SelectItem value="tugas_kelompok">Tugas Kelompok</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="presentasi">Presentasi</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="uts">UTS</SelectItem>
                            <SelectItem value="uas">UAS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Minggu Pelaksanaan</Label>
                        <Input placeholder="Contoh: 3, 5, 7" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea placeholder="Jelaskan detail evaluasi..." rows={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 -mx-6 bg-white border-t border-slate-200 p-4 -mb-6">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/dosen/rps">
                Batal
              </Link>
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="h-4 w-4" />
                Simpan sebagai Draft
              </Button>
              <Button>
                <Send className="h-4 w-4" />
                Submit untuk Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
