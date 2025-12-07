"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { fileService, UploadedFile } from '@/lib/api'

interface FileUploadProps {
  onUpload?: (file: UploadedFile) => void
  onRemove?: (file: UploadedFile) => void
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  className?: string
  disabled?: boolean
  showPreview?: boolean
  initialFiles?: UploadedFile[]
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  uploadedFile?: UploadedFile
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = "*/*",
  maxSize = 10, // 10MB default
  multiple = false,
  className,
  disabled = false,
  showPreview = true,
  initialFiles = []
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File terlalu besar. Maksimal ${maxSize}MB`
    }

    // Check file type if accept is specified
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'))
        }
        return file.type === type
      })
      if (!isValid) {
        return `Tipe file tidak didukung. Gunakan: ${accept}`
      }
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const uploadId = Date.now().toString()
    
    // Add to uploading list
    setUploadingFiles(prev => [...prev, {
      file,
      progress: 0,
      status: 'uploading'
    }])

    try {
      // Simulate progress (since fileService doesn't provide progress callback)
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(f => 
          f.file === file && f.status === 'uploading'
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ))
      }, 200)

      const response = await fileService.upload(file)
      
      clearInterval(progressInterval)

      if (response.data) {
        setUploadingFiles(prev => prev.map(f => 
          f.file === file
            ? { ...f, progress: 100, status: 'success', uploadedFile: response.data }
            : f
        ))

        setUploadedFiles(prev => [...prev, response.data!])
        onUpload?.(response.data)

        // Remove from uploading list after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.file !== file))
        }, 1500)
      }
    } catch (error) {
      setUploadingFiles(prev => prev.map(f => 
        f.file === file
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload gagal' }
          : f
      ))
    }
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || disabled) return

    const fileArray = Array.from(files)
    const filesToUpload = multiple ? fileArray : [fileArray[0]]

    filesToUpload.forEach(file => {
      const error = validateFile(file)
      if (error) {
        setUploadingFiles(prev => [...prev, {
          file,
          progress: 0,
          status: 'error',
          error
        }])
        return
      }
      uploadFile(file)
    })
  }, [disabled, multiple, maxSize, accept])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemoveFile = async (file: UploadedFile) => {
    try {
      if (file.file_path) {
        await fileService.delete(file.file_path)
      }
      setUploadedFiles(prev => prev.filter(f => f.url !== file.url))
      onRemove?.(file)
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const handleRemoveUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-700">
          Drag & drop file di sini atau <span className="text-blue-600">browse</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {accept !== "*/*" ? `Format: ${accept}` : "Semua format didukung"} • Max {maxSize}MB
        </p>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => {
            const FileIcon = getFileIcon(uploadingFile.file.type)
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'uploading' ? (
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  ) : uploadingFile.status === 'success' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="h-1 mt-1" />
                  )}
                  {uploadingFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                  )}
                </div>
                {uploadingFile.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUploadingFile(uploadingFile.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Uploaded Files */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">File yang diupload:</p>
          {uploadedFiles.map((file, index) => {
            const FileIcon = getFileIcon(file.mime_type || file.file_type)
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0">
                  <FileIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.original_name || file.filename || 'File'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.file_size || file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      Lihat
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUpload
