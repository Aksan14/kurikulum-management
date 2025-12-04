"use client"

import React, { useState } from "react"
import { 
  Users,
  Settings,
  Database,
  Shield,
  Activity,
  BarChart3,
  Server,
  HardDrive,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  FileText,
  Calendar,
  Mail,
  Bell
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { mockUsers, mockCPLs, mockRPS } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/utils"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  
  // System statistics
  const stats = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => new Date().getTime() - new Date(u.lastLogin || "2024-01-01").getTime() < 7 * 24 * 60 * 60 * 1000).length,
    totalCPL: mockCPLs.length,
    totalRPS: mockRPS.length,
    systemHealth: 98,
    storageUsed: 65,
    activeConnections: 24
  }

  // Recent activities
  const recentActivities = [
    { user: "Dr. Budi Santoso", action: "Login ke sistem", timestamp: "2024-01-20 10:30", type: "login" },
    { user: "Dr. Sari Wahyuni", action: "Membuat RPS baru", timestamp: "2024-01-20 10:15", type: "create" },
    { user: "Prof. Ahmad Fauzi", action: "Update profil", timestamp: "2024-01-20 09:45", type: "update" },
    { user: "System", action: "Backup otomatis selesai", timestamp: "2024-01-20 02:00", type: "system" },
    { user: "Dr. Linda Sari", action: "Export laporan", timestamp: "2024-01-19 16:20", type: "export" }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Kelola sistem, pengguna, dan konfigurasi aplikasi</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Server className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.systemHealth}%</p>
                  <p className="text-sm text-green-700">System Health</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.activeUsers}/{stats.totalUsers}</p>
                  <p className="text-sm text-blue-700">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <HardDrive className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.storageUsed}%</p>
                  <p className="text-sm text-purple-700">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Wifi className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{stats.activeConnections}</p>
                  <p className="text-sm text-orange-700">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Config</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="backup">Backup & Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Database Connection</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">API Services</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Running</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">Storage Space</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">65% Used</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Email Service</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.slice(0, 6).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`p-1 rounded-lg ${
                          activity.type === "login" ? "bg-blue-100" :
                          activity.type === "create" ? "bg-green-100" :
                          activity.type === "update" ? "bg-yellow-100" :
                          activity.type === "system" ? "bg-purple-100" :
                          "bg-orange-100"
                        }`}>
                          {activity.type === "login" && <Users className="h-3 w-3 text-blue-600" />}
                          {activity.type === "create" && <Plus className="h-3 w-3 text-green-600" />}
                          {activity.type === "update" && <Edit3 className="h-3 w-3 text-yellow-600" />}
                          {activity.type === "system" && <Server className="h-3 w-3 text-purple-600" />}
                          {activity.type === "export" && <Download className="h-3 w-3 text-orange-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                          <p className="text-xs text-gray-600">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{stats.totalCPL}</p>
                    <p className="text-sm text-blue-700">Total CPL</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{stats.totalRPS}</p>
                    <p className="text-sm text-green-700">Total RPS</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{mockUsers.filter(u => u.role === "dosen").length}</p>
                    <p className="text-sm text-purple-700">Dosen</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{mockUsers.filter(u => u.role === "kaprodi").length}</p>
                    <p className="text-sm text-orange-700">Kaprodi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari pengguna..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="kaprodi">Kaprodi</SelectItem>
                    <SelectItem value="dosen">Dosen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {getInitials(user.nama)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              user.role === "kaprodi" 
                                ? "bg-purple-100 text-purple-700" 
                                : "bg-blue-100 text-blue-700"
                            }>
                              {user.role === "kaprodi" ? "Kaprodi" : "Dosen"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Application Name</label>
                    <Input defaultValue="Sistem Kurikulum" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Max File Upload Size (MB)</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Default Language</label>
                    <Select defaultValue="id">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">SMTP Server</label>
                    <Input defaultValue="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">SMTP Port</label>
                    <Input type="number" defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From Email</label>
                    <Input type="email" defaultValue="noreply@kurikulum.ac.id" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From Name</label>
                    <Input defaultValue="Sistem Kurikulum" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Storage & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                      <span className="text-sm text-gray-600">{stats.storageUsed}% of 100 GB</span>
                    </div>
                    <Progress value={stats.storageUsed} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      <span className="text-sm text-gray-600">45% of 8 GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="text-sm text-gray-600">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">System Logs</CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="error">Errors</SelectItem>
                        <SelectItem value="warning">Warnings</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <div className="text-blue-600">[2024-01-20 10:30:15] INFO: User login successful - Dr. Budi Santoso</div>
                  <div className="text-green-600">[2024-01-20 10:15:22] INFO: RPS created successfully - ID: RPS-001</div>
                  <div className="text-yellow-600">[2024-01-20 09:45:10] WARN: High storage usage detected - 65%</div>
                  <div className="text-blue-600">[2024-01-20 09:30:05] INFO: Database backup completed successfully</div>
                  <div className="text-red-600">[2024-01-20 08:15:33] ERROR: Email service connection timeout</div>
                  <div className="text-blue-600">[2024-01-20 08:00:01] INFO: System health check completed</div>
                  <div className="text-green-600">[2024-01-19 23:59:59] INFO: Daily backup started</div>
                  <div className="text-blue-600">[2024-01-19 18:30:15] INFO: User logout - Dr. Sari Wahyuni</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backup Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Last Backup</p>
                      <p className="text-sm text-green-600">Today, 2:00 AM</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Backup Frequency</label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password Policy</label>
                    <Select defaultValue="strong">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weak">Basic</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="strong">Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Failed Login Attempts</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Lockout Duration (minutes)</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Audit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}