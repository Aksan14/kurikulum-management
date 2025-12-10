import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { RPS, CPMK, RencanaPembelajaran, RencanaTugas, BahanBacaan, SubCPMK } from './api/rps';
import type { MataKuliah } from './api/mata-kuliah';
import type { CPL } from './api/cpl';

// Interface untuk data RPS yang akan diisi ke template
export interface RPSDocumentData {
  // Info Dasar
  perguruan_tinggi: string;
  fakultas: string;
  program_studi: string;
  nama_mata_kuliah: string;
  kode_mk: string;
  rumpun_mk: string;
  sks_teori: number;
  sks_praktikum: number;
  semester: string;
  tanggal_penyusunan: string;
  
  // Penyusun
  penyusun_nama: string;
  penyusun_nidn: string;
  koordinator_rmk_nama: string;
  koordinator_rmk_nidn: string;
  kaprodi_nama: string;
  kaprodi_nidn: string;
  
  // Deskripsi
  deskripsi_mk: string;
  capaian_pembelajaran: string;
  
  // CPL yang dibebankan
  cpl_list: Array<{
    kode: string;
    deskripsi: string;
  }>;
  
  // CPMK
  cpmk_list: Array<{
    kode: string;
    deskripsi: string;
    cpl_codes: string;
  }>;
  
  // Sub-CPMK
  sub_cpmk_list: Array<{
    kode: string;
    deskripsi: string;
    cpmk_kode: string;
  }>;
  
  // Korelasi Sub-CPMK dan CPMK (untuk tabel)
  korelasi_matrix: Array<{
    sub_cpmk_kode: string;
    cpmk_correlations: string[]; // Array of 'v' or '' for each CPMK
  }>;
  
  // Bahan Kajian / Topik
  topik_list: Array<{
    nomor: number;
    topik: string;
  }>;
  
  // Referensi / Pustaka
  referensi_list: Array<{
    nomor: number;
    referensi: string;
    is_wajib: boolean;
  }>;
  
  // Dosen
  dosen_nama: string;
  mata_kuliah_prasyarat: string;
  
  // Rencana Pembelajaran
  rencana_pembelajaran: Array<{
    minggu: string;
    sub_cpmk: string;
    indikator: string;
    topik_materi: string;
    metode_pembelajaran: string;
    waktu: string;
    teknik_kriteria: string;
    bobot: number;
  }>;
  
  // Rencana Tugas
  rencana_tugas: Array<{
    nomor: number;
    judul: string;
    sub_cpmk: string;
    indikator: string;
    batas_waktu: string;
    petunjuk: string;
    luaran: string;
    kriteria: string;
    teknik_penilaian: string;
    bobot: number;
    daftar_rujukan: string;
  }>;
  
  // Metode & Media Pembelajaran
  metode_pembelajaran: string[];
  media_pembelajaran: string[];
}

/**
 * Transform data RPS dari API ke format yang siap diisi ke template
 */
