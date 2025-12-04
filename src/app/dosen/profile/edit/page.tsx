"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Save,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  Shield,
  Key,
  Eye,
  EyeOff,
  Upload,
  X,
  BookOpen
} from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'

interface ProfileForm {
  nama: string
  email: string
  phone: string
  nidn: string
  jabatanFungsional: string
  alamat: string
  tanggalLahir: string
  tempatLahir: string
  pendidikan: string
  bidangKeahlian: string[]
  mataKuliahDiampu: string[]
  bio: string
  avatar?: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function EditDosenProfilePage() {
  const user = mockUsers[1] // Dosen user
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nama: user.nama,
    email: user.email,
    phone: '081234567891',
    nidn: '0101018501',
    jabatanFungsional: 'Lektor',
    alamat: 'Jl. Dosen No. 456, Jakarta Pusat',
    tanggalLahir: '1983-03-15',
    tempatLahir: 'Bandung',
    pendidikan: 'S2 Teknik Informatika',
    bidangKeahlian: ['Algoritma dan Pemrograman', 'Struktur Data', 'Basis Data'],
    mataKuliahDiampu: ['TIF101 - Algoritma dan Pemrograman', 'TIF201 - Struktur Data', 'TIF301 - Basis Data'],
    bio: 'Dosen dengan pengalaman 10 tahun mengajar di bidang pemrograman dan basis data. Aktif dalam penelitian dan pengembangan aplikasi web.'
  })

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [newKeahlian, setNewKeahlian] = useState('')
  const [newMataKuliah, setNewMataKuliah] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Dosen profile updated:', profileForm)
      alert('Profile berhasil diperbarui!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Gagal memperbarui profile!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password baru harus minimal 8 karakter!')
      return
    }

    setIsChangingPassword(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Password changed')
      alert('Password berhasil diubah!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Gagal mengubah password!')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileForm(prev => ({
          ...prev,
          avatar: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addKeahlian = () => {
    if (newKeahlian.trim() && !profileForm.bidangKeahlian.includes(newKeahlian.trim())) {
      setProfileForm(prev => ({
        ...prev,
        bidangKeahlian: [...prev.bidangKeahlian, newKeahlian.trim()]
      }))
      setNewKeahlian('')
    }
  }

  const removeKeahlian = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      bidangKeahlian: prev.bidangKeahlian.filter((_, i) => i !== index)
    }))
  }

  const addMataKuliah = () => {
    if (newMataKuliah.trim() && !profileForm.mataKuliahDiampu.includes(newMataKuliah.trim())) {
      setProfileForm(prev => ({
        ...prev,
        mataKuliahDiampu: [...prev.mataKuliahDiampu, newMataKuliah.trim()]
      }))
      setNewMataKuliah('')
    }
  }

  const removeMataKuliah = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      mataKuliahDiampu: prev.mataKuliahDiampu.filter((_, i) => i !== index)
    }))
  }

  const initials = profileForm.nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DashboardLayout user={{ ...user, role: 'dosen' }}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-600">
            Kelola informasi pribadi dan pengaturan akun dosen
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar & Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Informasi Dasar
                  </CardTitle>
                  <CardDescription>
                    Foto profile dan informasi dasar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileForm.avatar || user.avatar} alt={profileForm.nama} />
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label>Foto Profile</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                        </Button>
                        {profileForm.avatar && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setProfileForm(prev => ({ ...prev, avatar: undefined }))}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Hapus
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        Format: JPG, PNG. Maksimal 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={profileForm.nama}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, nama: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nidn">NIDN</Label>
                      <Input
                        id="nidn"
                        value={profileForm.nidn}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, nidn: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Informasi Akademik
                  </CardTitle>
                  <CardDescription>
                    Jabatan dan informasi akademik
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jabatanFungsional">Jabatan Fungsional</Label>
                      <select
                        id="jabatanFungsional"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={profileForm.jabatanFungsional}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, jabatanFungsional: e.target.value }))}
                      >
                        <option value="Asisten Ahli">Asisten Ahli</option>
                        <option value="Lektor">Lektor</option>
                        <option value="Lektor Kepala">Lektor Kepala</option>
                        <option value="Guru Besar">Guru Besar</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                      <Input
                        id="pendidikan"
                        value={profileForm.pendidikan}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, pendidikan: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bidang Keahlian</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tambahkan bidang keahlian..."
                        value={newKeahlian}
                        onChange={(e) => setNewKeahlian(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeahlian())}
                      />
                      <Button type="button" onClick={addKeahlian} size="sm">
                        Tambah
                      </Button>
                    </div>
                    
                    {profileForm.bidangKeahlian.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileForm.bidangKeahlian.map((keahlian, index) => (
                          <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {keahlian}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeKeahlian(index)}
                              className="h-auto p-0 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Mata Kuliah yang Diampu</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tambahkan mata kuliah..."
                        value={newMataKuliah}
                        onChange={(e) => setNewMataKuliah(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMataKuliah())}
                      />
                      <Button type="button" onClick={addMataKuliah} size="sm">
                        Tambah
                      </Button>
                    </div>
                    
                    {profileForm.mataKuliahDiampu.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {profileForm.mataKuliahDiampu.map((mk, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="flex-1 text-sm">{mk}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMataKuliah(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio/Deskripsi</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Ceritakan tentang diri Anda, pengalaman mengajar, dan keahlian..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Informasi Pribadi
                  </CardTitle>
                  <CardDescription>
                    Informasi pribadi dan kontak
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                      <Input
                        id="tempatLahir"
                        value={profileForm.tempatLahir}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, tempatLahir: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggalLahir"
                        type="date"
                        value={profileForm.tanggalLahir}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      rows={3}
                      value={profileForm.alamat}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, alamat: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline">
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-red-600" />
                  Ubah Password
                </CardTitle>
                <CardDescription>
                  Ubah password untuk keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600">Minimal 8 karakter</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                    <Button type="submit" disabled={isChangingPassword}>
                      <Shield className="h-4 w-4 mr-2" />
                      {isChangingPassword ? 'Mengubah...' : 'Ubah Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profileForm.avatar || user.avatar} alt={profileForm.nama} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profileForm.nama}</p>
                    <p className="text-sm text-slate-600">{profileForm.jabatanFungsional}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span>{profileForm.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>{profileForm.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    <span>NIDN: {profileForm.nidn}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Bidang Keahlian:</p>
                  <div className="flex flex-wrap gap-1">
                    {profileForm.bidangKeahlian.map((keahlian, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {keahlian}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Mata Kuliah:</p>
                  <p className="text-xs text-slate-600">{profileForm.mataKuliahDiampu.length} mata kuliah</p>
                </div>
              </CardContent>
            </Card>

            {/* Teaching Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Statistik Mengajar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Mata kuliah diampu:</span>
                  <span className="font-medium">{profileForm.mataKuliahDiampu.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>RPS aktif:</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Mahasiswa dibimbing:</span>
                  <span className="font-medium">120</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tugas pending:</span>
                  <span className="text-yellow-600 font-medium">2</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Terakhir login:</span>
                  <span className="text-slate-600">1 jam yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Password terakhir diubah:</span>
                  <span className="text-slate-600">3 bulan yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Status verifikasi:</span>
                  <span className="text-green-600 font-medium">Terverifikasi</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}