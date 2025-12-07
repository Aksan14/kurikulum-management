"use client"

import React from "react"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export interface SkalaPenilaianForm {
  id?: string
  nilai_min: number
  nilai_max: number
  huruf_mutu: string
  bobot_nilai: number
  is_lulus: boolean
}

interface SkalaPenilaianFormProps {
  skalaPenilaian: SkalaPenilaianForm[]
  setSkalaPenilaian: React.Dispatch<React.SetStateAction<SkalaPenilaianForm[]>>
  formErrors?: Record<string, string>
}

// Default grading scale
const DEFAULT_SKALA_PENILAIAN: SkalaPenilaianForm[] = [
  { nilai_min: 85, nilai_max: 100, huruf_mutu: "A", bobot_nilai: 4.00, is_lulus: true },
  { nilai_min: 80, nilai_max: 84, huruf_mutu: "A-", bobot_nilai: 3.75, is_lulus: true },
  { nilai_min: 75, nilai_max: 79, huruf_mutu: "B+", bobot_nilai: 3.50, is_lulus: true },
  { nilai_min: 70, nilai_max: 74, huruf_mutu: "B", bobot_nilai: 3.00, is_lulus: true },
  { nilai_min: 65, nilai_max: 69, huruf_mutu: "B-", bobot_nilai: 2.75, is_lulus: true },
  { nilai_min: 60, nilai_max: 64, huruf_mutu: "C+", bobot_nilai: 2.50, is_lulus: true },
  { nilai_min: 55, nilai_max: 59, huruf_mutu: "C", bobot_nilai: 2.00, is_lulus: true },
  { nilai_min: 50, nilai_max: 54, huruf_mutu: "C-", bobot_nilai: 1.75, is_lulus: false },
  { nilai_min: 40, nilai_max: 49, huruf_mutu: "D", bobot_nilai: 1.00, is_lulus: false },
  { nilai_min: 0, nilai_max: 39, huruf_mutu: "E", bobot_nilai: 0.00, is_lulus: false }
]

export function SkalaPenilaianFormComponent({
  skalaPenilaian,
  setSkalaPenilaian,
  formErrors = {}
}: SkalaPenilaianFormProps) {

  const addSkalaPenilaian = () => {
    // Find available range gaps
    const sortedRanges = [...skalaPenilaian].sort((a, b) => a.nilai_min - b.nilai_min)
    let suggestedMin = 0
    let suggestedMax = 100

    // Find the first gap in ranges
    for (let i = 0; i < sortedRanges.length; i++) {
      const current = sortedRanges[i]
      if (suggestedMin < current.nilai_min) {
        suggestedMax = current.nilai_min - 1
        break
      }
      suggestedMin = Math.max(suggestedMin, current.nilai_max + 1)
    }

    // Ensure valid range
    if (suggestedMin >= suggestedMax) {
      suggestedMin = Math.max(0, Math.min(...skalaPenilaian.map(s => s.nilai_min)) - 10)
      suggestedMax = suggestedMin + 9
    }

    setSkalaPenilaian([...skalaPenilaian, {
      nilai_min: Math.max(0, suggestedMin),
      nilai_max: Math.min(100, suggestedMax),
      huruf_mutu: "",
      bobot_nilai: 0,
      is_lulus: false
    }])
  }

  const removeSkalaPenilaian = (index: number) => {
    setSkalaPenilaian(skalaPenilaian.filter((_, i) => i !== index))
  }

  const updateSkalaPenilaian = (index: number, field: keyof SkalaPenilaianForm, value: string | number | boolean) => {
    const updated = [...skalaPenilaian]
    updated[index] = { ...updated[index], [field]: value }
    setSkalaPenilaian(updated)
  }

  // Sort skala penilaian by nilai_min (descending for better display)
  const sortedSkalaPenilaian = [...skalaPenilaian].sort((a, b) => b.nilai_min - a.nilai_min)

  const loadDefaultSkala = () => {
    setSkalaPenilaian([...DEFAULT_SKALA_PENILAIAN])
  }

  // Validate ranges don't overlap (show warning only, don't prevent)
  const overlappingRanges = skalaPenilaian.filter((skala, index) => {
    return skalaPenilaian.some((other, otherIndex) => {
      if (index === otherIndex) return false
      return (skala.nilai_min <= other.nilai_max && skala.nilai_max >= other.nilai_min)
    })
  })

  const hasOverlap = overlappingRanges.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skala Penilaian</CardTitle>
            <CardDescription>
              Definisikan skala penilaian untuk mata kuliah ini
              {hasOverlap && (
                <span className="text-red-500 block">
                  ⚠️ Ada {overlappingRanges.length} rentang nilai yang overlap!
                  {overlappingRanges.length <= 2 && (
                    <span className="block text-xs mt-1">
                      Ranges: {overlappingRanges.map(r => `${r.huruf_mutu}(${r.nilai_min}-${r.nilai_max})`).join(', ')}
                    </span>
                  )}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDefaultSkala}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Gunakan Skala Default
            </Button>
            <Button onClick={addSkalaPenilaian}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Skala
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formErrors.skala_penilaian && (
          <p className="text-sm text-red-500">{formErrors.skala_penilaian}</p>
        )}

        {skalaPenilaian.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Belum ada skala penilaian.</p>
            <p className="text-sm mt-2">Klik &quot;Gunakan Skala Default&quot; untuk menggunakan skala standar, atau tambahkan manual.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border px-4 py-2 text-left">Nilai Min</th>
                  <th className="border px-4 py-2 text-left">Nilai Max</th>
                  <th className="border px-4 py-2 text-left">Huruf Mutu</th>
                  <th className="border px-4 py-2 text-left">Bobot</th>
                  <th className="border px-4 py-2 text-center">Lulus</th>
                  <th className="border px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedSkalaPenilaian.map((skala, sortedIndex) => {
                  // Find the original index for editing
                  const originalIndex = skalaPenilaian.findIndex(s => s === skala)
                  return (
                  <tr key={originalIndex} className={skala.is_lulus ? "bg-green-50" : "bg-red-50"}>
                    <td className="border px-2 py-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={skala.nilai_min}
                        onChange={(e) => updateSkalaPenilaian(originalIndex, 'nilai_min', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={skala.nilai_max}
                        onChange={(e) => updateSkalaPenilaian(originalIndex, 'nilai_max', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input
                        value={skala.huruf_mutu}
                        onChange={(e) => updateSkalaPenilaian(originalIndex, 'huruf_mutu', e.target.value)}
                        className="w-20"
                        placeholder="A/B/C"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input
                        type="number"
                        step="0.25"
                        min={0}
                        max={4}
                        value={skala.bobot_nilai}
                        onChange={(e) => updateSkalaPenilaian(originalIndex, 'bobot_nilai', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <Checkbox
                        checked={skala.is_lulus}
                        onCheckedChange={(checked) => updateSkalaPenilaian(originalIndex, 'is_lulus', checked === true)}
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {skalaPenilaian.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeSkalaPenilaian(originalIndex)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Preview */}
        {skalaPenilaian.length > 0 && (
          <div className="mt-4">
            <Label className="mb-2 block">Preview Skala Penilaian:</Label>
            <div className="flex flex-wrap gap-2">
              {sortedSkalaPenilaian.map((skala, index) => (
                <Badge
                  key={index}
                  variant={skala.is_lulus ? "default" : "danger"}
                >
                  {skala.huruf_mutu} ({skala.nilai_min}-{skala.nilai_max}) = {skala.bobot_nilai.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { DEFAULT_SKALA_PENILAIAN }
export default SkalaPenilaianFormComponent
