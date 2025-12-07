"use client"

import React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import type { SubCPMK } from "@/lib/api/rps"

export interface RencanaTugasForm {
  id?: string
  nomor_tugas: number
  judul: string
  sub_cpmk_ids: string[]
  indikator_keberhasilan: string
  batas_waktu_minggu: number
  batas_waktu_tanggal: string
  petunjuk_pengerjaan: string
  jenis_tugas: 'individu' | 'kelompok'
  luaran_tugas: string
  kriteria_penilaian: string
  teknik_penilaian: string
  bobot: number
}

interface RencanaTugasFormProps {
  rencanaTugas: RencanaTugasForm[]
  setRencanaTugas: React.Dispatch<React.SetStateAction<RencanaTugasForm[]>>
  subCpmkList: SubCPMK[]
  formErrors?: Record<string, string>
}

export function RencanaTugasFormComponent({
  rencanaTugas,
  setRencanaTugas,
  subCpmkList,
  formErrors = {}
}: RencanaTugasFormProps) {
  
  const addRencanaTugas = () => {
    const nextNum = rencanaTugas.length + 1
    setRencanaTugas([...rencanaTugas, {
      nomor_tugas: nextNum,
      judul: `Tugas ${nextNum}`,
      sub_cpmk_ids: [],
      indikator_keberhasilan: "",
      batas_waktu_minggu: 4,
      batas_waktu_tanggal: "",
      petunjuk_pengerjaan: "",
      jenis_tugas: 'individu',
      luaran_tugas: "",
      kriteria_penilaian: "",
      teknik_penilaian: "Rubrik Penilaian",
      bobot: 10
    }])
  }

  const removeRencanaTugas = (index: number) => {
    setRencanaTugas(rencanaTugas.filter((_, i) => i !== index))
  }

  const updateRencanaTugas = (index: number, field: keyof RencanaTugasForm, value: string | number | string[]) => {
    const updated = [...rencanaTugas]
    updated[index] = { ...updated[index], [field]: value }
    setRencanaTugas(updated)
  }

  const totalBobot = rencanaTugas.reduce((sum, t) => sum + t.bobot, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rencana Tugas</CardTitle>
            <CardDescription>
              Definisikan tugas-tugas yang harus dikerjakan mahasiswa
              <br />
              <span className={totalBobot > 100 ? "text-red-500" : "text-slate-500"}>
                Total Bobot: {totalBobot}%
              </span>
            </CardDescription>
          </div>
          <Button onClick={addRencanaTugas}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tugas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formErrors.rencana_tugas && (
          <p className="text-sm text-red-500">{formErrors.rencana_tugas}</p>
        )}

        {rencanaTugas.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Belum ada rencana tugas. Klik tombol &quot;Tambah Tugas&quot; untuk menambahkan.
          </div>
        ) : (
          rencanaTugas.map((tugas, index) => (
            <Card key={index} className="bg-slate-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Tugas #{tugas.nomor_tugas}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeRencanaTugas(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Judul Tugas *</Label>
                    <Input
                      value={tugas.judul}
                      onChange={(e) => updateRencanaTugas(index, 'judul', e.target.value)}
                      placeholder="Judul tugas..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis Tugas</Label>
                    <Select
                      value={tugas.jenis_tugas}
                      onValueChange={(value: 'individu' | 'kelompok') => updateRencanaTugas(index, 'jenis_tugas', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individu">Individu</SelectItem>
                        <SelectItem value="kelompok">Kelompok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Batas Waktu (Minggu ke-)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={16}
                      value={tugas.batas_waktu_minggu}
                      onChange={(e) => updateRencanaTugas(index, 'batas_waktu_minggu', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bobot (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={tugas.bobot}
                      onChange={(e) => updateRencanaTugas(index, 'bobot', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {subCpmkList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub-CPMK Terkait</Label>
                    <div className="flex flex-wrap gap-2">
                      {subCpmkList.map(subCpmk => (
                        <Badge
                          key={subCpmk.id}
                          variant={tugas.sub_cpmk_ids.includes(subCpmk.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newIds = tugas.sub_cpmk_ids.includes(subCpmk.id)
                              ? tugas.sub_cpmk_ids.filter(id => id !== subCpmk.id)
                              : [...tugas.sub_cpmk_ids, subCpmk.id]
                            updateRencanaTugas(index, 'sub_cpmk_ids', newIds)
                          }}
                        >
                          {subCpmk.kode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Indikator Keberhasilan</Label>
                  <Textarea
                    value={tugas.indikator_keberhasilan}
                    onChange={(e) => updateRencanaTugas(index, 'indikator_keberhasilan', e.target.value)}
                    placeholder="Indikator keberhasilan tugas..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Petunjuk Pengerjaan</Label>
                  <Textarea
                    value={tugas.petunjuk_pengerjaan}
                    onChange={(e) => updateRencanaTugas(index, 'petunjuk_pengerjaan', e.target.value)}
                    placeholder="Petunjuk pengerjaan tugas..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Luaran Tugas</Label>
                    <Input
                      value={tugas.luaran_tugas}
                      onChange={(e) => updateRencanaTugas(index, 'luaran_tugas', e.target.value)}
                      placeholder="Contoh: Kode program + Laporan PDF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teknik Penilaian</Label>
                    <Input
                      value={tugas.teknik_penilaian}
                      onChange={(e) => updateRencanaTugas(index, 'teknik_penilaian', e.target.value)}
                      placeholder="Contoh: Rubrik Penilaian"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kriteria Penilaian</Label>
                  <Textarea
                    value={tugas.kriteria_penilaian}
                    onChange={(e) => updateRencanaTugas(index, 'kriteria_penilaian', e.target.value)}
                    placeholder="Kriteria penilaian tugas..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default RencanaTugasFormComponent
