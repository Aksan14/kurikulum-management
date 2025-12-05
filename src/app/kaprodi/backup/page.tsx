"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Database,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  HardDrive,
  Shield,
  Calendar,
  FileText,
  Archive,
  Trash2,
  Settings,
  History,
  CloudDownload,
  CloudUpload,
  Server,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Info
} from 'lucide-react'


interface BackupItem {
  id: string
  name: string
  type: 'full' | 'rps' | 'users' | 'system'
  size: string
  date: string
  status: 'completed' | 'failed' | 'in_progress'
  description: string
  downloadUrl?: string
}

const mockBackups: BackupItem[] = [
  {
    id: 'backup-1',
    name: 'Full System Backup - 2024-01-15',
    type: 'full',
    size: '2.4 GB',
    date: '2024-01-15 03:00:00',
    status: 'completed',
    description: 'Backup lengkap sistem termasuk RPS, user data, dan konfigurasi',
    downloadUrl: '#'
  },
  {
    id: 'backup-2',
    name: 'RPS Data Backup - 2024-01-14',
    type: 'rps',
    size: '156 MB',
    date: '2024-01-14 14:30:00',
    status: 'completed',
    description: 'Backup data RPS dan dokumen terkait',
    downloadUrl: '#'
  },
  {
    id: 'backup-3',
    name: 'User Management Backup - 2024-01-13',
    type: 'users',
    size: '45 MB',
    date: '2024-01-13 09:15:00',
    status: 'completed',
    description: 'Backup data pengguna, roles, dan permissions',
    downloadUrl: '#'
  },
  {
    id: 'backup-4',
    name: 'System Configuration - 2024-01-12',
    type: 'system',
    size: '12 MB',
    date: '2024-01-12 18:45:00',
    status: 'failed',
    description: 'Backup konfigurasi sistem dan pengaturan aplikasi'
  },
  {
    id: 'backup-5',
    name: 'Full System Backup - 2024-01-10',
    type: 'full',
    size: '2.3 GB',
    date: '2024-01-10 03:00:00',
    status: 'completed',
    description: 'Backup lengkap sistem mingguan',
    downloadUrl: '#'
  }
]

