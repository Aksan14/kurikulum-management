"use client"

import { useState } from "react"
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
  AlertCircle
} from "lucide-react"
import { mockUsers } from "@/lib/mock-data"
import Link from "next/link"

export default function CreateCPLPage() {
  const user = mockUsers[0]
  const [formData, setFormData] = useState({
    kode: '',
    judul: '',
    deskripsi: '',
    aspek: '',
    kategori: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent, action: 'draft' | 'publish') => {
    e.preventDefault()
    // Validation logic here
    const newErrors: Record<string, string> = {}
    if (!formData.kode) newErrors.kode = 'Kode CPL wajib diisi'
    if (!formData.judul) newErrors.judul = 'Judul wajib diisi'
    if (!formData.deskripsi) newErrors.deskripsi = 'Deskripsi wajib diisi'
    if (!formData.aspek) newErrors.aspek = 'Aspek wajib dipilih'
    if (!formData.kategori) newErrors.kategori = 'Kategori wajib dipilih'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit logic here
    console.log('Submitting:', formData, action)
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
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
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

              {/* Judul */}
              <div className="grid gap-2">
                <Label htmlFor="judul">
                  Judul <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="judul"
                  placeholder="Contoh: Kemampuan Berpikir Kritis"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className={errors.judul ? 'border-red-500' : ''}
                />
                {errors.judul && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.judul}
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
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className={errors.deskripsi ? 'border-red-500' : ''}
                />
                {errors.deskripsi && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.deskripsi}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Jelaskan kompetensi yang diharapkan mahasiswa setelah lulus
                </p>
              </div>

              {/* Aspek dan Kategori */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>
                    Aspek <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.aspek}
                    onValueChange={(value) => setFormData({ ...formData, aspek: value })}
                  >
                    <SelectTrigger className={errors.aspek ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih aspek CPL" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sikap">Sikap</SelectItem>
                      <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                      <SelectItem value="keterampilan_umum">Keterampilan Umum</SelectItem>
                      <SelectItem value="keterampilan_khusus">Keterampilan Khusus</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.aspek && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.aspek}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                  >
                    <SelectTrigger className={errors.kategori ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kompetensi Utama">Kompetensi Utama</SelectItem>
                      <SelectItem value="Kompetensi Pendukung">Kompetensi Pendukung</SelectItem>
                      <SelectItem value="Kompetensi Lainnya">Kompetensi Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.kategori && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.kategori}
                    </p>
                  )}
                </div>
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

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/kaprodi/cpl">
                Batal
              </Link>
            </Button>
            <div className="flex gap-3">
              <Button type="submit" variant="outline">
                <Save className="h-4 w-4" />
                Simpan sebagai Draft
              </Button>
              <Button type="button" onClick={(e) => handleSubmit(e, 'publish')}>
                <Send className="h-4 w-4" />
                Simpan & Publish
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
