"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Target,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { cplService, type CPL } from '@/lib/api/cpl'
import { authService } from '@/lib/api/auth'
import { formatDate } from '@/lib/utils'

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700'
}

export default function DosenCPLDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cplId = params.id as string
  
  const [cpl, setCpl] = useState<CPL | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await cplService.getById(cplId)
      
      if (response.data) {
        setCpl(response.data)
      }
    } catch (err) {
      console.error('Error fetching CPL:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data CPL')
    } finally {
      setLoading(false)
    }
  }, [cplId, router])

  useEffect(() => {
    if (cplId) {
      fetchData()
    }
  }, [cplId, fetchData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Memuat data CPL...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !cpl) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-slate-900">Gagal Memuat Data</p>
          <p className="text-slate-600">{error || 'CPL tidak ditemukan'}</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* CPL Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{cpl.kode}</CardTitle>
                  <CardDescription>{cpl.nama}</CardDescription>
                </div>
              </div>
              <Badge className={statusColors[cpl.status]}>
                {cpl.status === 'published' ? 'Aktif' : 
                 cpl.status === 'draft' ? 'Draft' : 'Diarsipkan'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deskripsi */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Deskripsi</h3>
              <p className="text-slate-900">{cpl.deskripsi}</p>
            </div>

            {/* Meta Info */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Dibuat: {formatDate(cpl.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Diperbarui: {formatDate(cpl.updated_at)}</span>
              </div>
              {cpl.published_at && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-slate-600">Dipublish: {formatDate(cpl.published_at)}</span>
                </div>
              )}
            </div>

            {/* Creator Info */}
            {cpl.creator && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Dibuat oleh: {cpl.creator.nama}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tindakan</CardTitle>
            <CardDescription>
              Aksi terkait CPL ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/dosen/assignment">
                  <FileText className="h-4 w-4 mr-2" />
                  Lihat Penugasan
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dosen/mapping">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lihat Mapping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
