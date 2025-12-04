"use client"

import React, { useState } from "react"
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
  Eye
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

// Mock data mata kuliah
const mockMataKuliah = [
  {
    id: "mk-1",
    kode: "TIF101",
    nama: "Algoritma dan Pemrograman",
    sks: 3,
    semester: 1,
    jenis: "Wajib",
    prasyarat: [],
    deskripsi: "Mata kuliah yang membahas konsep dasar algoritma dan pemrograman komputer",
    dosenPengampu: ["Dr. Budi Santoso", "Dr. Sari Wahyuni"],
    cplTerkait: ["CPL-1", "CPL-3"],
    status: "aktif"
  },
  {
    id: "mk-2",
    kode: "TIF102",
    nama: "Struktur Data",
    sks: 3,
    semester: 2,
    jenis: "Wajib",
    prasyarat: ["TIF101"],
    deskripsi: "Mata kuliah yang membahas berbagai struktur data dan implementasinya",
    dosenPengampu: ["Dr. Ahmad Fauzi"],
    cplTerkait: ["CPL-2", "CPL-3"],
    status: "aktif"
  },
  {
    id: "mk-3",
    kode: "TIF201",
    nama: "Basis Data",
    sks: 3,
    semester: 3,
    jenis: "Wajib",
    prasyarat: ["TIF102"],
    deskripsi: "Mata kuliah yang membahas konsep dan implementasi sistem basis data",
    dosenPengampu: ["Dr. Lisa Permata"],
    cplTerkait: ["CPL-1", "CPL-4"],
    status: "aktif"
  },
  {
    id: "mk-4",
    kode: "TIF301",
    nama: "Kecerdasan Buatan",
    sks: 3,
    semester: 5,
    jenis: "Pilihan",
    prasyarat: ["TIF201", "TIF202"],
    deskripsi: "Mata kuliah yang membahas konsep dan teknik kecerdasan buatan",
    dosenPengampu: ["Dr. Rudi Hartono"],
    cplTerkait: ["CPL-2", "CPL-5"],
    status: "aktif"
  },
  {
    id: "mk-5",
    kode: "TIF302",
    nama: "Pembelajaran Mesin",
    sks: 3,
    semester: 6,
    jenis: "Pilihan",
    prasyarat: ["TIF301"],
    deskripsi: "Mata kuliah yang membahas algoritma dan teknik pembelajaran mesin",
    dosenPengampu: ["Dr. Maya Sari"],
    cplTerkait: ["CPL-2", "CPL-6"],
    status: "aktif"
  }
]

export default function MataKuliahPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterJenis, setFilterJenis] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredMataKuliah = mockMataKuliah.filter(mk => {
    const matchesSearch = 
      mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSemester = filterSemester === "all" || mk.semester.toString() === filterSemester
    const matchesJenis = filterJenis === "all" || mk.jenis.toLowerCase() === filterJenis.toLowerCase()
    
    return matchesSearch && matchesSemester && matchesJenis
  })

  const stats = {
    total: mockMataKuliah.length,
    wajib: mockMataKuliah.filter(mk => mk.jenis === "Wajib").length,
    pilihan: mockMataKuliah.filter(mk => mk.jenis === "Pilihan").length,
    totalSks: mockMataKuliah.reduce((total, mk) => total + mk.sks, 0)
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
            {filteredMataKuliah.length > 0 ? (
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
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {mk.dosenPengampu.length} Dosen
                                </span>
                              </div>
                            </div>
                            
                            {mk.prasyarat.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Prasyarat: </span>
                                <span className="text-sm text-gray-600">{mk.prasyarat.join(", ")}</span>
                              </div>
                            )}
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Dosen Pengampu: </span>
                              <span className="text-sm text-gray-600">{mk.dosenPengampu.join(", ")}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <span className="text-sm font-medium text-gray-700">CPL Terkait: </span>
                              {mk.cplTerkait.map((cpl, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cpl}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
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
                <Input id="kode" placeholder="TIF101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sks">SKS</Label>
                <Select>
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
              <Input id="nama" placeholder="Algoritma dan Pemrograman" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wajib">Wajib</SelectItem>
                    <SelectItem value="Pilihan">Pilihan</SelectItem>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Batal
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Simpan Mata Kuliah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}