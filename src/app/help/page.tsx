"use client"

import React, { useState } from "react"
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Star,
  ThumbsUp,
  ChevronRight,
  Download,
  ExternalLink,
  Users,
  Target,
  Settings,
  Shield
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("faq")

  const faqCategories = [
    {
      title: "Pengelolaan CPL",
      icon: Target,
      items: [
        {
          question: "Bagaimana cara membuat CPL baru?",
          answer: "Untuk membuat CPL baru, masuk ke menu 'CPL Management' > 'Buat CPL Baru'. Isi semua field yang diperlukan seperti kode, judul, deskripsi, dan aspek pembelajaran. Pastikan semua informasi sudah benar sebelum menyimpan."
        },
        {
          question: "Apa perbedaan antara aspek sikap, pengetahuan, dan keterampilan?",
          answer: "Aspek sikap mengacu pada perilaku dan etika, aspek pengetahuan meliputi pemahaman konseptual, sedangkan aspek keterampilan mencakup kemampuan praktis dan aplikatif yang harus dimiliki lulusan."
        },
        {
          question: "Bagaimana cara mengedit CPL yang sudah dipublish?",
          answer: "CPL yang sudah dipublish tidak dapat langsung diedit. Anda perlu membuat versi baru dengan mengklik 'Buat Versi Baru' pada detail CPL, lalu lakukan perubahan pada versi tersebut."
        }
      ]
    },
    {
      title: "RPS Management",
      icon: FileText,
      items: [
        {
          question: "Bagaimana alur persetujuan RPS?",
          answer: "Dosen membuat RPS > Submit untuk review > Kaprodi melakukan review > Approve/Reject > Jika approved, RPS bisa dipublish dan digunakan."
        },
        {
          question: "Apa yang harus dilakukan jika RPS ditolak?",
          answer: "Jika RPS ditolak, baca catatan reviewer dengan seksama, perbaiki bagian yang diminta, kemudian submit ulang untuk review."
        },
        {
          question: "Bagaimana cara mengunduh RPS dalam format PDF?",
          answer: "Pada halaman detail RPS, klik tombol 'Download PDF' di bagian atas. File PDF akan otomatis terunduh dengan format standar institusi."
        }
      ]
    },
    {
      title: "Sistem & Akun",
      icon: Settings,
      items: [
        {
          question: "Bagaimana cara mengubah password?",
          answer: "Masuk ke 'Settings' > 'Security' > 'Change Password'. Masukkan password lama dan password baru, kemudian simpan perubahan."
        },
        {
          question: "Mengapa tidak bisa login ke sistem?",
          answer: "Pastikan email dan password benar. Jika masih bermasalah, hubungi admin sistem untuk reset password atau cek status akun Anda."
        },
        {
          question: "Bagaimana cara mengatur notifikasi?",
          answer: "Masuk ke 'Settings' > 'Notifications' untuk mengatur preferensi notifikasi email dan push notification sesuai kebutuhan."
        }
      ]
    }
  ]

  const tutorials = [
    {
      title: "Getting Started - Pengenalan Sistem",
      description: "Panduan lengkap untuk memulai menggunakan sistem kurikulum",
      duration: "15 menit",
      type: "video",
      difficulty: "Beginner"
    },
    {
      title: "Membuat dan Mengelola CPL",
      description: "Tutorial step-by-step untuk membuat dan mengelola CPL",
      duration: "20 menit", 
      type: "video",
      difficulty: "Beginner"
    },
    {
      title: "Workflow RPS - Dari Pembuatan hingga Approval",
      description: "Memahami alur kerja RPS dalam sistem",
      duration: "25 menit",
      type: "video", 
      difficulty: "Intermediate"
    },
    {
      title: "Mapping CPL dengan Mata Kuliah",
      description: "Cara melakukan pemetaan CPL dengan mata kuliah",
      duration: "18 menit",
      type: "video",
      difficulty: "Intermediate"
    },
    {
      title: "Generate Dokumen Kurikulum",
      description: "Cara menghasilkan dokumen kurikulum otomatis",
      duration: "12 menit",
      type: "document",
      difficulty: "Advanced"
    },
    {
      title: "Tips Optimasi Sistem",
      description: "Best practices untuk menggunakan sistem secara efisien",
      duration: "10 menit",
      type: "document", 
      difficulty: "Advanced"
    }
  ]

  const quickGuides = [
    {
      title: "Panduan Dosen",
      description: "Panduan lengkap untuk dosen dalam menggunakan sistem",
      size: "2.5 MB",
      format: "PDF"
    },
    {
      title: "Panduan Kaprodi", 
      description: "Manual khusus untuk ketua program studi",
      size: "3.1 MB",
      format: "PDF"
    },
    {
      title: "Template RPS",
      description: "Template dan contoh RPS yang baik",
      size: "1.8 MB",
      format: "DOCX"
    },
    {
      title: "Checklist Quality Assurance",
      description: "Daftar periksa untuk memastikan kualitas kurikulum",
      size: "856 KB",
      format: "PDF"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600 mb-6">Temukan jawaban, panduan, dan dukungan untuk menggunakan sistem kurikulum</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari bantuan, tutorial, FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-center"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Pelajari dengan video</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat dengan support</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-600">Kirim pertanyaan via email</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
              <p className="text-sm text-gray-600">Hubungi langsung</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="guides">Panduan</TabsTrigger>
            <TabsTrigger value="contact">Kontak Support</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Pertanyaan yang sering diajukan beserta jawabannya
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {faqCategories.map((category, categoryIndex) => {
                const IconComponent = category.icon
                return (
                  <Card key={categoryIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.items.map((item, itemIndex) => (
                          <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Video Tutorials & Panduan</CardTitle>
                <CardDescription>
                  Pelajari cara menggunakan sistem melalui tutorial interaktif
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${tutorial.type === "video" ? "bg-red-100" : "bg-blue-100"}`}>
                        {tutorial.type === "video" ? (
                          <Video className={`h-6 w-6 ${tutorial.type === "video" ? "text-red-600" : "text-blue-600"}`} />
                        ) : (
                          <FileText className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                        <Button size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {tutorial.type === "video" ? "Tonton Video" : "Baca Panduan"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Panduan & Dokumentasi</CardTitle>
                <CardDescription>
                  Unduh panduan lengkap dan dokumentasi sistem
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {quickGuides.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Download className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>{guide.size}</span>
                          <Badge variant="outline" className="text-xs">{guide.format}</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sumber Daya Tambahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Knowledge Base</p>
                      <p className="text-sm text-blue-600">Artikel dan panduan mendalam</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Community Forum</p>
                      <p className="text-sm text-purple-600">Diskusi dengan pengguna lain</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Webinar Series</p>
                      <p className="text-sm text-green-600">Sesi pelatihan online rutin</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Daftar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Hubungi Tim Support</CardTitle>
                <CardDescription>
                  Berbagai cara untuk mendapatkan bantuan dari tim kami
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Live Chat Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Online - Response dalam 2 menit</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Dapatkan bantuan instan melalui chat dengan tim support kami yang berpengalaman.
                  </p>
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mulai Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Response dalam 24 jam</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Kirim pertanyaan detail via email untuk mendapat jawaban komprehensif.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">support@kurikulum.ac.id</p>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Kirim Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Sen-Jum, 08:00 - 17:00 WIB</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Hubungi langsung untuk bantuan urgent atau diskusi kompleks.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">+62 21 1234 5678</p>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Telepon Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-orange-600" />
                    Ticket Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Tracking & Follow-up</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Buat ticket untuk masalah teknis yang memerlukan investigasi mendalam.
                  </p>
                  <Button variant="outline" className="w-full">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Buat Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jam Operasional Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hari Kerja</h4>
                    <p className="text-sm text-gray-600">Senin - Jumat: 08:00 - 17:00 WIB</p>
                    <p className="text-sm text-gray-600">Live chat, phone, dan email support tersedia</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Weekend</h4>
                    <p className="text-sm text-gray-600">Sabtu - Minggu: Email support only</p>
                    <p className="text-sm text-gray-600">Response pada hari kerja berikutnya</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}