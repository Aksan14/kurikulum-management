"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InfoDasarTabProps } from "@/types/rps-form"

export function InfoDasarTab({
  formData,
  setFormData,
  mataKuliahList,
  selectedMK,
  isViewOnly = false
}: InfoDasarTabProps) {
  const handleChange = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    if (setFormData) {
      setFormData(prev => ({ ...prev, [key]: value }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Identitas Mata Kuliah */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas Mata Kuliah</CardTitle>
          <CardDescription>Informasi dasar mata kuliah</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mata_kuliah">Mata Kuliah *</Label>
              {isViewOnly ? (
                <Input 
                  value={selectedMK ? `${selectedMK.kode} - ${selectedMK.nama}` : '-'}
                  readOnly
                  className="bg-slate-50"
                />
              ) : (
                <Select
                  value={formData.mata_kuliah_id}
                  onValueChange={(value) => handleChange('mata_kuliah_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Mata Kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    {mataKuliahList.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id}>
                        {mk.kode} - {mk.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>SKS</Label>
              <Input value={selectedMK?.sks || "-"} readOnly className="bg-slate-50" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
              {isViewOnly ? (
                <Input value={formData.tahun_ajaran} readOnly className="bg-slate-50" />
              ) : (
                <Select
                  value={formData.tahun_ajaran}
                  onValueChange={(value) => handleChange('tahun_ajaran', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024">2023/2024</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester_type">Semester</Label>
              {isViewOnly ? (
                <Input 
                  value={formData.semester_type === 'ganjil' ? 'Ganjil' : 'Genap'} 
                  readOnly 
                  className="bg-slate-50" 
                />
              ) : (
                <Select
                  value={formData.semester_type}
                  onValueChange={(value) => handleChange('semester_type', value as 'ganjil' | 'genap')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ganjil">Ganjil</SelectItem>
                    <SelectItem value="genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fakultas">Fakultas</Label>
              <Input
                id="fakultas"
                value={formData.fakultas}
                onChange={(e) => handleChange('fakultas', e.target.value)}
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_studi">Program Studi</Label>
              <Input
                id="program_studi"
                value={formData.program_studi}
                onChange={(e) => handleChange('program_studi', e.target.value)}
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal_penyusunan">Tanggal Penyusunan</Label>
            <Input
              id="tanggal_penyusunan"
              type="date"
              value={formData.tanggal_penyusunan}
              onChange={(e) => handleChange('tanggal_penyusunan', e.target.value)}
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-slate-50" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Penyusun & Pengesahan */}
      <Card>
        <CardHeader>
          <CardTitle>Penyusun & Pengesahan</CardTitle>
          <CardDescription>Data penyusun dan pengesah RPS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="penyusun_nama">Nama Penyusun</Label>
              <Input
                id="penyusun_nama"
                value={formData.penyusun_nama}
                onChange={(e) => handleChange('penyusun_nama', e.target.value)}
                placeholder="Nama dosen penyusun"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penyusun_nidn">NIDN Penyusun</Label>
              <Input
                id="penyusun_nidn"
                value={formData.penyusun_nidn}
                onChange={(e) => handleChange('penyusun_nidn', e.target.value)}
                placeholder="NIDN"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="koordinator_rmk_nama">Koordinator RMK</Label>
              <Input
                id="koordinator_rmk_nama"
                value={formData.koordinator_rmk_nama}
                onChange={(e) => handleChange('koordinator_rmk_nama', e.target.value)}
                placeholder="Nama koordinator"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="koordinator_rmk_nidn">NIDN Koordinator</Label>
              <Input
                id="koordinator_rmk_nidn"
                value={formData.koordinator_rmk_nidn}
                onChange={(e) => handleChange('koordinator_rmk_nidn', e.target.value)}
                placeholder="NIDN"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kaprodi_nama">Ketua Program Studi</Label>
              <Input
                id="kaprodi_nama"
                value={formData.kaprodi_nama}
                onChange={(e) => handleChange('kaprodi_nama', e.target.value)}
                placeholder="Nama kaprodi"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kaprodi_nidn">NIDN Kaprodi</Label>
              <Input
                id="kaprodi_nidn"
                value={formData.kaprodi_nidn}
                onChange={(e) => handleChange('kaprodi_nidn', e.target.value)}
                placeholder="NIDN"
                readOnly={isViewOnly}
                className={isViewOnly ? "bg-slate-50" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deskripsi Mata Kuliah */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi Mata Kuliah</CardTitle>
          <CardDescription>Penjelasan singkat tentang mata kuliah</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deskripsi_mk">Deskripsi</Label>
            <Textarea
              id="deskripsi_mk"
              value={formData.deskripsi_mk}
              onChange={(e) => handleChange('deskripsi_mk', e.target.value)}
              rows={4}
              placeholder="Jelaskan deskripsi mata kuliah..."
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-slate-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capaian_pembelajaran">Capaian Pembelajaran</Label>
            <Textarea
              id="capaian_pembelajaran"
              value={formData.capaian_pembelajaran}
              onChange={(e) => handleChange('capaian_pembelajaran', e.target.value)}
              rows={4}
              placeholder="Jelaskan capaian pembelajaran..."
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-slate-50" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metode & Media */}
      <Card>
        <CardHeader>
          <CardTitle>Metode & Media Pembelajaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Metode Pembelajaran</Label>
            <div className="flex flex-wrap gap-2">
              {formData.metode_pembelajaran.map((metode, index) => (
                <Badge key={index} variant="outline">
                  {metode}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Media Pembelajaran</Label>
            <div className="flex flex-wrap gap-2">
              {formData.media_pembelajaran.map((media, index) => (
                <Badge key={index} variant="outline">
                  {media}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfoDasarTab
