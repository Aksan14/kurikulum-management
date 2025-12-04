"use client"

import React, { useState } from "react"
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  School,
  Award,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  Users,
  FileText,
  Star,
  Shield,
  BookOpen,
  Target
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
import { mockUsers, mockCPLs, mockRPS, mockAssignments } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function KaprodiProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  
  // Simulate current user (kaprodi)
  const currentUser = mockUsers.find(u => u.role === "kaprodi")!
  const [profileData, setProfileData] = useState({
    nama: currentUser.nama,
    email: currentUser.email,
    nip: "197803152008011001",
    jabatan: "Profesor / Ketua Program Studi",
    fakultas: "Fakultas Teknik",
    prodi: "Teknik Informatika",
    pendidikan: "S3 - Doktor Ilmu Komputer",
    keahlian: "Software Engineering, Computer Science Education, Curriculum Development",
    telepon: "+62 811-2345-6789",
    alamat: "Jl. Profesor Sudarto No. 456, Bandung",
    bio: "Ketua Program Studi dengan pengalaman 15 tahun dalam pengembangan kurikulum berbasis kompetensi dan manajemen akademik.",
    visiMisi: "Memimpin program studi untuk menghasilkan lulusan yang kompeten, berkarakter, dan siap berkontribusi dalam era digital."
  })

  const kaprodiStats = {
    totalCPL: mockCPLs.length,
    totalRPS: mockRPS.length,
    totalDosen: mockUsers.filter(u => u.role === "dosen").length,
    totalAssignment: mockAssignments.length,
    pengalaman: "15 tahun",
    publikasi: "45 jurnal"
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
      nip: "197803152008011001",
      jabatan: "Profesor / Ketua Program Studi",
      fakultas: "Fakultas Teknik",
      prodi: "Teknik Informatika",
      pendidikan: "S3 - Doktor Ilmu Komputer",
      keahlian: "Software Engineering, Computer Science Education, Curriculum Development",
      telepon: "+62 811-2345-6789",
      alamat: "Jl. Profesor Sudarto No. 456, Bandung",
      bio: "Ketua Program Studi dengan pengalaman 15 tahun dalam pengembangan kurikulum berbasis kompetensi dan manajemen akademik.",
      visiMisi: "Memimpin program studi untuk menghasilkan lulusan yang kompeten, berkarakter, dan siap berkontribusi dalam era digital."
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Kaprodi</h1>
            <p className="text-gray-600 mt-1">Kelola informasi profil dan preferensi akun Ketua Program Studi</p>
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
            <TabsTrigger value="management">Manajemen Prodi</TabsTrigger>
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
                        <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
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
                      <Badge className="bg-purple-100 text-purple-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Kaprodi
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {profileData.bio}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{kaprodiStats.totalCPL}</p>
                        <p className="text-sm text-purple-700">Total CPL</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{kaprodiStats.totalRPS}</p>
                        <p className="text-sm text-blue-700">Total RPS</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{kaprodiStats.totalDosen}</p>
                        <p className="text-sm text-green-700">Dosen</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{kaprodiStats.totalAssignment}</p>
                        <p className="text-sm text-orange-700">Assignment</p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">{kaprodiStats.pengalaman}</p>
                        <p className="text-sm text-indigo-700">Pengalaman</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{kaprodiStats.publikasi}</p>
                        <p className="text-sm text-red-700">Publikasi</p>
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
                  <CardDescription>Data kepegawaian dan jabatan</CardDescription>
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
                          <SelectItem value="Profesor / Ketua Program Studi">Profesor / Ketua Program Studi</SelectItem>
                          <SelectItem value="Lektor Kepala / Ketua Program Studi">Lektor Kepala / Ketua Program Studi</SelectItem>
                          <SelectItem value="Lektor / Ketua Program Studi">Lektor / Ketua Program Studi</SelectItem>
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
                <CardDescription>Pendidikan, keahlian, dan visi misi</CardDescription>
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
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visiMisi">Visi & Misi Kepemimpinan</Label>
                  <Textarea 
                    id="visiMisi"
                    value={profileData.visiMisi}
                    onChange={(e) => setProfileData({...profileData, visiMisi: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
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

          <TabsContent value="management" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tim Dosen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUsers.filter(u => u.role === "dosen").slice(0, 5).map((dosen) => (
                      <div key={dosen.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(dosen.nama)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{dosen.nama}</p>
                          <p className="text-sm text-gray-600">{dosen.email}</p>
                        </div>
                        <Badge variant="outline">
                          {mockAssignments.filter(a => a.dosenId === dosen.id).length} CPL
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    CPL Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">CPL Published</p>
                        <p className="text-sm text-green-600">Siap digunakan</p>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {mockCPLs.filter(cpl => cpl.status === "published").length}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">CPL Draft</p>
                        <p className="text-sm text-yellow-600">Dalam pengembangan</p>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {mockCPLs.filter(cpl => cpl.status === "draft").length}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">RPS Approved</p>
                        <p className="text-sm text-blue-600">Telah disetujui</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {mockRPS.filter(rps => rps.status === "approved").length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Statistik Kurikulum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total CPL Dibuat</span>
                      <span className="text-2xl font-bold text-purple-600">{kaprodiStats.totalCPL}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">RPS Dikelola</span>
                      <span className="text-2xl font-bold text-blue-600">{kaprodiStats.totalRPS}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Assignment Dibuat</span>
                      <span className="text-2xl font-bold text-green-600">{kaprodiStats.totalAssignment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coverage Rate</span>
                      <span className="text-2xl font-bold text-orange-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Pencapaian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pengalaman Kepemimpinan</span>
                      <span className="text-2xl font-bold text-indigo-600">{kaprodiStats.pengalaman}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Publikasi Ilmiah</span>
                      <span className="text-2xl font-bold text-red-600">{kaprodiStats.publikasi}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tim Dosen</span>
                      <span className="text-2xl font-bold text-green-600">{kaprodiStats.totalDosen}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Akreditasi Prodi</span>
                      <Badge className="bg-green-100 text-green-700">A</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Kepemimpinan Terkini</CardTitle>
                <CardDescription>Riwayat kegiatan manajemen program studi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Menyetujui RPS baru", item: "Struktur Data - Dr. Budi Santoso", date: "2024-01-20", type: "approve" },
                    { action: "Membuat CPL baru", item: "CPL-07: Kemampuan Komunikasi", date: "2024-01-19", type: "create" },
                    { action: "Menugaskan CPL ke dosen", item: "CPL-03 kepada Dr. Sari Wahyuni", date: "2024-01-18", type: "assign" },
                    { action: "Review mapping kurikulum", item: "Pemetaan CPL-RPS Semester Genap", date: "2024-01-15", type: "review" },
                    { action: "Rapat koordinasi", item: "Evaluasi kurikulum dengan tim dosen", date: "2024-01-12", type: "meeting" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "approve" ? "bg-green-100" :
                        activity.type === "create" ? "bg-blue-100" :
                        activity.type === "assign" ? "bg-purple-100" :
                        activity.type === "review" ? "bg-yellow-100" :
                        "bg-orange-100"
                      }`}>
                        {activity.type === "approve" && <Award className="h-5 w-5 text-green-600" />}
                        {activity.type === "create" && <FileText className="h-5 w-5 text-blue-600" />}
                        {activity.type === "assign" && <Users className="h-5 w-5 text-purple-600" />}
                        {activity.type === "review" && <Target className="h-5 w-5 text-yellow-600" />}
                        {activity.type === "meeting" && <School className="h-5 w-5 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.item}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                      </div>
                      <Badge className={
                        activity.type === "approve" ? "bg-green-100 text-green-700" :
                        activity.type === "create" ? "bg-blue-100 text-blue-700" :
                        activity.type === "assign" ? "bg-purple-100 text-purple-700" :
                        activity.type === "review" ? "bg-yellow-100 text-yellow-700" :
                        "bg-orange-100 text-orange-700"
                      }>
                        {activity.type === "approve" ? "Approval" :
                         activity.type === "create" ? "Create" :
                         activity.type === "assign" ? "Assignment" :
                         activity.type === "review" ? "Review" :
                         "Meeting"}
                      </Badge>
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