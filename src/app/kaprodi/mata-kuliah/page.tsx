"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Users,
  Calendar,
  Award,
  GraduationCap,
  Clock,
  FileText,
  Eye,
  Loader2,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  UserMinus,
  UserCheck
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { mataKuliahService, MataKuliah, CreateMataKuliahRequest, AssignDosenRequest, UnassignDosenRequest } from "@/lib/api/mata-kuliah"
import { usersService, User } from "@/lib/api/users"
import Link from "next/link"

// Display interface for mata kuliah
interface DisplayMataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  jenis: string;
  prasyarat: string[];
  deskripsi: string;
  dosenPengampu: { id: string; nama: string } | null;
  koordinator: { id: string; nama: string } | null;
  cplTerkait: string[];
  status: string;
}

export default function MataKuliahPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  
  // State
  const [mataKuliahList, setMataKuliahList] = useState<DisplayMataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterJenis, setFilterJenis] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    kode: '',
    nama: '',
    sks: '',
    semester: '',
    jenis: '',
    deskripsi: ''
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMK, setSelectedMK] = useState<DisplayMataKuliah | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Dosen list for assignment
  const [dosenList, setDosenList] = useState<User[]>([])
  const [loadingDosen, setLoadingDosen] = useState(false)

  // Assign dosen state
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [assignForm, setAssignForm] = useState({
    dosen_pengampu_id: '',
    koordinator_id: ''
  })
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  // Unassign dosen state
  const [showUnassignDialog, setShowUnassignDialog] = useState(false)
  const [unassignType, setUnassignType] = useState<'pengampu' | 'koordinator' | 'all'>('pengampu')
  const [unassigning, setUnassigning] = useState(false)

  // Fetch dosen list
  const fetchDosenList = useCallback(async () => {
    setLoadingDosen(true)
    try {
      const response = await usersService.getDosen()
      if (response.success && response.data?.data) {
        setDosenList(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching dosen:', err)
    } finally {
      setLoadingDosen(false)
    }
  }, [])

  // Fetch data
  const fetchMataKuliah = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { limit: 100 }
      if (filterSemester !== 'all') params.semester = parseInt(filterSemester)
      if (filterJenis !== 'all') params.jenis = filterJenis
      if (searchQuery) params.search = searchQuery

      const response = await mataKuliahService.getAll(params)
      
      if (response.success && response.data && response.data.data) {
        const mappedData: DisplayMataKuliah[] = response.data.data.map(mk => {
          // Normalize jenis: handle null, undefined, empty string, and case variations
          const jenisRaw = (mk.jenis || '').toLowerCase().trim()
          const jenisDisplay = jenisRaw === 'pilihan' ? 'Pilihan' : 'Wajib' // Default to Wajib
          
          return {
            id: mk.id,
            kode: mk.kode,
            nama: mk.nama,
            sks: mk.sks,
            semester: mk.semester,
            jenis: jenisDisplay,
            prasyarat: mk.prasyarat || [],
            deskripsi: mk.deskripsi || '',
            dosenPengampu: mk.dosen_pengampu ? { id: mk.dosen_pengampu.id, nama: mk.dosen_pengampu.nama } : null,
            koordinator: mk.koordinator ? { id: mk.koordinator.id, nama: mk.koordinator.nama } : null,
            cplTerkait: [],
            status: mk.status
          }
        })
        setMataKuliahList(mappedData)
      } else {
        setMataKuliahList([])
      }
    } catch (err) {
      console.error('Error fetching mata kuliah:', err)
      setError('Gagal memuat data mata kuliah. Pastikan server API berjalan.')
      setMataKuliahList([])
    } finally {
      setLoading(false)
    }
  }, [filterSemester, filterJenis, searchQuery])

  useEffect(() => {
    fetchMataKuliah()
    fetchDosenList()
  }, [fetchMataKuliah, fetchDosenList])

  // Filter logic
  const filteredMataKuliah = mataKuliahList.filter(mk => {
    const matchesSearch = searchQuery === '' ||
      mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: mataKuliahList.length,
    wajib: mataKuliahList.filter(mk => mk.jenis === "Wajib").length,
    pilihan: mataKuliahList.filter(mk => mk.jenis === "Pilihan").length,
    totalSks: mataKuliahList.reduce((total, mk) => total + mk.sks, 0)
  }

  // Handle create
  const handleCreate = async () => {
    if (!createForm.kode || !createForm.nama || !createForm.sks || !createForm.semester || !createForm.jenis) {
      setCreateError('Semua field wajib diisi')
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const data: CreateMataKuliahRequest = {
        kode: createForm.kode,
        nama: createForm.nama,
        sks: parseInt(createForm.sks),
        semester: parseInt(createForm.semester),
        jenis: createForm.jenis as 'wajib' | 'pilihan',
        deskripsi: createForm.deskripsi
      }

      const response = await mataKuliahService.create(data)
      if (response.success) {
        setShowCreateDialog(false)
        setCreateForm({ kode: '', nama: '', sks: '', semester: '', jenis: '', deskripsi: '' })
        fetchMataKuliah()
      } else {
        setCreateError(response.message || 'Gagal membuat mata kuliah')
      }
    } catch (err) {
      console.error('Error creating mata kuliah:', err)
      setCreateError('Terjadi kesalahan')
    } finally {
      setCreating(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMK) return

    setDeleting(true)
    try {
      const response = await mataKuliahService.delete(selectedMK.id)
      if (response.success) {
        setShowDeleteDialog(false)
        setSelectedMK(null)
        fetchMataKuliah()
      }
    } catch (err) {
      console.error('Error deleting mata kuliah:', err)
    } finally {
      setDeleting(false)
    }
  }

  // Handle assign dosen
  const handleAssignDosen = async () => {
    if (!selectedMK) return
    if (!assignForm.dosen_pengampu_id && !assignForm.koordinator_id) {
      setAssignError('Minimal satu dosen harus dipilih (pengampu atau koordinator)')
      return
    }

    setAssigning(true)
    setAssignError(null)
    try {
      const data: AssignDosenRequest = {}
      if (assignForm.dosen_pengampu_id) data.dosen_pengampu_id = assignForm.dosen_pengampu_id
      if (assignForm.koordinator_id) data.koordinator_id = assignForm.koordinator_id

      const response = await mataKuliahService.assignDosen(selectedMK.id, data)
      
      // Handle response - check for success or data presence
      if (response.success || response.data) {
        setShowAssignDialog(false)
        setAssignForm({ dosen_pengampu_id: '', koordinator_id: '' })
        setSelectedMK(null)
        fetchMataKuliah()
      } else {
        setAssignError(response.message || 'Gagal menugaskan dosen')
      }
    } catch (err) {
      console.error('Error assigning dosen:', err)
      setAssignError('Terjadi kesalahan saat menugaskan dosen')
    } finally {
      setAssigning(false)
    }
  }

  // Handle unassign dosen
  const handleUnassignDosen = async () => {
    if (!selectedMK) return

    setUnassigning(true)
    try {
      const data: UnassignDosenRequest = { type: unassignType }
      const response = await mataKuliahService.unassignDosen(selectedMK.id, data)
      
      // Handle response - check for success or data presence
      if (response.success || response.data) {
        setShowUnassignDialog(false)
        setSelectedMK(null)
        fetchMataKuliah()
      }
    } catch (err) {
      console.error('Error unassigning dosen:', err)
    } finally {
      setUnassigning(false)
    }
  }

  // Open assign dialog with pre-filled values
  const openAssignDialog = (mk: DisplayMataKuliah) => {
    setSelectedMK(mk)
    setAssignForm({
      dosen_pengampu_id: mk.dosenPengampu?.id || '',
      koordinator_id: mk.koordinator?.id || ''
    })
    setAssignError(null)
    setShowAssignDialog(true)
  }

  // Open unassign dialog
  const openUnassignDialog = (mk: DisplayMataKuliah) => {
    setSelectedMK(mk)
    // Set default type based on what's assigned
    if (mk.dosenPengampu && mk.koordinator) {
      setUnassignType('all')
    } else if (mk.dosenPengampu) {
      setUnassignType('pengampu')
    } else if (mk.koordinator) {
      setUnassignType('koordinator')
    }
    setShowUnassignDialog(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
            <p className="text-gray-600 mt-1">Kelola mata kuliah program studi Teknik Informatika</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mata Kuliah
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  <p className="text-sm text-blue-700">Total MK</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.wajib}</p>
                  <p className="text-sm text-green-700">MK Wajib</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.pilihan}</p>
                  <p className="text-sm text-purple-700">MK Pilihan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{stats.totalSks}</p>
                  <p className="text-sm text-orange-700">Total SKS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {Array.from({length: 8}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        Semester {i+1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterJenis} onValueChange={setFilterJenis}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="wajib">Wajib</SelectItem>
                    <SelectItem value="pilihan">Pilihan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mata Kuliah List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Daftar Mata Kuliah ({filteredMataKuliah.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-4 text-sm text-gray-500">Memuat data...</p>
              </div>
            ) : filteredMataKuliah.length > 0 ? (
              <div className="divide-y">
                {filteredMataKuliah.map((mk) => (
                  <div key={mk.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-600 text-white">{mk.kode}</Badge>
                              <h3 className="text-lg font-semibold text-gray-900">{mk.nama}</h3>
                              <Badge className={
                                mk.jenis === "Wajib" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-purple-100 text-purple-700"
                              }>
                                {mk.jenis}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{mk.deskripsi}</p>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {mk.sks} SKS - Semester {mk.semester}
                                </span>
                              </div>
                            </div>
                            
                            {mk.prasyarat.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Prasyarat: </span>
                                <span className="text-sm text-gray-600">{mk.prasyarat.join(", ")}</span>
                              </div>
                            )}
                            
                            {/* Dosen Pengampu */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Dosen Pengampu: </span>
                              {mk.dosenPengampu ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {mk.dosenPengampu.nama}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                  Belum ditugaskan
                                </Badge>
                              )}
                            </div>

                            {/* Koordinator */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Koordinator: </span>
                              {mk.koordinator ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {mk.koordinator.nama}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                  Belum ditugaskan
                                </Badge>
                              )}
                            </div>
                            
                            {mk.cplTerkait.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-sm font-medium text-gray-700">CPL Terkait: </span>
                                {mk.cplTerkait.map((cpl, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {cpl}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                        {/* Assign Dosen Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => openAssignDialog(mk)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Dosen
                        </Button>
                        
                        {/* Unassign Dosen Button - Only show if dosen is assigned */}
                        {(mk.dosenPengampu || mk.koordinator) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-orange-600 hover:bg-orange-50"
                            onClick={() => openUnassignDialog(mk)}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unassign
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/kaprodi/mata-kuliah/edit/${mk.id}`}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedMK(mk)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "Tidak ditemukan mata kuliah" : "Belum ada mata kuliah"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? "Coba ubah kata kunci pencarian"
                    : "Tambahkan mata kuliah pertama untuk program studi"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
            <DialogDescription>
              Lengkapi informasi mata kuliah yang akan ditambahkan ke kurikulum
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Mata Kuliah</Label>
                <Input 
                  id="kode" 
                  placeholder="TIF101" 
                  value={createForm.kode}
                  onChange={(e) => setCreateForm({ ...createForm, kode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sks">SKS</Label>
                <Select 
                  value={createForm.sks} 
                  onValueChange={(value) => setCreateForm({ ...createForm, sks: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih SKS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 SKS</SelectItem>
                    <SelectItem value="2">2 SKS</SelectItem>
                    <SelectItem value="3">3 SKS</SelectItem>
                    <SelectItem value="4">4 SKS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Mata Kuliah</Label>
              <Input 
                id="nama" 
                placeholder="Algoritma dan Pemrograman" 
                value={createForm.nama}
                onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={createForm.semester}
                  onValueChange={(value) => setCreateForm({ ...createForm, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 8}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        Semester {i+1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis</Label>
                <Select
                  value={createForm.jenis}
                  onValueChange={(value) => setCreateForm({ ...createForm, jenis: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wajib">Wajib</SelectItem>
                    <SelectItem value="pilihan">Pilihan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea 
                id="deskripsi" 
                placeholder="Deskripsi mata kuliah..."
                rows={3}
                value={createForm.deskripsi}
                onChange={(e) => setCreateForm({ ...createForm, deskripsi: e.target.value })}
              />
            </div>

            {createError && (
              <p className="text-sm text-red-500">{createError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
              Batal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Simpan Mata Kuliah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Mata Kuliah</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus mata kuliah <strong>{selectedMK?.kode} - {selectedMK?.nama}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dosen Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Assign Dosen ke Mata Kuliah
            </DialogTitle>
            <DialogDescription>
              Tugaskan dosen pengampu dan/atau koordinator untuk mata kuliah <strong>{selectedMK?.kode} - {selectedMK?.nama}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Dosen Pengampu */}
            <div className="space-y-2">
              <Label htmlFor="dosen_pengampu">Dosen Pengampu</Label>
              <Select 
                value={assignForm.dosen_pengampu_id} 
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, dosen_pengampu_id: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Dosen Pengampu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tidak Ada --</SelectItem>
                  {loadingDosen ? (
                    <SelectItem value="loading" disabled>Memuat dosen...</SelectItem>
                  ) : (
                    dosenList.map(dosen => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        {dosen.nama} ({dosen.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Dosen yang bertanggung jawab mengajar mata kuliah ini</p>
            </div>

            {/* Koordinator */}
            <div className="space-y-2">
              <Label htmlFor="koordinator">Koordinator Mata Kuliah</Label>
              <Select 
                value={assignForm.koordinator_id} 
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, koordinator_id: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Koordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tidak Ada --</SelectItem>
                  {loadingDosen ? (
                    <SelectItem value="loading" disabled>Memuat dosen...</SelectItem>
                  ) : (
                    dosenList.map(dosen => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        {dosen.nama} ({dosen.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Dosen yang bertugas sebagai koordinator mata kuliah</p>
            </div>

            {assignError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{assignError}</p>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Info:</strong> Minimal satu dosen harus dipilih. Jika sudah ada dosen yang ditugaskan, 
                memilih dosen baru akan menggantikan dosen sebelumnya.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={assigning}>
              Batal
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleAssignDosen}
              disabled={assigning}
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Assign Dosen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Dosen Dialog */}
      <Dialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <UserMinus className="h-5 w-5" />
              Batalkan Penugasan Dosen
            </DialogTitle>
            <DialogDescription>
              Batalkan penugasan dosen dari mata kuliah <strong>{selectedMK?.kode} - {selectedMK?.nama}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Assignment Info */}
            <div className="p-3 bg-gray-50 border rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Dosen yang ditugaskan saat ini:</p>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pengampu:</span>{' '}
                  {selectedMK?.dosenPengampu ? selectedMK.dosenPengampu.nama : 'Tidak ada'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Koordinator:</span>{' '}
                  {selectedMK?.koordinator ? selectedMK.koordinator.nama : 'Tidak ada'}
                </p>
              </div>
            </div>

            {/* Unassign Type Selection */}
            <div className="space-y-2">
              <Label>Pilih yang akan di-unassign</Label>
              <Select value={unassignType} onValueChange={(value) => setUnassignType(value as 'pengampu' | 'koordinator' | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMK?.dosenPengampu && selectedMK?.koordinator ? (
                    <>
                      <SelectItem value="pengampu">Dosen Pengampu saja</SelectItem>
                      <SelectItem value="koordinator">Koordinator saja</SelectItem>
                      <SelectItem value="all">Keduanya (Pengampu & Koordinator)</SelectItem>
                    </>
                  ) : selectedMK?.dosenPengampu ? (
                    <SelectItem value="pengampu">Dosen Pengampu</SelectItem>
                  ) : selectedMK?.koordinator ? (
                    <SelectItem value="koordinator">Koordinator</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>Peringatan:</strong> Tindakan ini akan menghapus penugasan dosen dari mata kuliah. 
                Anda dapat menugaskan dosen baru setelahnya.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnassignDialog(false)} disabled={unassigning}>
              Batal
            </Button>
            <Button 
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700" 
              onClick={handleUnassignDosen}
              disabled={unassigning}
            >
              {unassigning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              Unassign Dosen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}