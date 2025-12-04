"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileText,
  AlertCircle,
  MessageSquare
} from "lucide-react"
import { mockUsers, mockRPS } from "@/lib/mock-data"
import { cn, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { RPS } from "@/types"

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: Clock, color: 'text-slate-600 bg-slate-100' },
  submitted: { label: 'Menunggu Review', variant: 'warning' as const, icon: Send, color: 'text-amber-600 bg-amber-100' },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
  rejected: { label: 'Ditolak', variant: 'danger' as const, icon: XCircle, color: 'text-red-600 bg-red-100' },
  published: { label: 'Published', variant: 'info' as const, icon: FileText, color: 'text-blue-600 bg-blue-100' },
}

export default function KaprodiRPSPage() {
  const user = mockUsers[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedRPS, setSelectedRPS] = useState<RPS | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')

  const pendingRPS = mockRPS.filter(rps => rps.status === 'submitted')
  
  const getFilteredRPS = () => {
    let filtered = mockRPS

    if (activeTab !== 'all') {
      filtered = filtered.filter(rps => rps.status === activeTab)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(rps => rps.status === filterStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(rps => 
        rps.mataKuliahNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rps.kodeMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rps.dosenNama.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredRPS = getFilteredRPS()

  const handleReview = (rps: RPS, action: 'approve' | 'reject') => {
    setSelectedRPS(rps)
    setReviewAction(action)
    setReviewNotes('')
    setShowReviewDialog(true)
  }

  const stats = {
    all: mockRPS.length,
    submitted: mockRPS.filter(r => r.status === 'submitted').length,
    approved: mockRPS.filter(r => r.status === 'approved').length,
    rejected: mockRPS.filter(r => r.status === 'rejected').length,
  }

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Review RPS</h1>
            <p className="mt-1 text-slate-500">
              Kelola dan review Rencana Pembelajaran Semester
            </p>
          </div>
        </div>

        {/* Alert for Pending Reviews */}
        {pendingRPS.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  {pendingRPS.length} RPS Menunggu Review
                </h3>
                <p className="text-sm text-amber-700">
                  Dosen telah submit RPS dan menunggu persetujuan Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-2">
              <FileText className="h-4 w-4" />
              Semua
              <Badge variant="outline">{stats.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="submitted" className="gap-2">
              <Send className="h-4 w-4" />
              Menunggu
              <Badge variant="warning">{stats.submitted}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Disetujui
              <Badge variant="success">{stats.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Ditolak
              <Badge variant="danger">{stats.rejected}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari mata kuliah, kode, atau nama dosen..."
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
                          <h3 className="text-lg font-semibold text-slate-900">{rps.mataKuliahNama}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="font-mono">{rps.kodeMK}</span>
                          <span>•</span>
                          <span>{rps.sks} SKS</span>
                          <span>•</span>
                          <span>Semester {rps.semester}</span>
                          <span>•</span>
                          <span>{rps.tahunAkademik}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Dosen: <span className="font-medium">{rps.dosenNama}</span>
                        </p>
                        {rps.status === 'rejected' && rps.reviewNotes && (
                          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="mt-0.5 h-4 w-4 text-red-500" />
                              <div>
                                <p className="text-xs font-medium text-red-700">Catatan Review:</p>
                                <p className="text-sm text-red-600">{rps.reviewNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-400">
                          Diperbarui: {formatDateTime(rps.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rps.status === 'submitted' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReview(rps, 'reject')}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                            Tolak
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleReview(rps, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Setujui
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/kaprodi/rps/${rps.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          {rps.status === 'submitted' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleReview(rps, 'approve')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                Setujui RPS
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReview(rps, 'reject')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Tolak RPS
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
                      : 'Coba ubah filter pencarian Anda'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Setujui RPS' : 'Tolak RPS'}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve' 
                  ? `Anda akan menyetujui RPS ${selectedRPS?.mataKuliahNama}. RPS yang disetujui dapat digunakan untuk generate dokumen kurikulum.`
                  : `Anda akan menolak RPS ${selectedRPS?.mataKuliahNama}. Mohon berikan catatan revisi.`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="notes">
                {reviewAction === 'approve' ? 'Catatan (opsional)' : 'Catatan Revisi *'}
              </Label>
              <Textarea
                id="notes"
                placeholder={reviewAction === 'approve' 
                  ? "Tambahkan catatan jika diperlukan..."
                  : "Jelaskan alasan penolakan dan saran perbaikan..."}
                className="mt-2"
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Batal
              </Button>
              <Button 
                variant={reviewAction === 'approve' ? 'success' : 'destructive'}
                onClick={() => setShowReviewDialog(false)}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Setujui
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Tolak
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
