"use client"

import { useState } from "react"
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
  GraduationCap
} from "lucide-react"
import { mockUsers, mockCPLs } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"
import Link from "next/link"
import { CPL } from "@/types"

const aspekLabels = {
  sikap: 'Sikap',
  pengetahuan: 'Pengetahuan',
  keterampilan_umum: 'Keterampilan Umum',
  keterampilan_khusus: 'Keterampilan Khusus'
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: Clock },
  published: { label: 'Published', variant: 'success' as const, icon: CheckCircle },
  archived: { label: 'Archived', variant: 'outline' as const, icon: Archive },
}

export default function CPLListPage() {
  const user = mockUsers[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAspek, setFilterAspek] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedCPL, setSelectedCPL] = useState<CPL | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const filteredCPLs = mockCPLs.filter(cpl => {
    const matchesSearch = cpl.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cpl.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cpl.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAspek = filterAspek === 'all' || cpl.aspek === filterAspek
    const matchesStatus = filterStatus === 'all' || cpl.status === filterStatus
    return matchesSearch && matchesAspek && matchesStatus
  })

  const draftCPLs = mockCPLs.filter(cpl => cpl.status === 'draft')
  const publishedCPLs = mockCPLs.filter(cpl => cpl.status === 'published')

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
          <Button asChild>
            <Link href="/kaprodi/cpl/create">
              <Plus className="h-4 w-4" />
              Buat CPL Baru
            </Link>
          </Button>
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
                  <p className="text-2xl font-bold text-blue-900">{mockCPLs.length}</p>
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
                  <p className="text-2xl font-bold text-emerald-900">{publishedCPLs.length}</p>
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
                  <p className="text-2xl font-bold text-amber-900">{draftCPLs.length}</p>
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
                  <p className="text-2xl font-bold text-purple-900">0</p>
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
                  placeholder="Cari kode, judul, atau deskripsi CPL..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterAspek} onValueChange={setFilterAspek}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Aspek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Aspek</SelectItem>
                    <SelectItem value="sikap">Sikap</SelectItem>
                    <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                    <SelectItem value="keterampilan_umum">Keterampilan Umum</SelectItem>
                    <SelectItem value="keterampilan_khusus">Keterampilan Khusus</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
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
          {filteredCPLs.map((cpl) => {
            const status = statusConfig[cpl.status]
            const StatusIcon = status.icon
            
            return (
              <Card key={cpl.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                        cpl.aspek === 'sikap' ? "bg-pink-100 text-pink-700" :
                        cpl.aspek === 'pengetahuan' ? "bg-blue-100 text-blue-700" :
                        cpl.aspek === 'keterampilan_umum' ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {cpl.kode.split('-')[1]}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-slate-600">{cpl.kode}</span>
                          <Badge variant={status.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline">{aspekLabels[cpl.aspek]}</Badge>
                          <Badge variant="outline">{cpl.kategori}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{cpl.judul}</h3>
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
                          <Link href={`/kaprodi/cpl/${cpl.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {cpl.status === 'draft' && (
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {cpl.status === 'published' && (
                          <DropdownMenuItem>
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

          {filteredCPLs.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Tidak ada CPL ditemukan</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {searchQuery || filterAspek !== 'all' || filterStatus !== 'all'
                      ? "Coba ubah filter pencarian Anda"
                      : "Mulai dengan membuat CPL baru"}
                  </p>
                  {!searchQuery && filterAspek === 'all' && filterStatus === 'all' && (
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
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
