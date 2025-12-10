"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, BookOpen, ExternalLink } from "lucide-react";
import type { BahanBacaanForm } from "@/types/rps-form";

interface PustakaTabProps {
  bahanBacaanList: BahanBacaanForm[];
  isViewOnly?: boolean;
  onChange?: (
    index: number,
    field: keyof BahanBacaanForm,
    value: string | number | boolean
  ) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

const JENIS_BAHAN_OPTIONS = [
  { value: "buku", label: "Buku" },
  { value: "jurnal", label: "Jurnal" },
  { value: "artikel", label: "Artikel" },
  { value: "website", label: "Website" },
  { value: "modul", label: "Modul" },
];

export function PustakaTab({
  bahanBacaanList,
  isViewOnly = false,
  onChange,
  onAdd,
  onRemove,
}: PustakaTabProps) {
  // Pisahkan bahan wajib dan tambahan
  const bahanWajib = bahanBacaanList.filter((b) => b.is_wajib);
  const bahanTambahan = bahanBacaanList.filter((b) => !b.is_wajib);

  if (isViewOnly) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bahan Bacaan / Pustaka</h3>
          <Badge variant="outline">{bahanBacaanList.length} Referensi</Badge>
        </div>

        {bahanBacaanList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada bahan bacaan yang ditambahkan
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Bahan Wajib */}
            {bahanWajib.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Bahan Bacaan Wajib
                </h4>
                <div className="space-y-3">
                  {bahanWajib.map((bahan, index) => (
                    <Card key={bahan.id || `wajib-${index}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="default">
                                {bahan.jenis || "buku"}
                              </Badge>
                              {bahan.tahun && (
                                <span className="text-xs text-muted-foreground">
                                  ({bahan.tahun})
                                </span>
                              )}
                            </div>
                            <p className="font-medium">{bahan.judul}</p>
                            {bahan.penulis && (
                              <p className="text-sm text-muted-foreground">
                                {bahan.penulis}
                              </p>
                            )}
                            {bahan.penerbit && (
                              <p className="text-sm text-muted-foreground">
                                Penerbit: {bahan.penerbit}
                              </p>
                            )}
                            {bahan.isbn && (
                              <p className="text-xs text-muted-foreground">
                                ISBN: {bahan.isbn}
                              </p>
                            )}
                          </div>
                          {bahan.url && (
                            <a
                              href={bahan.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Bahan Tambahan */}
            {bahanTambahan.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Bahan Bacaan Tambahan
                </h4>
                <div className="space-y-3">
                  {bahanTambahan.map((bahan, index) => (
                    <Card key={bahan.id || `tambahan-${index}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {bahan.jenis || "buku"}
                              </Badge>
                              {bahan.tahun && (
                                <span className="text-xs text-muted-foreground">
                                  ({bahan.tahun})
                                </span>
                              )}
                            </div>
                            <p className="font-medium">{bahan.judul}</p>
                            {bahan.penulis && (
                              <p className="text-sm text-muted-foreground">
                                {bahan.penulis}
                              </p>
                            )}
                            {bahan.penerbit && (
                              <p className="text-sm text-muted-foreground">
                                Penerbit: {bahan.penerbit}
                              </p>
                            )}
                          </div>
                          {bahan.url && (
                            <a
                              href={bahan.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bahan Bacaan / Pustaka</h3>
          <p className="text-sm text-muted-foreground">
            Kelola referensi dan bahan bacaan
          </p>
        </div>
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Referensi
        </Button>
      </div>

      {bahanBacaanList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Belum ada bahan bacaan yang ditambahkan
            </p>
            <Button type="button" onClick={onAdd} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Referensi Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bahanBacaanList.map((bahan, index) => (
            <Card key={bahan.id || index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    Referensi {index + 1}
                    {bahan.is_wajib && (
                      <Badge variant="default" className="text-xs">
                        Wajib
                      </Badge>
                    )}
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
                <div className="space-y-2">
                  <Label htmlFor={`bahan-judul-${index}`}>Judul</Label>
                  <Input
                    id={`bahan-judul-${index}`}
                    value={bahan.judul}
                    onChange={(e) => onChange?.(index, "judul", e.target.value)}
                    placeholder="Judul buku/artikel/jurnal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-penulis-${index}`}>Penulis</Label>
                    <Input
                      id={`bahan-penulis-${index}`}
                      value={bahan.penulis || ""}
                      onChange={(e) =>
                        onChange?.(index, "penulis", e.target.value)
                      }
                      placeholder="Nama penulis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-tahun-${index}`}>Tahun</Label>
                    <Input
                      id={`bahan-tahun-${index}`}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={bahan.tahun || ""}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "tahun",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Tahun terbit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-jenis-${index}`}>Jenis</Label>
                    <Select
                      value={bahan.jenis || "buku"}
                      onValueChange={(value) =>
                        onChange?.(index, "jenis", value)
                      }
                    >
                      <SelectTrigger id={`bahan-jenis-${index}`}>
                        <SelectValue placeholder="Pilih Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {JENIS_BAHAN_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-penerbit-${index}`}>Penerbit</Label>
                    <Input
                      id={`bahan-penerbit-${index}`}
                      value={bahan.penerbit || ""}
                      onChange={(e) =>
                        onChange?.(index, "penerbit", e.target.value)
                      }
                      placeholder="Nama penerbit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-isbn-${index}`}>ISBN</Label>
                    <Input
                      id={`bahan-isbn-${index}`}
                      value={bahan.isbn || ""}
                      onChange={(e) =>
                        onChange?.(index, "isbn", e.target.value)
                      }
                      placeholder="Nomor ISBN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`bahan-halaman-${index}`}>Halaman</Label>
                    <Input
                      id={`bahan-halaman-${index}`}
                      value={bahan.halaman || ""}
                      onChange={(e) =>
                        onChange?.(index, "halaman", e.target.value)
                      }
                      placeholder="Contoh: 1-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`bahan-url-${index}`}>URL</Label>
                  <Input
                    id={`bahan-url-${index}`}
                    type="url"
                    value={bahan.url || ""}
                    onChange={(e) => onChange?.(index, "url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`bahan-wajib-${index}`}
                    checked={bahan.is_wajib}
                    onCheckedChange={(checked) =>
                      onChange?.(index, "is_wajib", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`bahan-wajib-${index}`}
                    className="text-sm font-normal"
                  >
                    Bahan bacaan wajib
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bahanBacaanList.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Referensi: {bahanBacaanList.length}
          </span>
          <div className="flex gap-4 text-sm">
            <span>Wajib: {bahanWajib.length}</span>
            <span>Tambahan: {bahanTambahan.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
