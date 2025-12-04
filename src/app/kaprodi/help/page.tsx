"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Settings,
  Lightbulb,
  Bug,
  Heart,
  Send
} from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  views: number
}

interface SupportTicket {
  id: string
  title: string
  description: string
  category: 'technical' | 'feature' | 'bug' | 'account'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara membuat RPS baru?',
    answer: 'Untuk membuat RPS baru, masuk ke menu RPS Management, klik tombol "Tambah RPS", isi form yang tersedia dengan lengkap termasuk informasi mata kuliah, CPL, dan materi pembelajaran.',
    category: 'rps',
    helpful: 25,
    views: 150
  },
  {
    id: 'faq-2',
    question: 'Bagaimana cara menyetujui atau menolak RPS?',
    answer: 'Di dashboard Kaprodi, Anda dapat melihat daftar RPS yang menunggu approval. Klik pada RPS yang ingin direview, baca kontennya, kemudian klik tombol "Setujui" atau "Tolak" dengan memberikan catatan jika diperlukan.',
    category: 'approval',
    helpful: 18,
    views: 89
  },
  {
    id: 'faq-3',
    question: 'Bagaimana cara melakukan pemetaan CPL ke CPMK?',
    answer: 'Masuk ke menu CPL Management, pilih mata kuliah yang akan dipetakan, kemudian hubungkan setiap CPMK dengan CPL yang relevan menggunakan matriks pemetaan yang tersedia.',
    category: 'cpl',
    helpful: 32,
    views: 210
  },
  {
    id: 'faq-4',
    question: 'Bagaimana cara menambah user dosen baru?',
    answer: 'Masuk ke User Management, klik "Tambah User", isi informasi dosen lengkap termasuk nama, email, NIDN, dan role. Sistem akan mengirim email aktivasi ke dosen tersebut.',
    category: 'users',
    helpful: 15,
    views: 67
  },
  {
    id: 'faq-5',
    question: 'Bagaimana cara membuat backup data sistem?',
    answer: 'Masuk ke menu Backup & Restore, pilih jenis backup yang diinginkan (Full, RPS Only, atau Users Only), kemudian klik "Mulai Backup". File backup akan tersimpan dan dapat didownload.',
    category: 'backup',
    helpful: 22,
    views: 95
  }
]

const supportTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    title: 'Error saat upload dokumen RPS',
    description: 'Mendapat error 500 saat mencoba upload file PDF RPS',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'ticket-2',
    title: 'Request fitur export laporan ke Excel',
    description: 'Perlu fitur untuk export laporan RPS dalam format Excel',
    category: 'feature',
    priority: 'medium',
    status: 'open',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z'
  }
]

export default function HelpSupportPage() {
  const user = mockUsers[0] // Kaprodi user
  const [faqs] = useState<FAQItem[]>(faqData)
  const [tickets] = useState<SupportTicket[]>(supportTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  
  // New ticket form
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical' as const,
    priority: 'medium' as const
  })

  const categories = [
    { value: 'all', label: 'Semua Kategori', count: faqs.length },
    { value: 'rps', label: 'RPS Management', count: faqs.filter(f => f.category === 'rps').length },
    { value: 'approval', label: 'Approval Process', count: faqs.filter(f => f.category === 'approval').length },
    { value: 'cpl', label: 'CPL Mapping', count: faqs.filter(f => f.category === 'cpl').length },
    { value: 'users', label: 'User Management', count: faqs.filter(f => f.category === 'users').length },
    { value: 'backup', label: 'Backup & System', count: faqs.filter(f => f.category === 'backup').length }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingTicket(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Ticket support berhasil dikirim! Kami akan merespon dalam 24 jam.')
      setNewTicket({
        title: '',
        description: '',
        category: 'technical',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error submitting ticket:', error)
      alert('Gagal mengirim ticket. Silakan coba lagi.')
    } finally {
      setIsSubmittingTicket(false)
    }
  }

  const markHelpful = (faqId: string) => {
    // Implementation would update FAQ helpful count
    alert('Terima kasih atas feedback Anda!')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Pusat Bantuan</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan Anda atau hubungi tim support kami untuk bantuan lebih lanjut
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Dokumentasi</h3>
              <p className="text-sm text-slate-600 mb-4">
                Panduan lengkap penggunaan sistem kurikulum
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Video Tutorial</h3>
              <p className="text-sm text-slate-600 mb-4">
                Tutorial step-by-step dalam bentuk video
              </p>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Tonton Video
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Live Chat</h3>
              <p className="text-sm text-slate-600 mb-4">
                Chat langsung dengan tim support
              </p>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mulai Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Pertanyaan yang sering diajukan dan jawabannya
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search and Filter */}
                <div className="flex flex-col gap-4 mb-6 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Cari pertanyaan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">
                        Tidak ditemukan FAQ yang sesuai dengan pencarian Anda
                      </p>
                    </div>
                  ) : (
                    filteredFAQs.map((faq) => (
                      <div key={faq.id} className="border border-slate-200 rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50"
                        >
                          <h4 className="font-medium text-slate-900 pr-4">{faq.question}</h4>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedFAQ === faq.id && (
                          <div className="px-4 pb-4 border-t border-slate-100">
                            <p className="text-slate-600 mb-4 mt-3">{faq.answer}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  {faq.helpful} helpful
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {faq.views} views
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markHelpful(faq.id)}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                Helpful
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Buat Tiket Support
                </CardTitle>
                <CardDescription>
                  Tidak menemukan jawaban? Kirimkan tiket support kepada kami
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <select
                        id="category"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as any }))}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="technical">Technical Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="account">Account Issue</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Prioritas</Label>
                      <select
                        id="priority"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      placeholder="Jelaskan masalah secara singkat..."
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Detail</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Jelaskan masalah dengan detail, langkah yang sudah dicoba, dan informasi lainnya yang relevan..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmittingTicket}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingTicket ? 'Mengirim...' : 'Kirim Tiket'}
                    </Button>
                    <Button type="button" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Lampirkan File
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kontak Support</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">support@university.ac.id</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-slate-900">Telepon</p>
                    <p className="text-sm text-slate-600">+62 21 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900">Jam Kerja</p>
                    <p className="text-sm text-slate-600">Senin - Jumat, 08:00 - 17:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Tiket Saya</CardTitle>
                <CardDescription>
                  Status tiket support yang telah Anda buat
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {tickets.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Belum ada tiket</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 text-sm">{ticket.title}</h4>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          {getPriorityBadge(ticket.priority)}
                          <span>#{ticket.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Sumber Daya</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  User Manual PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Book className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Community Forum
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Sistem</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Web Application:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Database:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>File Storage:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600">Limited</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t">
                  Last updated: 5 minutes ago
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}