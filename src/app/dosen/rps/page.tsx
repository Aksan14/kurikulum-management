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
import { rpsService, RPS, authService, mataKuliahService, MataKuliah, notificationService, usersService } from "@/lib/api"
import { cn, formatDateTime } from "@/lib/utils"
import Link from "next/link"

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: Clock, color: 'text-slate-600 bg-slate-100' },
  submitted: { label: 'Menunggu Review', variant: 'warning' as const, icon: Send, color: 'text-amber-600 bg-amber-100' },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
  rejected: { label: 'Ditolak', variant: 'danger' as const, icon: XCircle, color: 'text-red-600 bg-red-100' },
  published: { label: 'Published', variant: 'info' as const, icon: FileText, color: 'text-blue-600 bg-blue-100' },
  revision: { label: 'Perlu Revisi', variant: 'warning' as const, icon: AlertCircle, color: 'text-orange-600 bg-orange-100' },
}

export default function DosenRPSPage() {
  const router = useRouter()
  const [rpsList, setRpsList] = useState<RPS[]>([])
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([])
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
      
      // Fetch RPS and Mata Kuliah in parallel
      const [rpsResponse, mkResponse] = await Promise.all([
        rpsService.getMy(),
        mataKuliahService.getMy()
      ])
      
      // Process RPS data
      let rpsData: RPS[] = []
      if (rpsResponse.data) {
        rpsData = Array.isArray(rpsResponse.data) ? rpsResponse.data : rpsResponse.data.data || []
      }
      
      // Process Mata Kuliah data
      let mkData: MataKuliah[] = []
      if (mkResponse.data) {
        if (Array.isArray(mkResponse.data)) {
          mkData = mkResponse.data
        } else if (mkResponse.data.data && Array.isArray(mkResponse.data.data)) {
          mkData = mkResponse.data.data
        }
      }
      
      setRpsList(rpsData)
      setMataKuliahList(mkData)
      
      console.log('📊 Loaded RPS:', rpsData.length, rpsData)
      console.log('📊 Loaded Mata Kuliah:', mkData.length, mkData)
    } catch (err) {
      console.error("Error fetching RPS:", err)
      setError("Gagal memuat data RPS")
    } finally {
      setLoading(false)
    }
  }, [router])

  // Helper function to get mata kuliah info by ID
  const getMataKuliahInfo = (mataKuliahId: string) => {
    const mk = mataKuliahList.find(m => m.id === mataKuliahId)
    return mk || null
  }

  useEffect(() => {
    fetchRPS()
  }, [fetchRPS])
  
  const getFilteredRPS = () => {
    let filtered = rpsList

    if (activeTab !== 'all') {
      filtered = filtered.filter(rps => rps.status === activeTab)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(rps => {
        const mkInfo = getMataKuliahInfo(rps.mata_kuliah_id)
        const namaMatKul = rps.mata_kuliah_nama || mkInfo?.nama || ''
        const kodeMK = rps.kode_mk || mkInfo?.kode || ''
        return namaMatKul.toLowerCase().includes(query) || kodeMK.toLowerCase().includes(query)
      })
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
      // Get current user
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        alert("Sesi login telah berakhir. Silakan login kembali.")
        router.push('/login')
        return
      }

      // Find the RPS to check ownership
      const rps = rpsList.find(r => r.id === rpsId)
      if (!rps) {
        alert("RPS tidak ditemukan")
        return
      }

      if (rps.dosen_id !== currentUser.id) {
        alert("Anda tidak memiliki akses untuk mengajukan RPS ini")
        return
      }

      await rpsService.submit(rpsId)
      
      // Get the RPS data to include in notification
      const rpsResponse = await rpsService.getById(rpsId)
      if (rpsResponse.success && rpsResponse.data) {
        const rps = rpsResponse.data
        
        // Get all kaprodi users to notify them
        try {
          const kaprodiResponse = await usersService.getAll({ role: 'kaprodi', status: 'active' })
          if (kaprodiResponse.success && kaprodiResponse.data?.data) {
            // Create notifications for all kaprodi users
            const notificationPromises = kaprodiResponse.data.data.map(kaprodi => 
              notificationService.create({
                user_id: kaprodi.id,
                title: 'RPS Baru Menunggu Review',
                message: `RPS untuk mata kuliah ${rps.mata_kuliah_nama} telah diajukan oleh ${rps.dosen_nama} dan menunggu review Anda.`,
                type: 'document',
                related_id: rps.id,
                related_type: 'rps'
              }).catch(err => console.error(`Error creating notification for kaprodi ${kaprodi.id}:`, err))
            )
            await Promise.all(notificationPromises)
          }
        } catch (notifErr) {
          console.error('Error creating notifications for kaprodi:', notifErr)
        }
      }
      
      await fetchRPS()
    } catch (err) {
      console.error("Error submitting RPS:", err)
      if (err instanceof Error && err.message.includes('akses')) {
        alert("Anda tidak memiliki akses untuk mengajukan RPS ini")
      } else {
        alert("Gagal mengajukan RPS. Silakan coba lagi.")
      }
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
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Memuat data RPS Anda...</p>
              <p className="text-sm text-slate-500 mt-1">Tunggu sebentar</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900">Oops! Gagal Memuat Data</p>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
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
            
            // Get mata kuliah info from separate list if not in RPS response
            const mkInfo = getMataKuliahInfo(rps.mata_kuliah_id)
            
            // Identitas RPS - prioritize RPS data, fallback to mata kuliah data
            const namaMatKul = rps.mata_kuliah_nama || mkInfo?.nama || 'Mata Kuliah Belum Dipilih'
            const kodeMK = rps.kode_mk || mkInfo?.kode || '-'
            const sks = rps.sks || mkInfo?.sks || '-'
            const semester = rps.semester || mkInfo?.semester || '-'
            const tahunAkademik = rps.tahun_akademik || rps.tahun_ajaran || '-'
            const semesterType = rps.semester_type ? `(${rps.semester_type === 'ganjil' ? 'Ganjil' : 'Genap'})` : ''
            
            return (
              <Card key={rps.id} className="transition-all hover:shadow-md hover:shadow-blue-100 duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className={cn(
                        "flex h-12 md:h-14 w-12 md:w-14 flex-shrink-0 items-center justify-center rounded-lg md:rounded-xl",
                        status.color
                      )}>
                        <StatusIcon className="h-6 md:h-7 w-6 md:w-7" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {namaMatKul}
                          </h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{kodeMK}</span>
                          <span>•</span>
                          <span>{sks} SKS</span>
                          <span>•</span>
                          <span>Semester {semester}</span>
                          {tahunAkademik !== '-' && (
                            <>
                              <span>•</span>
                              <span>{tahunAkademik} {semesterType}</span>
                            </>
                          )}
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
                    <div className="flex items-center justify-end gap-1 md:gap-2 flex-wrap md:flex-nowrap">
                      {rps.status === 'draft' && (
                        <>
                          <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
                            <Link href={`/dosen/rps/edit/${rps.id}`}>
                              <Edit className="h-3 md:h-4 w-3 md:w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>
                          <Button size="sm" onClick={() => handleSubmitRPS(rps.id)} className="text-xs md:text-sm">
                            <Send className="h-3 md:h-4 w-3 md:w-4" />
                            <span className="hidden sm:inline">Submit</span>
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
                      {rps.status === 'revision' && (
                        <Button size="sm" onClick={() => handleSubmitRPS(rps.id)}>
                          <Send className="h-4 w-4" />
                          Kirim Kembali
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
                  <FileText className="mx-auto h-12 w-12 text-slate-600" />
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
