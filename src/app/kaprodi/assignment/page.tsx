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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Send,
  GraduationCap
} from "lucide-react"
import { mockUsers, mockCPLs, mockAssignments, mockMataKuliah } from "@/lib/mock-data"
import { cn, formatDateTime } from "@/lib/utils"
import Link from "next/link"

const statusConfig = {
  assigned: { label: 'Ditugaskan', variant: 'warning' as const, color: 'text-amber-600 bg-amber-100' },
  accepted: { label: 'Diterima', variant: 'info' as const, color: 'text-blue-600 bg-blue-100' },
  rejected: { label: 'Ditolak', variant: 'danger' as const, color: 'text-red-600 bg-red-100' },
  done: { label: 'Selesai', variant: 'success' as const, color: 'text-emerald-600 bg-emerald-100' },
}

export default function AssignmentPage() {
  const user = mockUsers[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedCPL, setSelectedCPL] = useState('')
  const [selectedDosen, setSelectedDosen] = useState('')
  const [selectedMataKuliah, setSelectedMataKuliah] = useState('')

  const dosenList = mockUsers.filter(u => u.role === 'dosen')
  const publishedCPLs = mockCPLs.filter(cpl => cpl.status === 'published')
  
  const filteredAssignments = mockAssignments.filter(a => {
    const matchesSearch = a.dosenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockAssignments.length,
    assigned: mockAssignments.filter(a => a.status === 'assigned').length,
    accepted: mockAssignments.filter(a => a.status === 'accepted').length,
    done: mockAssignments.filter(a => a.status === 'done').length,
  }

  return (
    <DashboardLayout user={user} unreadNotifications={3}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Penugasan CPL</h1>
            <p className="mt-1 text-slate-500">
              Kelola penugasan CPL ke dosen pengampu mata kuliah
            </p>
          </div>
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4" />
            Buat Penugasan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">Total Penugasan</p>
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
                  <p className="text-2xl font-bold text-amber-900">{stats.assigned}</p>
                  <p className="text-sm text-amber-700">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.accepted}</p>
                  <p className="text-sm text-blue-700">Diterima</p>
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
                  <p className="text-2xl font-bold text-emerald-900">{stats.done}</p>
                  <p className="text-sm text-emerald-700">Selesai</p>
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
                  placeholder="Cari dosen atau mata kuliah..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="assigned">Ditugaskan</SelectItem>
                  <SelectItem value="accepted">Diterima</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="done">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignment List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penugasan</CardTitle>
            <CardDescription>
              {filteredAssignments.length} penugasan ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const status = statusConfig[assignment.status]
                const cpl = mockCPLs.find(c => c.id === assignment.cplId)
                
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        status.color
                      )}>
                        {assignment.status === 'done' ? <CheckCircle className="h-6 w-6" /> :
                         assignment.status === 'accepted' ? <UserCheck className="h-6 w-6" /> :
                         assignment.status === 'rejected' ? <XCircle className="h-6 w-6" /> :
                         <Clock className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{assignment.mataKuliah}</h4>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">
                          Dosen: {assignment.dosenName}
                        </p>
                        {cpl && (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="mr-1 h-3 w-3" />
                              {cpl.kode}
                            </Badge>
                            <span className="text-xs text-slate-400">{cpl.judul}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Ditugaskan: {formatDateTime(assignment.assignedAt)}
                      </p>
                      {assignment.acceptedAt && (
                        <p className="text-xs text-slate-400">
                          Diterima: {formatDateTime(assignment.acceptedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredAssignments.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Tidak ada penugasan</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Mulai dengan membuat penugasan CPL ke dosen
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Penugasan Baru</DialogTitle>
              <DialogDescription>
                Tugaskan CPL ke dosen untuk mata kuliah tertentu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pilih CPL</Label>
                <Select value={selectedCPL} onValueChange={setSelectedCPL}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih CPL yang akan ditugaskan" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedCPLs.map((cpl) => (
                      <SelectItem key={cpl.id} value={cpl.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{cpl.kode}</span>
                          <span className="text-sm">{cpl.judul}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pilih Dosen</Label>
                <Select value={selectedDosen} onValueChange={setSelectedDosen}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dosen pengampu" />
                  </SelectTrigger>
                  <SelectContent>
                    {dosenList.map((dosen) => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        {dosen.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pilih Mata Kuliah</Label>
                <Select value={selectedMataKuliah} onValueChange={setSelectedMataKuliah}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMataKuliah.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{mk.kode}</span>
                          <span className="text-sm">{mk.nama}</span>
                          <Badge variant="outline" className="text-xs">{mk.sks} SKS</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 rounded-lg bg-slate-50 p-3">
                <Checkbox id="notify" defaultChecked />
                <Label htmlFor="notify" className="text-sm font-normal">
                  Kirim notifikasi ke dosen
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Batal
              </Button>
              <Button onClick={() => setShowAssignDialog(false)}>
                <Send className="h-4 w-4" />
                Kirim Penugasan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
