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

export default function DosenSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Password form
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

  // Password strength checker
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { strength: 1, label: 'Lemah', color: 'bg-red-500' }
    if (strength <= 4) return { strength: 2, label: 'Sedang', color: 'bg-yellow-500' }
    return { strength: 3, label: 'Kuat', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)
  const passwordsMatch = passwordForm.newPassword && passwordForm.confirmPassword && 
    passwordForm.newPassword === passwordForm.confirmPassword

  const handlePasswordChange = async () => {
    setError(null)
    setSuccess(null)
    
    // Validations
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
      
      const response = await authService.changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })
      
      if (!response.success) {
        setError(response.message || 'Gagal mengubah password')
        return
      }
      
      setSuccess("Password berhasil diubah")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (err: unknown) {
      // Handle different error types
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = (err as { message: string }).message
        if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('incorrect')) {
          setError('Password saat ini salah')
        } else if (errorMessage.includes('400')) {
          setError('Password baru tidak valid')
        } else {
          setError(errorMessage)
        }
      } else {
        setError('Gagal mengubah password. Silakan coba lagi.')
      }
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
            <p className="text-slate-600 dark:text-slate-400">Memuat pengaturan...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dosen/profile">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan</h1>
            <p className="text-slate-600 dark:text-slate-400">Kelola keamanan akun Anda</p>
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
                <Check className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Password Card */}
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
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Minimal 6 karakter</p>
                {passwordForm.newPassword && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-500' : 
                      passwordStrength.strength === 2 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>
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
                  className={passwordForm.confirmPassword ? (passwordsMatch ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500') : ''}
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
              {passwordForm.confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3 w-3" />
                      Password cocok
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Password tidak cocok
                    </>
                  )}
                </p>
              )}
            </div>

            <Button 
              onClick={handlePasswordChange} 
              disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordsMatch} 
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Ubah Password
            </Button>
          </CardContent>
        </Card>

        {/* Security Tips */}
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