export function transformRPSToDocumentData(
  rps: RPS,
  mataKuliah: MataKuliah | null,
  cplList: CPL[],
  cpmkList: CPMK[],
  subCpmkMap: Map<string, SubCPMK[]>,
  rencanaPembelajaran: RencanaPembelajaran[],
  rencanaTugas: RencanaTugas[],
  bahanBacaan: BahanBacaan[]
): RPSDocumentData {
  // Get CPL yang dibebankan pada mata kuliah ini
  const assignedCPLIds = cpmkList.flatMap(cpmk => cpmk.cpl_ids || []);
  const uniqueCPLIds = [...new Set(assignedCPLIds)];
  const assignedCPLs = cplList.filter(cpl => uniqueCPLIds.includes(cpl.id));
  
  // Build Sub-CPMK list with CPMK reference
  const subCpmkList: RPSDocumentData['sub_cpmk_list'] = [];
  cpmkList.forEach(cpmk => {
    const subCpmks = subCpmkMap.get(cpmk.id) || [];
    subCpmks.forEach(subCpmk => {
      subCpmkList.push({
        kode: subCpmk.kode,
        deskripsi: subCpmk.deskripsi,
        cpmk_kode: cpmk.kode
      });
    });
  });
  
  // Build correlation matrix
  const korelasiMatrix: RPSDocumentData['korelasi_matrix'] = [];
  subCpmkList.forEach(subCpmk => {
    const correlations = cpmkList.map(cpmk => 
      subCpmk.cpmk_kode === cpmk.kode ? 'v' : ''
    );
    korelasiMatrix.push({
      sub_cpmk_kode: subCpmk.kode,
      cpmk_correlations: correlations
    });
  });
  
  // Extract unique topics from rencana pembelajaran
  const topikSet = new Set<string>();
  rencanaPembelajaran.forEach(rp => {
    if (rp.topik) topikSet.add(rp.topik);
  });
  const topikList = Array.from(topikSet).map((topik, idx) => ({
    nomor: idx + 1,
    topik
  }));
  
  // Transform referensi
  const referensiList = bahanBacaan.map((bahan, idx) => {
    let referensi = bahan.judul;
    if (bahan.penulis) referensi = `${bahan.penulis}. ${referensi}`;
    if (bahan.tahun) referensi += ` (${bahan.tahun})`;
    if (bahan.penerbit) referensi += `. ${bahan.penerbit}`;
    return {
      nomor: idx + 1,
      referensi,
      is_wajib: bahan.is_wajib || false
    };
  });
  
  // Transform rencana pembelajaran
  const rencanaPembelajaranData = rencanaPembelajaran.map(rp => {
    const subCpmk = rp.sub_cpmk;
    return {
      minggu: String(rp.minggu_ke),
      sub_cpmk: subCpmk ? `${subCpmk.kode}: ${subCpmk.deskripsi}` : '-',
      indikator: rp.teknik_kriteria || '-',
      topik_materi: rp.topik + (rp.sub_topik?.length ? '\n' + rp.sub_topik.join('\n') : ''),
      metode_pembelajaran: rp.metode_pembelajaran || '-',
      waktu: `${rp.waktu_menit} menit`,
      teknik_kriteria: rp.teknik_kriteria || '-',
      bobot: rp.bobot_persen || 0
    };
  });
  
  // Transform rencana tugas
  const rencanaTugasData = rencanaTugas.map(tugas => {
    const subCpmk = tugas.sub_cpmk;
    return {
      nomor: tugas.nomor_tugas,
      judul: tugas.judul,
      sub_cpmk: subCpmk ? `${subCpmk.kode}: ${subCpmk.deskripsi}` : '-',
      indikator: tugas.indikator_keberhasilan || '-',
      batas_waktu: tugas.batas_waktu_minggu ? `Minggu ke-${tugas.batas_waktu_minggu}` : '-',
      petunjuk: tugas.petunjuk_pengerjaan || '-',
      luaran: tugas.luaran_tugas || '-',
      kriteria: tugas.kriteria_penilaian || '-',
      teknik_penilaian: tugas.teknik_penilaian || '-',
      bobot: tugas.bobot || 0,
      daftar_rujukan: Array.isArray(tugas.daftar_rujukan) 
        ? tugas.daftar_rujukan.join('\n') 
        : (tugas.daftar_rujukan || '-')
    };
  });
  
  return {
    // Info Dasar
    perguruan_tinggi: 'Universitas XYZ', // Bisa diambil dari config
    fakultas: rps.fakultas || 'Fakultas',
    program_studi: rps.program_studi || 'Program Studi',
    nama_mata_kuliah: mataKuliah?.nama || '-',
    kode_mk: mataKuliah?.kode || '-',
    rumpun_mk: '-', // MataKuliah doesn't have rumpun_mk
    sks_teori: mataKuliah?.sks || 0,
    sks_praktikum: 0, // MataKuliah doesn't separate sks
    semester: `${rps.semester_type === 'ganjil' ? 'Ganjil' : 'Genap'} ${rps.tahun_ajaran}`,
    tanggal_penyusunan: rps.tanggal_penyusunan 
      ? new Date(rps.tanggal_penyusunan).toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'long', year: 'numeric' 
        })
      : '-',
    
    // Penyusun
    penyusun_nama: rps.penyusun_nama || '-',
    penyusun_nidn: rps.penyusun_nidn || '-',
    koordinator_rmk_nama: rps.koordinator_rmk_nama || '-',
    koordinator_rmk_nidn: rps.koordinator_rmk_nidn || '-',
    kaprodi_nama: rps.kaprodi_nama || '-',
    kaprodi_nidn: rps.kaprodi_nidn || '-',
    
    // Deskripsi
    deskripsi_mk: rps.deskripsi_mk || '-',
    capaian_pembelajaran: rps.capaian_pembelajaran || '-',
    
    // CPL
    cpl_list: assignedCPLs.map(cpl => ({
      kode: cpl.kode,
      deskripsi: cpl.deskripsi
    })),
    
    // CPMK
    cpmk_list: cpmkList.map(cpmk => {
      const cplCodes = (cpmk.cpl_ids || [])
        .map(cplId => cplList.find(c => c.id === cplId)?.kode)
        .filter(Boolean)
        .join(', ');
      return {
        kode: cpmk.kode,
        deskripsi: cpmk.deskripsi,
        cpl_codes: cplCodes || '-'
      };
    }),
    
    // Sub-CPMK
    sub_cpmk_list: subCpmkList,
    
    // Korelasi
    korelasi_matrix: korelasiMatrix,
    
    // Topik
    topik_list: topikList,
    
    // Referensi
    referensi_list: referensiList,
    
    // Dosen
    dosen_nama: rps.penyusun_nama || '-',
    mata_kuliah_prasyarat: mataKuliah?.prasyarat?.join(', ') || '-',
    
    // Rencana Pembelajaran
    rencana_pembelajaran: rencanaPembelajaranData,
    
    // Rencana Tugas
    rencana_tugas: rencanaTugasData,
    
    // Metode & Media
    metode_pembelajaran: rps.metode_pembelajaran || [],
    media_pembelajaran: rps.media_pembelajaran || []
  };
}

