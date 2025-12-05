"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus,
  Search, 
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileText,
  Trash2,
  Copy,
  MessageSquare,
  Loader2,
  AlertCircle
} from "lucide-react"
import { rpsService, RPS, authService } from "@/lib/api"
import { cn, formatDateTime } from "@/lib/utils"
import Link from "next/link"

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: Clock, color: 'text-slate-600 bg-slate-100' },
  submitted: { label: 'Menunggu Review', variant: 'warning' as const, icon: Send, color: 'text-amber-600 bg-amber-100' },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
  rejected: { label: 'Ditolak', variant: 'danger' as const, icon: XCircle, color: 'text-red-600 bg-red-100' },
  published: { label: 'Published', variant: 'info' as const, icon: FileText, color: 'text-blue-600 bg-blue-100' },
}

export default function DosenRPSPage() {
  const router = useRouter()
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const fetchRPS = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const response = await rpsService.getMy()
      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.data || []
        setRpsList(data)
      }
    } catch (err) {
      console.error("Error fetching RPS:", err)
      setError("Gagal memuat data RPS")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchRPS()
  }, [fetchRPS])
  
  const getFilteredRPS = () => {
    let filtered = rpsList

    if (activeTab !== 'all') {
      filtered = filtered.filter(rps => rps.status === activeTab)
    }

    if (searchQuery) {
      filtered = filtered.filter(rps => 
        rps.mata_kuliah_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rps.kode_mk.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredRPS = getFilteredRPS()

  const stats = {
    all: rpsList.length,
    draft: rpsList.filter(r => r.status === 'draft').length,
    submitted: rpsList.filter(r => r.status === 'submitted').length,
    approved: rpsList.filter(r => r.status === 'approved').length,
    rejected: rpsList.filter(r => r.status === 'rejected').length,
  }

  const handleSubmitRPS = async (rpsId: string) => {
    try {
      await rpsService.submit(rpsId)
      await fetchRPS()
    } catch (err) {
      console.error("Error submitting RPS:", err)
      alert("Gagal mengajukan RPS")
    }
  }

  const handleDeleteRPS = async (rpsId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus RPS ini?")) return
    try {
      await rpsService.delete(rpsId)
      await fetchRPS()
    } catch (err) {
      console.error("Error deleting RPS:", err)
      alert("Gagal menghapus RPS")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg text-gray-600">{error}</p>
          <Button onClick={fetchRPS}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">RPS Saya</h1>
            <p className="mt-1 text-slate-500">
              Kelola Rencana Pembelajaran Semester Anda
            </p>
          </div>
          <Button asChild>
            <Link href="/dosen/rps/create">
              <Plus className="h-4 w-4" />
              Buat RPS Baru
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className={cn(activeTab === 'all' && "ring-2 ring-blue-500")}>
            <CardContent className="pt-6 cursor-pointer" onClick={() => setActiveTab('all')}>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.all}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("border-slate-200", activeTab === 'draft' && "ring-2 ring-slate-500")}>
            <CardContent className="pt-6 cursor-pointer" onClick={() => setActiveTab('draft')}>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.draft}</p>
                <p className="text-sm text-slate-500">Draft</p>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("border-amber-200 bg-amber-50", activeTab === 'submitted' && "ring-2 ring-amber-500")}>
            <CardContent className="pt-6 cursor-pointer" onClick={() => setActiveTab('submitted')}>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-900">{stats.submitted}</p>
                <p className="text-sm text-amber-700">Menunggu</p>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("border-emerald-200 bg-emerald-50", activeTab === 'approved' && "ring-2 ring-emerald-500")}>
            <CardContent className="pt-6 cursor-pointer" onClick={() => setActiveTab('approved')}>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-900">{stats.approved}</p>
                <p className="text-sm text-emerald-700">Disetujui</p>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("border-red-200 bg-red-50", activeTab === 'rejected' && "ring-2 ring-red-500")}>
            <CardContent className="pt-6 cursor-pointer" onClick={() => setActiveTab('rejected')}>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                <p className="text-sm text-red-700">Ditolak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari mata kuliah atau kode..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* RPS List */}
        <div className="space-y-4">
          {filteredRPS.map((rps) => {
            const status = statusConfig[rps.status]
            const StatusIcon = status.icon
            
            return (
              <Card key={rps.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
                        status.color
                      )}>
                        <StatusIcon className="h-7 w-7" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{rps.mata_kuliah_nama}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="font-mono">{rps.kode_mk}</span>
                          <span>•</span>
                          <span>{rps.sks} SKS</span>
                          <span>•</span>
                          <span>Semester {rps.semester}</span>
                          <span>•</span>
                          <span>{rps.tahun_akademik}</span>
                        </div>
                        {rps.status === 'rejected' && rps.review_notes && (
                          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="mt-0.5 h-4 w-4 text-red-500" />
                              <div>
                                <p className="text-xs font-medium text-red-700">Catatan Kaprodi:</p>
                                <p className="text-sm text-red-600">{rps.review_notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-400">
                          Diperbarui: {formatDateTime(rps.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rps.status === 'draft' && (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dosen/rps/edit/${rps.id}`}>
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button size="sm" onClick={() => handleSubmitRPS(rps.id)}>
                            <Send className="h-4 w-4" />
                            Submit
                          </Button>
                        </>
                      )}
                      {rps.status === 'rejected' && (
                        <Button size="sm" asChild>
                          <Link href={`/dosen/rps/edit/${rps.id}`}>
                            <Edit className="h-4 w-4" />
                            Revisi
                          </Link>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dosen/rps/${rps.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          {(rps.status === 'draft' || rps.status === 'rejected') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dosen/rps/edit/${rps.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit RPS
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplikat
                          </DropdownMenuItem>
                          {rps.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                onClick={() => handleDeleteRPS(rps.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredRPS.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Tidak ada RPS ditemukan</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {activeTab !== 'all' 
                      ? `Tidak ada RPS dengan status ${statusConfig[activeTab as keyof typeof statusConfig]?.label || activeTab}`
                      : 'Mulai dengan membuat RPS baru'}
                  </p>
                  {activeTab === 'all' && rpsList.length === 0 && (
                    <Button className="mt-4" asChild>
                      <Link href="/dosen/rps/create">
                        <Plus className="h-4 w-4" />
                        Buat RPS Baru
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
