"use client"

import React, { useState } from "react"
import { 
  Users,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  BookOpen,
  Plus,
  Filter,
  Search
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { mockAssignments, mockCPLs } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function DosenAssignmentPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [comment, setComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter assignments for current dosen (simulation)
  const dosenAssignments = mockAssignments.filter(a => a.dosenId === "2") // Assuming current user is dosen-2

  const filteredAssignments = dosenAssignments.filter(assignment => {
    const matchesSearch = 
      assignment.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockCPLs.find(cpl => cpl.id === assignment.cplId)?.kode.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && assignment.status === activeTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge className="bg-yellow-100 text-yellow-700">Menunggu Respons</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-700">Diterima</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>
      case "done":
        return <Badge className="bg-blue-100 text-blue-700">Selesai</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAccept = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowAcceptDialog(false)
    setSelectedAssignment(null)
  }

  const handleReject = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setShowRejectDialog(false)
    setSelectedAssignment(null)
    setComment("")
  }

  const pendingCount = dosenAssignments.filter(a => a.status === "assigned").length
  const acceptedCount = dosenAssignments.filter(a => a.status === "accepted").length
  const doneCount = dosenAssignments.filter(a => a.status === "done").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Penugasan CPL</h1>
            <p className="text-gray-600 mt-1">Kelola penugasan CPL yang diberikan kepada Anda</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{dosenAssignments.length}</p>
                  <p className="text-sm text-green-700">Total Penugasan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                  <p className="text-sm text-yellow-700">Menunggu Respons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{acceptedCount}</p>
                  <p className="text-sm text-blue-700">Diterima</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{doneCount}</p>
                  <p className="text-sm text-purple-700">Selesai</p>
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
                  placeholder="Cari mata kuliah atau CPL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="all" className="text-xs">Semua</TabsTrigger>
                  <TabsTrigger value="assigned" className="text-xs">
                    Menunggu
                    {pendingCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-yellow-500">{pendingCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="accepted" className="text-xs">Diterima</TabsTrigger>
                  <TabsTrigger value="done" className="text-xs">Selesai</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredAssignments.length} Penugasan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAssignments.length > 0 ? (
              <div className="divide-y">
                {filteredAssignments.map((assignment) => {
                  const cpl = mockCPLs.find(c => c.id === assignment.cplId)
                  return (
                    <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                              <Target className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {assignment.mataKuliah}
                                </h3>
                                {getStatusBadge(assignment.status)}
                              </div>
                              
                              {cpl && (
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-600 text-white">{cpl.kode}</Badge>
                                  <span className="text-gray-600">{cpl.judul}</span>
                                </div>
                              )}
                              
                              <div className="text-sm text-gray-500 space-y-1">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Ditugaskan: {formatDate(assignment.assignedAt)}
                                  </span>
                                  {assignment.acceptedAt && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="h-4 w-4" />
                                      Diterima: {formatDate(assignment.acceptedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {cpl && (
                            <div className="ml-16 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Deskripsi CPL:</span> {cpl.deskripsi}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 lg:flex-shrink-0">
                          {assignment.status === "assigned" && (
                            <>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedAssignment(assignment.id)
                                  setShowRejectDialog(true)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Tolak
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedAssignment(assignment.id)
                                  setShowAcceptDialog(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Terima
                              </Button>
                            </>
                          )}
                          
                          {assignment.status === "accepted" && (
                            <Button 
                              variant="outline"
                              size="sm"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Buat RPS
                            </Button>
                          )}
                          
                          {assignment.status === "done" && (
                            <Button 
                              variant="outline"
                              size="sm"
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Lihat RPS
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "Tidak ditemukan penugasan" : "Belum ada penugasan"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? "Coba ubah kata kunci pencarian"
                    : "Penugasan CPL dari Kaprodi akan muncul di sini"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Penugasan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menerima penugasan CPL ini? Setelah diterima, Anda diharapkan membuat RPS yang sesuai.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tambahkan catatan (opsional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? "Memproses..." : "Ya, Terima Penugasan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Tolak Penugasan</DialogTitle>
            <DialogDescription>
              Berikan alasan mengapa Anda menolak penugasan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Alasan penolakan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={isProcessing || !comment.trim()}
            >
              {isProcessing ? "Memproses..." : "Tolak Penugasan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}