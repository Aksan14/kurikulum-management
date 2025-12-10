"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  Archive,
  CheckCircle,
  Clock,
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/api/auth"
import { cplService, CPL as ApiCPL, CPLStatistics } from "@/lib/api/cpl"

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: Clock },
  published: { label: 'Published', variant: 'success' as const, icon: CheckCircle },
  archived: { label: 'Archived', variant: 'outline' as const, icon: Archive },
}

// Local CPL type for display (maps from API CPL)
interface DisplayCPL {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  updatedAt: string;
}

export default function CPLListPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedCPL, setSelectedCPL] = useState<DisplayCPL | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // API State
  const [cplList, setCplList] = useState<DisplayCPL[]>([])
  const [statistics, setStatistics] = useState<CPLStatistics>({
    total_cpl: 0,
    published: 0,
    draft: 0,
    archived: 0
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // User for layout (fallback for display)
  const user = authUser ? {
    id: authUser.id,
    nama: authUser.nama,
    email: authUser.email,
    role: authUser.role as "kaprodi" | "dosen" | "admin",
    avatar: "/avatars/default.png",
  } : {
    id: '',
    nama: 'Guest',
    email: '',
    role: 'dosen' as const,
    avatar: '/avatars/default.png'
  }

  // Fetch CPL data
  const fetchCPLData = useCallback(async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      // Build params for API call
      const params: Record<string, string | number> = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (searchQuery) params.search = searchQuery
      params.limit = 100 // Get all for now

      const [cplResponse, statsResponse] = await Promise.all([
        cplService.getAll(params),
        cplService.getStatistics()
      ])

      if (cplResponse.success && cplResponse.data) {
        // Handle case where data might be null, undefined, or not an array
        const cplData = cplResponse.data.data || []
        const mappedCPLs: DisplayCPL[] = Array.isArray(cplData) ? cplData.map(cpl => ({
          id: cpl.id,
          kode: cpl.kode,
          nama: cpl.nama,
          deskripsi: cpl.deskripsi,
          status: cpl.status,
          version: cpl.version,
          updatedAt: cpl.updated_at
        })) : []
        setCplList(mappedCPLs)
      } else {
        setCplList([])
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data)
      } else {
        setStatistics({
          total_cpl: 0,
          published: 0,
          draft: 0,
          archived: 0
        })
      }
    } catch (err) {
      console.error('Error fetching CPL data:', err)
      setError('Gagal memuat data CPL. Pastikan server API berjalan.')
      setCplList([])
      setStatistics({
        total_cpl: 0,
        published: 0,
        draft: 0,
        archived: 0
      })
    } finally {
      setLoading(false)
    }
  }, [filterStatus, searchQuery, router])

  // Initial fetch and on filter change
  useEffect(() => {
    fetchCPLData()
  }, [fetchCPLData])

  // Handle status change (publish/archive)
  const handleStatusChange = async (cplId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const response = await cplService.updateStatus(cplId, newStatus)
      if (response.success) {
        // Refresh data
        fetchCPLData()
      } else {
        setError(response.message || 'Gagal mengubah status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Gagal mengubah status')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCPL) return
    
    setDeleting(true)
    try {
      const response = await cplService.delete(selectedCPL.id)
      if (response.success) {
        setShowDeleteDialog(false)
        setSelectedCPL(null)
        fetchCPLData()
      } else {
        setError(response.message || 'Gagal menghapus CPL')
      }
    } catch (err) {
      console.error('Error deleting CPL:', err)
      setError('Gagal menghapus CPL')
    } finally {
      setDeleting(false)
    }
  }

  // Filter CPL list (client-side filtering for search)
  const filteredCPLs = cplList.filter(cpl => {
    const matchesSearch = searchQuery === '' || 
      cpl.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cpl.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cpl.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Kelola CPL</h1>
            <p className="mt-1 text-slate-500">
              Capaian Pembelajaran Lulusan Program Studi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/kaprodi/cpl/matrix">
                <GraduationCap className="h-4 w-4 mr-2" />
                Lihat Matrix
              </Link>
            </Button>
            <Button asChild>
              <Link href="/kaprodi/cpl/create">
                <Plus className="h-4 w-4" />
                Buat CPL Baru
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{statistics.total_cpl}</p>
                  <p className="text-sm text-blue-700">Total CPL</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">{statistics.published}</p>
                  <p className="text-sm text-emerald-700">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-900">{statistics.draft}</p>
                  <p className="text-sm text-amber-700">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Archive className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{statistics.archived}</p>
                  <p className="text-sm text-purple-700">Archived</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari kode, nama, atau deskripsi CPL..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CPL List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="mt-4 text-sm text-slate-500">Memuat data CPL...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-red-300" />
                  <h3 className="mt-4 text-lg font-medium text-red-900">{error}</h3>
                  <Button className="mt-4" onClick={fetchCPLData}>
                    Coba Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredCPLs.map((cpl) => {
            const status = statusConfig[cpl.status]
            const StatusIcon = status.icon
            
            return (
              <Card key={cpl.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                        "bg-blue-100 text-blue-700"
                      )}>
                        {cpl.kode.split('-')[1] || cpl.kode.substring(0, 3)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-slate-600">{cpl.kode}</span>
                          <Badge variant={status.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{cpl.nama}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{cpl.deskripsi}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>Versi: {cpl.version}</span>
                          <span>•</span>
                          <span>Diperbarui: {formatDate(cpl.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/kaprodi/cpl/${cpl.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/kaprodi/cpl/edit/${cpl.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {cpl.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(cpl.id, 'published')}>
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {cpl.status === 'published' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(cpl.id, 'archived')}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          onClick={() => {
                            setSelectedCPL(cpl)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {!loading && !error && filteredCPLs.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Tidak ada CPL ditemukan</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {searchQuery || filterStatus !== 'all'
                      ? "Coba ubah filter pencarian Anda"
                      : "Mulai dengan membuat CPL baru"}
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Button className="mt-4" asChild>
                      <Link href="/kaprodi/cpl/create">
                        <Plus className="h-4 w-4" />
                        Buat CPL Baru
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus CPL</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus CPL <strong>{selectedCPL?.kode}</strong>? 
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
