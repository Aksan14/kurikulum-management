"use client"

import React, { useState } from "react"
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Book,
  Award,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  School,
  Users,
  FileText,
  Star
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUsers, mockRPS, mockAssignments } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function DosenProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  
  // Simulate current user (dosen-2)
  const currentUser = mockUsers.find(u => u.id === "2")!
  const [profileData, setProfileData] = useState({
    nama: currentUser.nama,
    email: currentUser.email,
    nip: "198501122015041002",
    jabatan: "Lektor",
    fakultas: "Fakultas Teknik",
    prodi: "Teknik Informatika",
    pendidikan: "S2 - Magister Teknik Informatika",
    keahlian: "Machine Learning, Data Mining, Web Development",
    telepon: "+62 812-3456-7890",
    alamat: "Jl. Raya Universitas No. 123, Bandung",
    bio: "Dosen dengan pengalaman 8 tahun di bidang teknologi informasi, fokus pada penelitian machine learning dan pengembangan kurikulum berbasis kompetensi."
  })

  const dosenStats = {
    totalRPS: mockRPS.filter(rps => rps.dosenId === "2").length,
    totalAssignments: mockAssignments.filter(a => a.dosenId === "2").length,
    pengalaman: "8 tahun",
    publikasi: "15 jurnal"
  }

  const handleSave = () => {
    // Simulate API call
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form
    setProfileData({
      nama: currentUser.nama,
      email: currentUser.email,
      nip: "198501122015041002",
      jabatan: "Lektor",
      fakultas: "Fakultas Teknik",
      prodi: "Teknik Informatika",
      pendidikan: "S2 - Magister Teknik Informatika",
      keahlian: "Machine Learning, Data Mining, Web Development",
      telepon: "+62 812-3456-7890",
      alamat: "Jl. Raya Universitas No. 123, Bandung",
      bio: "Dosen dengan pengalaman 8 tahun di bidang teknologi informasi, fokus pada penelitian machine learning dan pengembangan kurikulum berbasis kompetensi."
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
            <p className="text-gray-600 mt-1">Kelola informasi profil dan preferensi akun Anda</p>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Batal Edit
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profil
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="stats">Statistik</TabsTrigger>
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                          {getInitials(profileData.nama)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{profileData.nama}</h2>
                        <p className="text-gray-600">{profileData.jabatan}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <School className="h-4 w-4" />
                            {profileData.prodi}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            NIP: {profileData.nip}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <Star className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {profileData.bio}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{dosenStats.totalRPS}</p>
                        <p className="text-sm text-blue-700">RPS Dibuat</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{dosenStats.totalAssignments}</p>
                        <p className="text-sm text-green-700">Penugasan CPL</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{dosenStats.pengalaman}</p>
                        <p className="text-sm text-purple-700">Pengalaman</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{dosenStats.publikasi}</p>
                        <p className="text-sm text-orange-700">Publikasi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                  <CardDescription>Data personal dan kontak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input 
                      id="nama"
                      value={profileData.nama}
                      onChange={(e) => setProfileData({...profileData, nama: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telepon">Telepon</Label>
                    <Input 
                      id="telepon"
                      value={profileData.telepon}
                      onChange={(e) => setProfileData({...profileData, telepon: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea 
                      id="alamat"
                      value={profileData.alamat}
                      onChange={(e) => setProfileData({...profileData, alamat: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Akademik</CardTitle>
                  <CardDescription>Data kepegawaian dan akademik</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP</Label>
                    <Input 
                      id="nip"
                      value={profileData.nip}
                      onChange={(e) => setProfileData({...profileData, nip: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    {isEditing ? (
                      <Select value={profileData.jabatan} onValueChange={(value) => setProfileData({...profileData, jabatan: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asisten Ahli">Asisten Ahli</SelectItem>
                          <SelectItem value="Lektor">Lektor</SelectItem>
                          <SelectItem value="Lektor Kepala">Lektor Kepala</SelectItem>
                          <SelectItem value="Guru Besar">Guru Besar</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={profileData.jabatan} disabled />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fakultas">Fakultas</Label>
                    <Input 
                      id="fakultas"
                      value={profileData.fakultas}
                      onChange={(e) => setProfileData({...profileData, fakultas: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prodi">Program Studi</Label>
                    <Input 
                      id="prodi"
                      value={profileData.prodi}
                      onChange={(e) => setProfileData({...profileData, prodi: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                <CardDescription>Pendidikan dan keahlian</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                  <Input 
                    id="pendidikan"
                    value={profileData.pendidikan}
                    onChange={(e) => setProfileData({...profileData, pendidikan: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keahlian">Bidang Keahlian</Label>
                  <Textarea 
                    id="keahlian"
                    value={profileData.keahlian}
                    onChange={(e) => setProfileData({...profileData, keahlian: e.target.value})}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/Deskripsi</Label>
                  <Textarea 
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Statistik RPS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total RPS Dibuat</span>
                      <span className="text-2xl font-bold text-blue-600">{dosenStats.totalRPS}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">RPS Disetujui</span>
                      <span className="text-2xl font-bold text-green-600">
                        {mockRPS.filter(rps => rps.dosenId === "2" && rps.status === "approved").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">RPS Pending</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {mockRPS.filter(rps => rps.dosenId === "2" && rps.status === "submitted").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Statistik Penugasan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Penugasan</span>
                      <span className="text-2xl font-bold text-purple-600">{dosenStats.totalAssignments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Penugasan Diterima</span>
                      <span className="text-2xl font-bold text-green-600">
                        {mockAssignments.filter(a => a.dosenId === "2" && a.status === "accepted").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Penugasan Selesai</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {mockAssignments.filter(a => a.dosenId === "2" && a.status === "done").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
                <CardDescription>Riwayat aktivitas dalam sistem kurikulum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Membuat RPS baru", item: "Struktur Data", date: "2024-01-20", type: "create" },
                    { action: "Menerima penugasan CPL", item: "CPL-02: Kemampuan Analisis", date: "2024-01-18", type: "accept" },
                    { action: "Memperbarui RPS", item: "Algoritma dan Pemrograman", date: "2024-01-15", type: "update" },
                    { action: "Menyelesaikan RPS", item: "Database Management", date: "2024-01-10", type: "complete" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "create" ? "bg-blue-100" :
                        activity.type === "accept" ? "bg-green-100" :
                        activity.type === "update" ? "bg-yellow-100" :
                        "bg-purple-100"
                      }`}>
                        {activity.type === "create" && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === "accept" && <User className="h-4 w-4 text-green-600" />}
                        {activity.type === "update" && <Edit3 className="h-4 w-4 text-yellow-600" />}
                        {activity.type === "complete" && <Award className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.item}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}