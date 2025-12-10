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
import { Plus, Trash2, GraduationCap, Clock } from "lucide-react";
import type { RencanaPembelajaranForm, SubCPMKForm } from "@/types/rps-form";

interface RencanaPembelajaranTabProps {
  rencanaPembelajaranList: RencanaPembelajaranForm[];
  subCpmkList: SubCPMKForm[];
  isViewOnly?: boolean;
  onChange?: (
    index: number,
    field: keyof RencanaPembelajaranForm,
    value: string | number | string[]
  ) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

const METODE_PEMBELAJARAN_OPTIONS = [
  "Ceramah",
  "Diskusi",
  "Praktikum",
  "Presentasi",
  "Studi Kasus",
  "Project Based Learning",
  "Problem Based Learning",
  "Collaborative Learning",
  "E-Learning",
  "Demonstrasi",
  "Tugas Mandiri",
  "Seminar",
];

export function RencanaPembelajaranTab({
  rencanaPembelajaranList,
  subCpmkList,
  isViewOnly = false,
  onChange,
  onAdd,
  onRemove,
}: RencanaPembelajaranTabProps) {
  // Helper untuk menampilkan sub topik
  const formatSubTopik = (subTopik: string[] | undefined) => {
    if (!subTopik || subTopik.length === 0) return "-";
    return subTopik.join(", ");
  };

  if (isViewOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rencana Pembelajaran</h3>
          <Badge variant="outline">
            {rencanaPembelajaranList.length} Pertemuan
          </Badge>
        </div>

        {rencanaPembelajaranList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada rencana pembelajaran yang ditambahkan
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rencanaPembelajaranList
              .sort((a, b) => a.minggu_ke - b.minggu_ke)
              .map((rencana, index) => {
                const subCpmk = subCpmkList.find(
                  (s) => s.id === rencana.sub_cpmk_id
                );
                return (
                  <Card key={rencana.id || index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Minggu {rencana.minggu_ke}
                          </Badge>
                          {subCpmk && (
                            <Badge variant="outline">{subCpmk.kode}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {rencana.waktu_menit} menit
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Topik
                        </Label>
                        <p className="text-sm font-medium">{rencana.topik}</p>
                      </div>
                      {rencana.sub_topik && rencana.sub_topik.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Sub Topik
                          </Label>
                          <p className="text-sm">
                            {formatSubTopik(rencana.sub_topik)}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Metode
                          </Label>
                          <p className="text-sm">
                            {rencana.metode_pembelajaran}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Teknik/Kriteria
                          </Label>
                          <p className="text-sm">
                            {rencana.teknik_kriteria || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Bobot
                          </Label>
                          <p className="text-sm font-medium">
                            {rencana.bobot_persen}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {rencanaPembelajaranList.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Total Pertemuan: {rencanaPembelajaranList.length}
            </span>
            <span className="text-sm font-medium">
              Total Bobot:{" "}
              {rencanaPembelajaranList.reduce(
                (sum, item) => sum + (item.bobot_persen || 0),
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
          <h3 className="text-lg font-semibold">Rencana Pembelajaran</h3>
          <p className="text-sm text-muted-foreground">
            Kelola rencana pembelajaran mingguan
          </p>
        </div>
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pertemuan
        </Button>
      </div>

      {rencanaPembelajaranList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Belum ada rencana pembelajaran yang ditambahkan
            </p>
            <Button type="button" onClick={onAdd} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pertemuan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rencanaPembelajaranList.map((rencana, index) => (
            <Card key={rencana.id || index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Pertemuan {index + 1}
                  </CardTitle>
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
                    <Label htmlFor={`rencana-minggu-${index}`}>Minggu Ke</Label>
                    <Input
                      id={`rencana-minggu-${index}`}
                      type="number"
                      min="1"
                      max="16"
                      value={rencana.minggu_ke}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "minggu_ke",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rencana-waktu-${index}`}>
                      Waktu (menit)
                    </Label>
                    <Input
                      id={`rencana-waktu-${index}`}
                      type="number"
                      min="0"
                      value={rencana.waktu_menit}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "waktu_menit",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rencana-bobot-${index}`}>Bobot (%)</Label>
                    <Input
                      id={`rencana-bobot-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={rencana.bobot_persen}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "bobot_persen",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`rencana-subcpmk-${index}`}>
                      Sub-CPMK Terkait
                    </Label>
                    <Select
                      value={rencana.sub_cpmk_id}
                      onValueChange={(value) =>
                        onChange?.(index, "sub_cpmk_id", value)
                      }
                    >
                      <SelectTrigger id={`rencana-subcpmk-${index}`}>
                        <SelectValue placeholder="Pilih Sub-CPMK" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCpmkList.map((subCpmk) => (
                          <SelectItem
                            key={subCpmk.id || subCpmk.kode}
                            value={subCpmk.id || ""}
                          >
                            {subCpmk.kode} - {subCpmk.deskripsi?.substring(0, 40)}
                            {(subCpmk.deskripsi?.length || 0) > 40 ? "..." : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rencana-metode-${index}`}>
                      Metode Pembelajaran
                    </Label>
                    <Select
                      value={rencana.metode_pembelajaran}
                      onValueChange={(value) =>
                        onChange?.(index, "metode_pembelajaran", value)
                      }
                    >
                      <SelectTrigger id={`rencana-metode-${index}`}>
                        <SelectValue placeholder="Pilih Metode" />
                      </SelectTrigger>
                      <SelectContent>
                        {METODE_PEMBELAJARAN_OPTIONS.map((metode) => (
                          <SelectItem key={metode} value={metode}>
                            {metode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rencana-topik-${index}`}>Topik</Label>
                  <Input
                    id={`rencana-topik-${index}`}
                    value={rencana.topik}
                    onChange={(e) =>
                      onChange?.(index, "topik", e.target.value)
                    }
                    placeholder="Topik pembelajaran"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rencana-subtopik-${index}`}>
                    Sub Topik (pisahkan dengan koma)
                  </Label>
                  <Textarea
                    id={`rencana-subtopik-${index}`}
                    value={rencana.sub_topik?.join(", ") || ""}
                    onChange={(e) =>
                      onChange?.(
                        index,
                        "sub_topik",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    placeholder="Sub topik 1, Sub topik 2, ..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rencana-teknik-${index}`}>
                    Teknik/Kriteria Penilaian
                  </Label>
                  <Textarea
                    id={`rencana-teknik-${index}`}
                    value={rencana.teknik_kriteria}
                    onChange={(e) =>
                      onChange?.(index, "teknik_kriteria", e.target.value)
                    }
                    placeholder="Teknik dan kriteria penilaian"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rencanaPembelajaranList.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Pertemuan: {rencanaPembelajaranList.length}
          </span>
          <span className="text-sm font-medium">
            Total Bobot:{" "}
            {rencanaPembelajaranList.reduce(
              (sum, item) => sum + (item.bobot_persen || 0),
              0
            )}
            %
          </span>
        </div>
      )}
    </div>
  );
}
