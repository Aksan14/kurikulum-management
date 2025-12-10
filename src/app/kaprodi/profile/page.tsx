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
  Target,
  Loader2,
  AlertCircle,
  Shield,
  Users,
  BookOpen
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { authService, rpsService, cplService } from "@/lib/api"
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

export default function KaprodiProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState({
    totalCPL: 0,
    totalRPS: 0,
    totalRPSApproved: 0,
    totalRPSPending: 0,
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
      
      const [userResponse, rpsResponse, cplResponse] = await Promise.all([
        authService.getProfile(),
        rpsService.getAll({ limit: 1000 }),
        cplService.getAll({ limit: 100 })
      ])
      
      const userData = userResponse.data
      setCurrentUser(userData as UserData)
      
      setProfileData({
        nama: userData?.nama || "",
        phone: userData?.phone || ""
      })
      
      const rpsList = rpsResponse.data?.data || []
      setStats({
        totalCPL: cplResponse.data?.total_items || cplResponse.data?.data?.length || 0,
        totalRPS: rpsList.length,
        totalRPSApproved: rpsList.filter((r: { status: string }) => r.status === 'approved').length,
        totalRPSPending: rpsList.filter((r: { status: string }) => r.status === 'submitted').length
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
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat profil...</p>
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
                <AlertCircle className="h-12 w-12 text-destructive" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil Kaprodi</h1>
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
                <Link href="/kaprodi/settings">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Shield className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="text-2xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {getInitials(currentUser?.nama || "Kaprodi")}
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
                <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{currentUser?.nama}</h2>
                <p className="text-slate-600 dark:text-slate-300">Ketua Program Studi</p>
                <Badge className="mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <Shield className="mr-1 h-3 w-3" />
                  Kaprodi
                </Badge>
                
                <div className="w-full mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="truncate text-slate-700 dark:text-slate-200">{currentUser?.email}</span>
                  </div>
                  {currentUser?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700 dark:text-slate-200">{currentUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-purple-500" />
                    <span className="text-slate-700 dark:text-slate-200">Teknik Informatika</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Target className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalCPL}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total CPL</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <FileText className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPS}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total RPS</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <BookOpen className="h-6 w-6 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPSApproved}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">RPS Disetujui</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Users className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalRPSPending}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Menunggu Review</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Data pribadi dan kontak Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-slate-700 dark:text-slate-200 font-medium">Nama Lengkap</Label>
                    {isEditing ? (
                      <Input
                        id="nama"
                        value={profileData.nama}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nama: e.target.value }))}
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">{currentUser?.nama || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-medium">Email</Label>
                    <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">{currentUser?.email || "-"}</p>
                    {isEditing && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email tidak dapat diubah</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200 font-medium">Telepon</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Contoh: 08123456789"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">{currentUser?.phone || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-medium">Role</Label>
                    <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md capitalize text-slate-900 dark:text-white">{currentUser?.role || "-"}</p>
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
