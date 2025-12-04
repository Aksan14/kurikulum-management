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
  X
} from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'

interface ProfileForm {
  nama: string
  email: string
  phone: string
  nip: string
  jabatan: string
  alamat: string
  tanggalLahir: string
  tempatLahir: string
  pendidikan: string
  bidangKeahlian: string[]
  bio: string
  avatar?: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function EditProfilePage() {
  const user = mockUsers[0] // Kaprodi user
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nama: user.nama,
    email: user.email,
    phone: '081234567890',
    nip: '198501012010121001',
    jabatan: 'Ketua Program Studi Teknik Informatika',
    alamat: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    tanggalLahir: '1985-01-01',
    tempatLahir: 'Jakarta',
    pendidikan: 'S3 Teknik Informatika',
    bidangKeahlian: ['Rekayasa Perangkat Lunak', 'Basis Data', 'Sistem Informasi'],
    bio: 'Dosen dan peneliti di bidang teknologi informasi dengan pengalaman lebih dari 15 tahun dalam pengembangan sistem informasi dan manajemen data.'
  })

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [newKeahlian, setNewKeahlian] = useState('')
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
      
      console.log('Profile updated:', profileForm)
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

  const initials = profileForm.nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-600">
            Kelola informasi pribadi dan pengaturan akun Anda
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
                      <Label htmlFor="nip">NIP</Label>
                      <Input
                        id="nip"
                        value={profileForm.nip}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, nip: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Informasi Profesional
                  </CardTitle>
                  <CardDescription>
                    Jabatan dan informasi karir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                      id="jabatan"
                      value={profileForm.jabatan}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, jabatan: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                    <Input
                      id="pendidikan"
                      value={profileForm.pendidikan}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, pendidikan: e.target.value }))}
                    />
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
                    <Label htmlFor="bio">Bio/Deskripsi</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Ceritakan tentang diri Anda, pengalaman, dan keahlian..."
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
                    <p className="text-sm text-slate-600">{profileForm.jabatan}</p>
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
                    <span>Program Studi Teknik Informatika</span>
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
                  <span className="text-slate-600">2 jam yang lalu</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Password terakhir diubah:</span>
                  <span className="text-slate-600">1 bulan yang lalu</span>
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