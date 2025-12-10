"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import type { RencanaTugasForm, SubCPMKForm, CPMKForm } from "@/types/rps-form";

interface RencanaTugasTabProps {
  rencanaTugasList: RencanaTugasForm[];
  subCpmkList: SubCPMKForm[];
  cpmkList?: CPMKForm[];
  isViewOnly?: boolean;
  onChange?: (
    index: number,
    field: keyof RencanaTugasForm,
    value: string | number
  ) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

const JENIS_TUGAS_OPTIONS = [
  { value: "individu", label: "Individu" },
  { value: "kelompok", label: "Kelompok" },
];

// Helper function untuk mendapatkan CPMK kode berdasarkan cpmk_id
function getCpmkKode(cpmkId: string, cpmkList?: CPMKForm[]): string {
  if (!cpmkList) return "";
  const cpmk = cpmkList.find(c => c.id === cpmkId);
  return cpmk?.kode || "";
}

export function RencanaTugasTab({
  rencanaTugasList,
  subCpmkList,
  cpmkList,
  isViewOnly = false,
  onChange,
  onAdd,
  onRemove,
}: RencanaTugasTabProps) {
  if (isViewOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rencana Tugas</h3>
          <Badge variant="outline">{rencanaTugasList.length} Tugas</Badge>
        </div>

        {rencanaTugasList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada rencana tugas yang ditambahkan
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rencanaTugasList
              .sort((a, b) => a.nomor_tugas - b.nomor_tugas)
              .map((tugas, index) => {
                const subCpmk = subCpmkList.find(
                  (s) => s.id === tugas.sub_cpmk_id
                );
                return (
                  <Card key={tugas.id || index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Tugas {tugas.nomor_tugas}
                          </Badge>
                          <Badge
                            variant={
                              tugas.jenis_tugas === "individu"
                                ? "outline"
                                : "info"
                            }
                          >
                            {tugas.jenis_tugas === "individu"
                              ? "Individu"
                              : "Kelompok"}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">
                          Bobot: {tugas.bobot}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Judul
                        </Label>
                        <p className="text-sm font-medium">{tugas.judul}</p>
                      </div>

                      {subCpmk && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Sub-CPMK Terkait
                          </Label>
                          <p className="text-sm">
                            <Badge variant="outline">{subCpmk.kode}</Badge>
                          </p>
                        </div>
                      )}

                      {tugas.indikator_keberhasilan && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Indikator Keberhasilan
                          </Label>
                          <p className="text-sm">
                            {tugas.indikator_keberhasilan}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Batas Waktu
                          </Label>
                          <p className="text-sm">
                            Minggu ke-{tugas.batas_waktu_minggu || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Teknik Penilaian
                          </Label>
                          <p className="text-sm">
                            {tugas.teknik_penilaian || "-"}
                          </p>
                        </div>
                      </div>

                      {tugas.petunjuk_pengerjaan && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Petunjuk Pengerjaan
                          </Label>
                          <p className="text-sm">{tugas.petunjuk_pengerjaan}</p>
                        </div>
                      )}

                      {tugas.luaran_tugas && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Luaran Tugas
                          </Label>
                          <p className="text-sm">{tugas.luaran_tugas}</p>
                        </div>
                      )}

                      {tugas.kriteria_penilaian && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Kriteria Penilaian
                          </Label>
                          <p className="text-sm">{tugas.kriteria_penilaian}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {rencanaTugasList.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Total Tugas: {rencanaTugasList.length}
            </span>
            <span className="text-sm font-medium">
              Total Bobot:{" "}
              {rencanaTugasList.reduce(
                (sum, item) => sum + (item.bobot || 0),
                0
              )}
              %
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rencana Tugas</h3>
          <p className="text-sm text-muted-foreground">
            Kelola rencana tugas mahasiswa
          </p>
        </div>
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tugas
        </Button>
      </div>

      {rencanaTugasList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Belum ada rencana tugas yang ditambahkan
            </p>
            <Button type="button" onClick={onAdd} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tugas Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rencanaTugasList.map((tugas, index) => (
            <Card key={tugas.id || index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tugas {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove?.(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-nomor-${index}`}>Nomor Tugas</Label>
                    <Input
                      id={`tugas-nomor-${index}`}
                      type="number"
                      min="1"
                      value={tugas.nomor_tugas}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "nomor_tugas",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-jenis-${index}`}>Jenis Tugas</Label>
                    <Select
                      value={tugas.jenis_tugas}
                      onValueChange={(value) =>
                        onChange?.(index, "jenis_tugas", value)
                      }
                    >
                      <SelectTrigger id={`tugas-jenis-${index}`}>
                        <SelectValue placeholder="Pilih Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {JENIS_TUGAS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-bobot-${index}`}>Bobot (%)</Label>
                    <Input
                      id={`tugas-bobot-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={tugas.bobot}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "bobot",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tugas-judul-${index}`}>Judul Tugas</Label>
                  <Input
                    id={`tugas-judul-${index}`}
                    value={tugas.judul}
                    onChange={(e) => onChange?.(index, "judul", e.target.value)}
                    placeholder="Judul tugas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-subcpmk-${index}`}>
                      Sub-CPMK Terkait
                    </Label>
                    <Select
                      value={tugas.sub_cpmk_id}
                      onValueChange={(value) =>
                        onChange?.(index, "sub_cpmk_id", value)
                      }
                    >
                      <SelectTrigger id={`tugas-subcpmk-${index}`}>
                        <SelectValue placeholder="Pilih Sub-CPMK" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCpmkList.map((subCpmk) => {
                          const cpmkKode = getCpmkKode(subCpmk.cpmk_id, cpmkList);
                          return (
                            <SelectItem
                              key={subCpmk.id || subCpmk.kode}
                              value={subCpmk.id || ""}
                            >
                              {cpmkKode ? `[${cpmkKode}] ` : ""}{subCpmk.kode} - {subCpmk.deskripsi?.substring(0, 30)}
                              {(subCpmk.deskripsi?.length || 0) > 30 ? "..." : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-batas-${index}`}>
                      Batas Waktu (Minggu ke-)
                    </Label>
                    <Input
                      id={`tugas-batas-${index}`}
                      type="number"
                      min="1"
                      max="16"
                      value={tugas.batas_waktu_minggu || ""}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "batas_waktu_minggu",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tugas-indikator-${index}`}>
                    Indikator Keberhasilan
                  </Label>
                  <Textarea
                    id={`tugas-indikator-${index}`}
                    value={tugas.indikator_keberhasilan || ""}
                    onChange={(e) =>
                      onChange?.(index, "indikator_keberhasilan", e.target.value)
                    }
                    placeholder="Indikator keberhasilan tugas"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tugas-petunjuk-${index}`}>
                    Petunjuk Pengerjaan
                  </Label>
                  <Textarea
                    id={`tugas-petunjuk-${index}`}
                    value={tugas.petunjuk_pengerjaan || ""}
                    onChange={(e) =>
                      onChange?.(index, "petunjuk_pengerjaan", e.target.value)
                    }
                    placeholder="Petunjuk pengerjaan tugas"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-luaran-${index}`}>Luaran Tugas</Label>
                    <Input
                      id={`tugas-luaran-${index}`}
                      value={tugas.luaran_tugas || ""}
                      onChange={(e) =>
                        onChange?.(index, "luaran_tugas", e.target.value)
                      }
                      placeholder="Contoh: Laporan, Presentasi, dll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tugas-teknik-${index}`}>
                      Teknik Penilaian
                    </Label>
                    <Input
                      id={`tugas-teknik-${index}`}
                      value={tugas.teknik_penilaian || ""}
                      onChange={(e) =>
                        onChange?.(index, "teknik_penilaian", e.target.value)
                      }
                      placeholder="Contoh: Rubrik, Checklist"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tugas-kriteria-${index}`}>
                    Kriteria Penilaian
                  </Label>
                  <Textarea
                    id={`tugas-kriteria-${index}`}
                    value={tugas.kriteria_penilaian || ""}
                    onChange={(e) =>
                      onChange?.(index, "kriteria_penilaian", e.target.value)
                    }
                    placeholder="Kriteria penilaian tugas"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tugas-rujukan-${index}`}>
                    Daftar Rujukan
                  </Label>
                  <Textarea
                    id={`tugas-rujukan-${index}`}
                    value={tugas.daftar_rujukan || ""}
                    onChange={(e) =>
                      onChange?.(index, "daftar_rujukan", e.target.value)
                    }
                    placeholder="Referensi terkait tugas"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rencanaTugasList.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Tugas: {rencanaTugasList.length}
          </span>
          <span className="text-sm font-medium">
            Total Bobot:{" "}
            {rencanaTugasList.reduce(
              (sum, item) => sum + (item.bobot || 0),
              0
            )}
            %
          </span>
        </div>
      )}
    </div>
  );
}
