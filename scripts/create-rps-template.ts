/**
 * Script untuk membuat template DOCX dengan placeholder
 * Jalankan dengan: npx ts-node scripts/create-rps-template.ts
 * atau: npx tsx scripts/create-rps-template.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Template XML content with placeholders
const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Header -->
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>RENCANA PEMBELAJARAN SEMESTER</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>{{PERGURUAN_TINGGI}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{FAKULTAS}} - {{PROGRAM_STUDI}}</w:t></w:r>
    </w:p>
    <w:p/>

    <!-- Info Mata Kuliah Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/>
          <w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/>
          <w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>NAMA MATA KULIAH</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{NAMA_MK}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>KODE MK</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{KODE_MK}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>BOBOT (SKS)</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>T={{SKS_TEORI}} P={{SKS_PRAKTIKUM}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>SEMESTER</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{SEMESTER}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>TGL PENYUSUNAN</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{TGL_PENYUSUNAN}}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p/>

    <!-- Penyusun Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/>
          <w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/>
          <w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>NAMA PENYUSUN</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{PENYUSUN_NAMA}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{PENYUSUN_NIDN}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>KOORDINATOR RMK</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{KOORDINATOR_NAMA}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{KOORDINATOR_NIDN}}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>KA PRODI</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{KAPRODI_NAMA}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{KAPRODI_NIDN}}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p/>

    <!-- Deskripsi -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>DESKRIPSI MATA KULIAH</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{DESKRIPSI_MK}}</w:t></w:r></w:p>
    <w:p/>

    <!-- CPL -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>CAPAIAN PEMBELAJARAN LULUSAN (CPL)</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#cpl_list}}{{kode}}: {{deskripsi}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/cpl_list}}</w:t></w:r></w:p>
    <w:p/>

    <!-- CPMK -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#cpmk_list}}{{kode}}: {{deskripsi}} (CPL: {{cpl_codes}})</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/cpmk_list}}</w:t></w:r></w:p>
    <w:p/>

    <!-- Sub-CPMK -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>SUB-CPMK</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#sub_cpmk_list}}{{kode}}: {{deskripsi}} (CPMK: {{cpmk_kode}})</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/sub_cpmk_list}}</w:t></w:r></w:p>
    <w:p/>

    <!-- Topik -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>BAHAN KAJIAN (TOPIK)</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#topik_list}}{{nomor}}. {{topik}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/topik_list}}</w:t></w:r></w:p>
    <w:p/>

    <!-- Referensi -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>REFERENSI</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#referensi_list}}{{nomor}}. {{referensi}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/referensi_list}}</w:t></w:r></w:p>
    <w:p/>

    <!-- Rencana Pembelajaran Table -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>RENCANA PEMBELAJARAN</w:t></w:r></w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/>
          <w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/>
          <w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>MG</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>SUB-CPMK</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>TOPIK</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>METODE</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>WAKTU</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>PENILAIAN</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>BOBOT</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>{{#rencana_pembelajaran}}{{minggu}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{sub_cpmk}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{topik_materi}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{metode_pembelajaran}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{waktu}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{teknik_kriteria}}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{{bobot}}%{{/rencana_pembelajaran}}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p/>

    <!-- Rencana Tugas -->
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>RENCANA TUGAS</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#rencana_tugas}}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Tugas {{nomor}}: {{judul}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Sub-CPMK: {{sub_cpmk}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Indikator: {{indikator}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Batas Waktu: {{batas_waktu}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Petunjuk: {{petunjuk}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Luaran: {{luaran}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Kriteria: {{kriteria}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Teknik Penilaian: {{teknik_penilaian}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bobot: {{bobot}}%</w:t></w:r></w:p>
    <w:p><w:r><w:t>Rujukan: {{daftar_rujukan}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/rencana_tugas}}</w:t></w:r></w:p>

    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

console.log('Template XML generated. Please create DOCX manually using Microsoft Word.');
console.log('See public/templates/README-TEMPLATE.md for placeholder guide.');
