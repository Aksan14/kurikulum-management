"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Shield,
  Eye,
  EyeOff,
  Lock,
  Key,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeft
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/api"
import Link from "next/link"

export default function KaprodiSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const checkAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handlePasswordChange = async () => {
    setError(null)
    setSuccess(null)
    
    if (!passwordForm.currentPassword) {
      setError("Password saat ini wajib diisi")
      return
    }
    
    if (!passwordForm.newPassword) {
      setError("Password baru wajib diisi")
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok")
      return
    }
    
    try {
      setSaving(true)
      
      await authService.changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })
      
      setSuccess("Password berhasil diubah")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat pengaturan...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/kaprodi/profile">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan</h1>
            <p className="text-slate-600 dark:text-slate-400">Kelola keamanan akun Anda</p>
          </div>
        </div>

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
                <Check className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5" />
              Ubah Password
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Pastikan password Anda kuat dan unik untuk keamanan akun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground font-medium">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Masukkan password saat ini"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground font-medium">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Masukkan password baru"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">Minimal 6 karakter</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Konfirmasi password baru"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={handlePasswordChange} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Ubah Password
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Shield className="h-5 w-5" />
              Tips Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Hindari menggunakan informasi pribadi seperti tanggal lahir atau nama</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Jangan gunakan password yang sama dengan akun lain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Ganti password secara berkala untuk keamanan optimal</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