/**
 * Generate dokumen DOCX dari template dengan data RPS
 */
export async function generateRPSDocument(
  templateBuffer: ArrayBuffer,
  data: RPSDocumentData
): Promise<Blob> {
  // Load template
  const zip = new PizZip(templateBuffer);
  
  // Create docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: {
      start: '{{',
      end: '}}'
    }
  });
  
  // Prepare data for template
  const templateData = {
    // Info Dasar
    PERGURUAN_TINGGI: data.perguruan_tinggi,
    FAKULTAS: data.fakultas,
    PROGRAM_STUDI: data.program_studi,
    NAMA_MK: data.nama_mata_kuliah,
    KODE_MK: data.kode_mk,
    RUMPUN_MK: data.rumpun_mk,
    SKS_TEORI: data.sks_teori,
    SKS_PRAKTIKUM: data.sks_praktikum,
    SEMESTER: data.semester,
    TGL_PENYUSUNAN: data.tanggal_penyusunan,
    
    // Penyusun
    PENYUSUN_NAMA: data.penyusun_nama,
    PENYUSUN_NIDN: data.penyusun_nidn,
    KOORDINATOR_NAMA: data.koordinator_rmk_nama,
    KOORDINATOR_NIDN: data.koordinator_rmk_nidn,
    KAPRODI_NAMA: data.kaprodi_nama,
    KAPRODI_NIDN: data.kaprodi_nidn,
    
    // Deskripsi
    DESKRIPSI_MK: data.deskripsi_mk,
    CAPAIAN_PEMBELAJARAN: data.capaian_pembelajaran,
    
    // CPL List (untuk loop)
    cpl_list: data.cpl_list,
    
    // CPMK List (untuk loop)
    cpmk_list: data.cpmk_list,
    
    // Sub-CPMK List (untuk loop)
    sub_cpmk_list: data.sub_cpmk_list,
    
    // Topik List
    topik_list: data.topik_list,
    
    // Referensi List
    referensi_list: data.referensi_list,
    
    // Dosen
    DOSEN_NAMA: data.dosen_nama,
    MK_PRASYARAT: data.mata_kuliah_prasyarat,
    
    // Rencana Pembelajaran (untuk loop tabel)
    rencana_pembelajaran: data.rencana_pembelajaran,
    
    // Rencana Tugas (untuk loop)
    rencana_tugas: data.rencana_tugas,
    
    // Metode & Media
    METODE_PEMBELAJARAN: data.metode_pembelajaran.join(', '),
    MEDIA_PEMBELAJARAN: data.media_pembelajaran.join(', ')
  };
  
  // Render document with data
  doc.render(templateData);
  
  // Generate output
  const output = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  
  return output;
}

/**
 * Download template dari server dan generate dokumen
 */
export async function downloadAndGenerateRPS(
  templateUrl: string,
  data: RPSDocumentData
): Promise<Blob> {
  // Fetch template
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }
  
  const templateBuffer = await response.arrayBuffer();
  
  // Generate document
  return generateRPSDocument(templateBuffer, data);
}

/**
 * Trigger browser download untuk blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
