"use client"

import React, { useState } from "react"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Camera,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertCircle
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockUsers } from "@/lib/mock-data"

export default function SettingsPage() {
  const user = mockUsers.find(u => u.role === "kaprodi")!
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")

  const [profile, setProfile] = useState({
    nama: user.nama,
    email: user.email,
    phone: "081234567890",
    nip: "198501012010011001",
    jabatan: "Ketua Program Studi",
    fakultas: "Fakultas Teknik",
    prodi: "Teknik Informatika",
    bio: "Dosen tetap di Program Studi Teknik Informatika dengan fokus penelitian di bidang Software Engineering dan Machine Learning."
  })

  const [notifications, setNotifications] = useState({
    emailRpsSubmission: true,
    emailRpsApproval: true,
    emailCplAssignment: false,
    emailWeeklyReport: true,
    pushRpsSubmission: true,
    pushRpsApproval: true,
    pushCplAssignment: true,
    pushDeadline: true
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-600 mt-1">Kelola profil dan preferensi akun Anda</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-green-800 text-sm font-medium">Pengaturan berhasil disimpan!</p>
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Bell className="h-4 w-4 mr-2" />
              Notifikasi
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Palette className="h-4 w-4 mr-2" />
              Tampilan
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Keamanan
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
                <CardDescription>Foto yang akan ditampilkan di profil Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={user.avatar} alt={user.nama} />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                        {user.nama.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        Upload Foto Baru
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Hapus Foto
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      JPG, GIF atau PNG. Maksimal 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
                <CardDescription>Data pribadi yang terdaftar di sistem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="nama"
                        value={profile.nama}
                        onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP / NIDN</Label>
                    <Input
                      id="nip"
                      value={profile.nip}
                      onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                  <p className="text-xs text-gray-500">
                    {profile.bio.length}/500 karakter
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Institusi</CardTitle>
                <CardDescription>Afiliasi dan jabatan di institusi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fakultas">Fakultas</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fakultas"
                        value={profile.fakultas}
                        onChange={(e) => setProfile({ ...profile, fakultas: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prodi">Program Studi</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="prodi"
                        value={profile.prodi}
                        onChange={(e) => setProfile({ ...profile, prodi: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                      id="jabatan"
                      value={profile.jabatan}
                      onChange={(e) => setProfile({ ...profile, jabatan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {user.role === "kaprodi" ? "Ketua Program Studi" : "Dosen"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi Email</CardTitle>
                <CardDescription>Pilih notifikasi yang ingin Anda terima via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NotificationToggle
                  label="Pengajuan RPS Baru"
                  description="Notifikasi saat dosen mengajukan RPS untuk direview"
                  checked={notifications.emailRpsSubmission}
                  onChange={(checked) => setNotifications({ ...notifications, emailRpsSubmission: checked })}
                />
                <NotificationToggle
                  label="Persetujuan RPS"
                  description="Notifikasi saat RPS disetujui atau ditolak"
                  checked={notifications.emailRpsApproval}
                  onChange={(checked) => setNotifications({ ...notifications, emailRpsApproval: checked })}
                />
                <NotificationToggle
                  label="Penugasan CPL"
                  description="Notifikasi saat ada penugasan CPL baru"
                  checked={notifications.emailCplAssignment}
                  onChange={(checked) => setNotifications({ ...notifications, emailCplAssignment: checked })}
                />
                <NotificationToggle
                  label="Laporan Mingguan"
                  description="Ringkasan aktivitas setiap minggu"
                  checked={notifications.emailWeeklyReport}
                  onChange={(checked) => setNotifications({ ...notifications, emailWeeklyReport: checked })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifikasi Push</CardTitle>
                <CardDescription>Notifikasi yang ditampilkan di aplikasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NotificationToggle
                  label="Pengajuan RPS Baru"
                  description="Notifikasi instan saat ada RPS baru"
                  checked={notifications.pushRpsSubmission}
                  onChange={(checked) => setNotifications({ ...notifications, pushRpsSubmission: checked })}
                />
                <NotificationToggle
                  label="Update Status RPS"
                  description="Notifikasi perubahan status RPS"
                  checked={notifications.pushRpsApproval}
                  onChange={(checked) => setNotifications({ ...notifications, pushRpsApproval: checked })}
                />
                <NotificationToggle
                  label="Penugasan CPL"
                  description="Notifikasi penugasan baru"
                  checked={notifications.pushCplAssignment}
                  onChange={(checked) => setNotifications({ ...notifications, pushCplAssignment: checked })}
                />
                <NotificationToggle
                  label="Pengingat Deadline"
                  description="Reminder sebelum deadline"
                  checked={notifications.pushDeadline}
                  onChange={(checked) => setNotifications({ ...notifications, pushDeadline: checked })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tema Tampilan</CardTitle>
                <CardDescription>Pilih tema yang nyaman untuk mata Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${theme === "light" 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`
                      mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3
                      ${theme === "light" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}
                    `}>
                      <Sun className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">Light</p>
                    <p className="text-xs text-gray-500 mt-1">Terang</p>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${theme === "dark" 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`
                      mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3
                      ${theme === "dark" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}
                    `}>
                      <Moon className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">Dark</p>
                    <p className="text-xs text-gray-500 mt-1">Gelap</p>
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${theme === "system" 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" 
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`
                      mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3
                      ${theme === "system" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}
                    `}>
                      <Monitor className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">System</p>
                    <p className="text-xs text-gray-500 mt-1">Ikuti sistem</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bahasa</CardTitle>
                <CardDescription>Pilih bahasa tampilan aplikasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-600 bg-blue-50">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Bahasa Indonesia</span>
                    <Check className="h-4 w-4 text-blue-600 ml-2" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">English</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>Pastikan password Anda kuat dan unik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="mt-2">Ubah Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sesi Aktif</CardTitle>
                <CardDescription>Perangkat yang sedang login ke akun Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Monitor className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Windows - Chrome</p>
                      <p className="text-sm text-gray-500">Jakarta, Indonesia • Saat ini aktif</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Perangkat Ini</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Monitor className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">MacOS - Safari</p>
                      <p className="text-sm text-gray-500">Bandung, Indonesia • 2 hari lalu</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Zona Berbahaya
                </CardTitle>
                <CardDescription className="text-red-600">
                  Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700">
                  Hapus Akun
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors
          ${checked ? "bg-blue-600" : "bg-gray-200"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  )
}
