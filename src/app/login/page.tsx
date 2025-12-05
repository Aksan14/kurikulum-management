"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, User, BookOpen, ArrowRight, Eye, EyeOff, Shield, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"kaprodi" | "dosen" | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/${user.role}/dashboard`)
    }
  }, [isAuthenticated, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show login page if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full border-2 border-white"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-white"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 animate-pulse">
          <Sparkles className="h-8 w-8 text-yellow-300 opacity-60" />
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kurikulum</h1>
              <p className="text-blue-200 text-sm">Management System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Kelola Kurikulum
              <br />
              dengan Mudah
            </h2>
            <p className="text-blue-100 text-lg max-w-md">
              Platform terintegrasi untuk pengelolaan CPL, RPS, dan dokumen kurikulum program studi
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <FeatureItem 
              icon={<BookOpen className="h-5 w-5" />}
              title="Manajemen CPL"
              description="Kelola Capaian Pembelajaran Lulusan dengan mudah"
            />
            <FeatureItem 
              icon={<Shield className="h-5 w-5" />}
              title="Workflow Approval"
              description="Sistem persetujuan RPS yang terstruktur"
            />
            <FeatureItem 
              icon={<Sparkles className="h-5 w-5" />}
              title="Generate Dokumen"
              description="Buat dokumen kurikulum secara otomatis"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-200 text-sm">
            © 2024 Kurikulum Management System
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kurikulum</h1>
              <p className="text-gray-500 text-xs">Management System</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                Selemat Datang
              </CardTitle>
              <CardDescription className="text-center">
                Masuk untuk mengelola kurikulum Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@unismuh.ac.id"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setError(null)
                    }}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        setError(null)
                      }}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Ingat saya</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Lupa password?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={isLoading || !formData.email || !formData.password}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Masuk
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Dengan masuk, Anda menyetujui{" "}
            <a href="#" className="text-blue-600 hover:underline">Syarat Layanan</a>
            {" "}dan{" "}
            <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-blue-200 text-sm">{description}</p>
      </div>
    </div>
  )
}