export default function BackupRestorePage() {
  const [backups, setBackups] = useState<BackupItem[]>(mockBackups)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'rps' | 'users' | 'system'>('full')
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [showEncryptionKey, setShowEncryptionKey] = useState(false)

  const startBackup = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    // Simulate backup progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setBackupProgress(i)
    }

    // Add new backup to list
    const newBackup: BackupItem = {
      id: `backup-${Date.now()}`,
      name: `${getBackupTypeName(selectedBackupType)} - ${new Date().toISOString().split('T')[0]}`,
      type: selectedBackupType,
      size: getEstimatedSize(selectedBackupType),
      date: new Date().toISOString(),
      status: 'completed',
      description: getBackupDescription(selectedBackupType),
      downloadUrl: '#'
    }

    setBackups(prev => [newBackup, ...prev])
    setIsBackingUp(false)
    setBackupProgress(0)
    alert('Backup berhasil dibuat!')
  }

  const startRestore = async (backupId: string) => {
    if (!confirm('Apakah Anda yakin ingin melakukan restore? Proses ini akan mengganti data yang ada.')) {
      return
    }

    setIsRestoring(true)
    setRestoreProgress(0)

    // Simulate restore progress
    for (let i = 0; i <= 100; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 150))
      setRestoreProgress(i)
    }

    setIsRestoring(false)
    setRestoreProgress(0)
    alert('Restore berhasil dilakukan!')
  }

  const deleteBackup = (backupId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus backup ini?')) {
      setBackups(prev => prev.filter(b => b.id !== backupId))
    }
  }

  const getBackupTypeName = (type: string) => {
    switch (type) {
      case 'full': return 'Full System Backup'
      case 'rps': return 'RPS Data Backup'
      case 'users': return 'User Management Backup'
      case 'system': return 'System Configuration Backup'
      default: return 'Backup'
    }
  }

  const getEstimatedSize = (type: string) => {
    switch (type) {
      case 'full': return '2.5 GB'
      case 'rps': return '160 MB'
      case 'users': return '50 MB'
      case 'system': return '15 MB'
      default: return 'Unknown'
    }
  }

  const getBackupDescription = (type: string) => {
    switch (type) {
      case 'full': return 'Backup lengkap sistem termasuk semua data dan konfigurasi'
      case 'rps': return 'Backup data RPS dan dokumen terkait'
      case 'users': return 'Backup data pengguna, roles, dan permissions'
      case 'system': return 'Backup konfigurasi sistem dan pengaturan aplikasi'
      default: return 'Backup data sistem'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Gagal</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Proses</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Database className="h-4 w-4 text-blue-600" />
      case 'rps':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'users':
        return <Shield className="h-4 w-4 text-purple-600" />
      case 'system':
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return <Archive className="h-4 w-4 text-gray-600" />
    }
  }

  const totalBackupSize = backups.reduce((total, backup) => {
    const size = parseFloat(backup.size.split(' ')[0])
    const unit = backup.size.split(' ')[1]
    if (unit === 'GB') return total + (size * 1024)
    if (unit === 'MB') return total + size
    return total
  }, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Backup & Restore</h1>
            <p className="text-slate-600">
              Kelola backup data sistem dan pemulihan data
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HardDrive className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{backups.length}</p>
                  <p className="text-sm text-slate-600">Total Backups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {backups.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-slate-600">Berhasil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Server className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalBackupSize.toFixed(1)} MB</p>
                  <p className="text-sm text-slate-600">Total Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudDownload className="h-5 w-5 text-blue-600" />
              Buat Backup Baru
            </CardTitle>
            <CardDescription>
              Pilih jenis data yang akan di-backup
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-type">Jenis Backup</Label>
                    <select
                      id="backup-type"
                      value={selectedBackupType}
                      onChange={(e) => setSelectedBackupType(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full">Full System Backup (~2.5 GB)</option>
                      <option value="rps">RPS Data Only (~160 MB)</option>
                      <option value="users">User Management (~50 MB)</option>
                      <option value="system">System Config (~15 MB)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-slate-900 mb-1">
                          {getBackupTypeName(selectedBackupType)}
                        </p>
                        <p className="text-slate-600">
                          {getBackupDescription(selectedBackupType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Pengaturan Backup</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Auto Backup</p>
                          <p className="text-sm text-slate-600">Backup otomatis setiap minggu</p>
                        </div>
                        <button
                          onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                          className={`
                            relative w-11 h-6 rounded-full transition-colors
                            ${autoBackupEnabled ? "bg-blue-600" : "bg-slate-200"}
                          `}
                        >
                          <span
                            className={`
                              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                              ${autoBackupEnabled ? "translate-x-5" : "translate-x-0"}
                            `}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Enkripsi</p>
                          <p className="text-sm text-slate-600">Enkripsi backup dengan password</p>
                        </div>
                        <button
                          onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                          className={`
                            relative w-11 h-6 rounded-full transition-colors
                            ${encryptionEnabled ? "bg-green-600" : "bg-slate-200"}
                          `}
                        >
                          <span
                            className={`
                              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                              ${encryptionEnabled ? "translate-x-5" : "translate-x-0"}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup Progress */}
              {isBackingUp && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    <p className="font-medium text-blue-900">
                      Membuat backup... {backupProgress}%
                    </p>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              )}

              {/* Restore Progress */}
              {isRestoring && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CloudUpload className="h-5 w-5 text-green-600 animate-pulse" />
                    <p className="font-medium text-green-900">
                      Melakukan restore... {restoreProgress}%
                    </p>
                  </div>
                  <Progress value={restoreProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={startBackup} 
                  disabled={isBackingUp || isRestoring}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isBackingUp ? 'Membuat Backup...' : 'Mulai Backup'}
                </Button>
                
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Jadwalkan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-green-600" />
              Riwayat Backup
            </CardTitle>
            <CardDescription>
              Daftar backup yang telah dibuat
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Backup</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Jenis</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Tanggal</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {getTypeIcon(backup.type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{backup.name}</p>
                            <p className="text-sm text-slate-600">{backup.description}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {backup.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{backup.size}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-900">
                            {new Date(backup.date).toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-slate-600">
                            {new Date(backup.date).toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(backup.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {backup.downloadUrl && backup.status === 'completed' && (
                            <Button size="sm" variant="outline" title="Download backup">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {backup.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startRestore(backup.id)}
                              disabled={isRestoring || isBackingUp}
                              title="Restore dari backup ini"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus backup"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Upload Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-purple-600" />
              Upload & Restore
            </CardTitle>
            <CardDescription>
              Upload file backup untuk di-restore
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">
                  Drop file backup di sini
                </p>
                <p className="text-slate-600 mb-4">
                  atau klik untuk pilih file
                </p>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Pilih File
                    <input type="file" accept=".zip,.sql,.bak" className="hidden" />
                  </label>
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Format yang didukung: .zip, .sql, .bak (maksimal 5GB)
                </p>
              </div>

              {encryptionEnabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 mb-2">
                        Password Enkripsi
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type={showEncryptionKey ? 'text' : 'password'}
                          placeholder="Masukkan password dekripsi"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                        >
                          {showEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}