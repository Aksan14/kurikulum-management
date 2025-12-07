"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  User,
  Mail,
  Phone,
  School,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  FileText,
  Star,
  Target,
  Loader2,
  AlertCircle,
  GraduationCap,
  BookOpen
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { authService, rpsService } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import Link from "next/link"

interface UserData {
  id: string
  nama: string
  email: string
  role: string
  phone?: string
  avatar_url?: string
}

export default function DosenProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState({
    totalRPS: 0,
    totalRPSDraft: 0,
    totalRPSApproved: 0,
    totalRPSSubmitted: 0,
    totalMataKuliah: 0,
  })
  
  const [profileData, setProfileData] = useState({
    nama: "",
    phone: ""
  })

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const [userResponse, rpsResponse] = await Promise.all([
        authService.getProfile(),
        rpsService.getMy()
      ])
      
      const userData = userResponse.data
      setCurrentUser(userData as UserData)
      
      // Set profile data (only editable fields)
      setProfileData({
        nama: userData?.nama || "",
        phone: userData?.phone || ""
      })
      
      // Set stats from RPS data
      const rpsList = rpsResponse.data?.data || []
      setStats({
        totalRPS: rpsList.length,
        totalRPSDraft: rpsList.filter((r: { status: string }) => r.status === 'draft').length,
        totalRPSApproved: rpsList.filter((r: { status: string }) => r.status === 'approved').length,
        totalRPSSubmitted: rpsList.filter((r: { status: string }) => r.status === 'submitted').length,
        totalMataKuliah: new Set(rpsList.map((r: { mata_kuliah_id: string }) => r.mata_kuliah_id)).size
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      await authService.updateProfile({
        nama: profileData.nama,
        phone: profileData.phone
      })
      
      setSuccess("Profil berhasil diperbarui")
      setIsEditing(false)
      
      // Refresh data
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form from currentUser
    if (currentUser) {
      setProfileData({
        nama: currentUser.nama || "",
        phone: currentUser.phone || ""
      })
    }
    setIsEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Memuat profil Anda...</p>
              <p className="text-sm text-slate-500 mt-1">Tunggu sebentar</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div>
                  <h3 className="font-semibold text-lg">Terjadi Kesalahan</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchData}>Coba Lagi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil Saya</h1>
            <p className="text-slate-600 dark:text-slate-400">Kelola informasi profil dan akun Anda</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profil
                </Button>
                <Link href="/dosen/settings">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-green-600">
                <Target className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Card */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left - Avatar & Quick Info */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {getInitials(currentUser?.nama || "Dosen")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      disabled
                      title="Fitur upload foto belum tersedia"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">{currentUser?.nama}</h2>
                <p className="text-slate-600 dark:text-slate-400">Dosen</p>
                <Badge className="mt-2" variant="default">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Dosen
                </Badge>
                
                <div className="w-full mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="truncate text-foreground">{currentUser?.email}</span>
                  </div>
                  {currentUser?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-foreground">{currentUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-slate-500" />
                    <span className="text-foreground">Teknik Informatika</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right - Stats & Edit Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPS}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total RPS</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Target className="h-6 w-6 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPSApproved}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Disetujui</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Star className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPSSubmitted}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Menunggu Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <BookOpen className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalMataKuliah}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mata Kuliah</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Data pribadi dan kontak Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-foreground font-medium">Nama Lengkap</Label>
                    {isEditing ? (
                      <Input
                        id="nama"
                        value={profileData.nama}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nama: e.target.value }))}
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-foreground">{currentUser?.nama || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                    <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-foreground">{currentUser?.email || "-"}</p>
                    {isEditing && (
                      <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">Telepon</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Contoh: 08123456789"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-foreground">{currentUser?.phone || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Role</Label>
                    <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md capitalize text-foreground">{currentUser?.role || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
