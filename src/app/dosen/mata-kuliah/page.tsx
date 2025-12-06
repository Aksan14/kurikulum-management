"use client";

import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout";
import { mockUsers } from "@/lib/mock-data";
import {
	Search,
	Plus,
	Edit,
	Eye,
	BookOpen,
	Users,
	Clock,
	Calendar,
	FileText,
	Star,
	Filter,
	Download,
	Upload,
	GraduationCap,
	Award,
	Target,
} from "lucide-react";

interface MataKuliah {
	id: string;
	kode: string;
	nama: string;
	sks: number;
	semester: number;
	jenis: "wajib" | "pilihan";
	deskripsi: string;
	prasyarat: string[];
	dosen: string[];
	status: "aktif" | "nonaktif" | "revisi";
	rpsStatus: "approved" | "pending" | "draft" | "none";
	jumlahMahasiswa: number;
	evaluasi: {
		rating: number;
		feedback: number;
	};
}

const mockMataKuliah: MataKuliah[] = [
	{
		id: "1",
		kode: "TIF101",
		nama: "Algoritma dan Pemrograman",
		sks: 3,
		semester: 1,
		jenis: "wajib",
		deskripsi:
			"Mata kuliah yang membahas dasar-dasar algoritma dan pemrograman komputer",
		prasyarat: [],
		dosen: ["Dr. Ahmad Wijaya", "Budi Santoso, M.Kom"],
		status: "aktif",
		rpsStatus: "approved",
		jumlahMahasiswa: 45,
		evaluasi: {
			rating: 4.5,
			feedback: 38,
		},
	},
	{
		id: "2",
		kode: "TIF201",
		nama: "Struktur Data",
		sks: 3,
		semester: 2,
		jenis: "wajib",
		deskripsi:
			"Mata kuliah yang membahas berbagai struktur data dan implementasinya",
		prasyarat: ["TIF101"],
		dosen: ["Sari Dewi, M.T.", "Agus Prakoso, Ph.D"],
		status: "aktif",
		rpsStatus: "pending",
		jumlahMahasiswa: 42,
		evaluasi: {
			rating: 4.2,
			feedback: 35,
		},
	},
	{
		id: "3",
		kode: "TIF301",
		nama: "Basis Data",
		sks: 3,
		semester: 3,
		jenis: "wajib",
		deskripsi:
			"Mata kuliah yang membahas konsep dan implementasi sistem basis data",
		prasyarat: ["TIF201"],
		dosen: ["Prof. Dr. Indira Sari"],
		status: "aktif",
		rpsStatus: "draft",
		jumlahMahasiswa: 38,
		evaluasi: {
			rating: 4.7,
			feedback: 32,
		},
	},
	{
		id: "4",
		kode: "TIF401",
		nama: "Rekayasa Perangkat Lunak",
		sks: 4,
		semester: 4,
		jenis: "wajib",
		deskripsi:
			"Mata kuliah yang membahas metodologi pengembangan perangkat lunak",
		prasyarat: ["TIF301"],
		dosen: ["Dr. Rini Kusuma", "Andi Setiawan, M.Kom"],
		status: "aktif",
		rpsStatus: "approved",
		jumlahMahasiswa: 40,
		evaluasi: {
			rating: 4.3,
			feedback: 36,
		},
	},
	{
		id: "5",
		kode: "TIF501",
		nama: "Kecerdasan Buatan",
		sks: 3,
		semester: 5,
		jenis: "pilihan",
		deskripsi:
			"Mata kuliah yang membahas konsep dan aplikasi kecerdasan buatan",
		prasyarat: ["TIF301", "TIF201"],
		dosen: ["Dr. Budi Hartono"],
		status: "aktif",
		rpsStatus: "none",
		jumlahMahasiswa: 25,
		evaluasi: {
			rating: 4.8,
			feedback: 22,
		},
	},
];

const mockSchedule = [
	{
		id: "1",
		mk: "Algoritma dan Pemrograman",
		kode: "TIF101",
		semester: 1,
		hari: "Senin",
		waktu: "08:00 - 09:40",
		ruangan: "Lab 1",
	},
	{
		id: "2",
		mk: "Struktur Data",
		kode: "TIF201",
		semester: 2,
		hari: "Selasa",
		waktu: "10:00 - 11:40",
		ruangan: "Ruang B203",
	},
	{
		id: "3",
		mk: "Basis Data",
		kode: "TIF301",
		semester: 3,
		hari: "Kamis",
		waktu: "13:00 - 14:40",
		ruangan: "Ruang C102",
	},
];


const statusColors = {
	aktif: "bg-green-100 text-green-800 border-green-200",
	nonaktif: "bg-gray-100 text-gray-800 border-gray-200",
	revisi: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const rpsStatusColors = {
	approved: "bg-green-100 text-green-800",
	pending: "bg-yellow-100 text-yellow-800",
	draft: "bg-blue-100 text-blue-800",
	none: "bg-gray-100 text-gray-800",
};

const jenisColors = {
	wajib: "bg-red-100 text-red-800",
	pilihan: "bg-blue-100 text-blue-800",
};

export default function DosenMataKuliahPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSemester, setSelectedSemester] = useState<string>("all");
	const [selectedJenis, setSelectedJenis] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [selectedMK, setSelectedMK] = useState<MataKuliah | null>(null);
	const [openDetail, setOpenDetail] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [openRPS, setOpenRPS] = useState(false);
	const [openAdd, setOpenAdd] = useState(false);
    const [dataMK, setDataMK] = useState(mockMataKuliah);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [schedule, setSchedule] = useState(mockSchedule);
    const [selectedScheduleSemester, setSelectedScheduleSemester] =
			useState("all");



    const filteredSchedule = schedule.filter((item) => {
	if (selectedScheduleSemester === "all") return true;
	return item.semester.toString() === selectedScheduleSemester;
    });
	const openDetailModal = (mk: MataKuliah) => {
		setSelectedMK(mk);
		setOpenDetail(true);
	};
	const openEditModal = (mk: MataKuliah) => {
		setSelectedMK(mk);
		setOpenEdit(true);
	};
	const openRPSModal = (mk: MataKuliah) => {
		setSelectedMK(mk);
		setOpenRPS(true);
	};

	const filteredMataKuliah = dataMK.filter((mk) => {
		const matchesSearch =
			mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
			mk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
			mk.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesSemester =
			selectedSemester === "all" || mk.semester.toString() === selectedSemester;
		const matchesJenis = selectedJenis === "all" || mk.jenis === selectedJenis;
		const matchesStatus =
			selectedStatus === "all" || mk.status === selectedStatus;

		return matchesSearch && matchesSemester && matchesJenis && matchesStatus;
	});

	const totalSKS = filteredMataKuliah.reduce((sum, mk) => sum + mk.sks, 0);
	const avgRating =
		filteredMataKuliah.reduce((sum, mk) => sum + mk.evaluasi.rating, 0) /
			filteredMataKuliah.length || 0;
	const totalMahasiswa = filteredMataKuliah.reduce(
		(sum, mk) => sum + mk.jumlahMahasiswa,
		0
	);
	

	// Get dosen user (second user in mockUsers)
	const dosenUser =
		mockUsers.find((user) => user.role === "dosen") || mockUsers[1];

	return (
		<DashboardLayout
			user={{ ...dosenUser, role: "dosen" }}
			unreadNotifications={2}>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold text-slate-900">Mata Kuliah</h1>
					<p className="text-slate-600">
						Kelola dan pantau mata kuliah yang Anda ampu
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
									<BookOpen className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-600">
										Total Mata Kuliah
									</p>
									<p className="text-2xl font-bold text-slate-900">
										{filteredMataKuliah.length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
									<Award className="h-6 w-6 text-green-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-600">
										Total SKS
									</p>
									<p className="text-2xl font-bold text-slate-900">
										{totalSKS}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
									<Users className="h-6 w-6 text-yellow-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-600">
										Total Mahasiswa
									</p>
									<p className="text-2xl font-bold text-slate-900">
										{totalMahasiswa}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
									<Star className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-600">
										Rating Rata-rata
									</p>
									<p className="text-2xl font-bold text-slate-900">
										{avgRating.toFixed(1)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="list" className="space-y-6">
					<div className="flex flex-col sm:flex-row gap-4 justify-between">
						<TabsList>
							<TabsTrigger value="list">Daftar Mata Kuliah</TabsTrigger>
							<TabsTrigger value="schedule">Jadwal Mengajar</TabsTrigger>
							<TabsTrigger value="evaluation">Evaluasi</TabsTrigger>
						</TabsList>

						<div className="flex gap-2">
							<Button variant="outline" size="sm">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
							
						</div>
					</div>

					<TabsContent value="list" className="space-y-6">
						{/* Filters */}
						<Card>
							<CardContent className="p-6">
								<div className="flex flex-col sm:flex-row gap-4">
									<div className="flex-1">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
											<Input
												placeholder="Cari mata kuliah..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<select
											value={selectedSemester}
											onChange={(e) => setSelectedSemester(e.target.value)}
											className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="all">Semua Semester</option>
											{[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
												<option key={sem} value={sem.toString()}>
													Semester {sem}
												</option>
											))}
										</select>
										<select
											value={selectedJenis}
											onChange={(e) => setSelectedJenis(e.target.value)}
											className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="all">Semua Jenis</option>
											<option value="wajib">Wajib</option>
											<option value="pilihan">Pilihan</option>
										</select>
										<select
											value={selectedStatus}
											onChange={(e) => setSelectedStatus(e.target.value)}
											className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="all">Semua Status</option>
											<option value="aktif">Aktif</option>
											<option value="nonaktif">Non-aktif</option>
											<option value="revisi">Revisi</option>
										</select>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Mata Kuliah List */}
						<div className="space-y-4">
							{filteredMataKuliah.map((mk) => (
								<Card key={mk.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<div className="flex flex-col lg:flex-row gap-4">
											<div className="flex-1 space-y-3">
												<div className="flex items-start justify-between">
													<div>
														<div className="flex items-center gap-3 mb-2">
															<h3 className="font-semibold text-slate-900">
																{mk.kode} - {mk.nama}
															</h3>
															<Badge
																className={jenisColors[mk.jenis]}
																variant="outline">
																{mk.jenis}
															</Badge>
															<Badge
																className={statusColors[mk.status]}
																variant="outline">
																{mk.status}
															</Badge>
														</div>
														<p className="text-sm text-slate-600">
															{mk.deskripsi}
														</p>
													</div>
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div className="flex items-center gap-2">
														<Award className="h-4 w-4 text-slate-500" />
														<span>{mk.sks} SKS</span>
													</div>
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-slate-500" />
														<span>Semester {mk.semester}</span>
													</div>
													<div className="flex items-center gap-2">
														<Users className="h-4 w-4 text-slate-500" />
														<span>{mk.jumlahMahasiswa} mahasiswa</span>
													</div>
													<div className="flex items-center gap-2">
														<Star className="h-4 w-4 text-yellow-500" />
														<span>
															{mk.evaluasi.rating}/5 ({mk.evaluasi.feedback}{" "}
															review)
														</span>
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center gap-2 text-sm">
														<GraduationCap className="h-4 w-4 text-slate-500" />
														<span className="font-medium">Dosen:</span>
														<span>{mk.dosen.join(", ")}</span>
													</div>

													{mk.prasyarat.length > 0 && (
														<div className="flex items-center gap-2 text-sm">
															<Target className="h-4 w-4 text-slate-500" />
															<span className="font-medium">Prasyarat:</span>
															<div className="flex flex-wrap gap-1">
																{mk.prasyarat.map((prasyarat) => (
																	<Badge
																		key={prasyarat}
																		variant="outline"
																		className="text-xs">
																		{prasyarat}
																	</Badge>
																))}
															</div>
														</div>
													)}

													<div className="flex items-center gap-2 text-sm">
														<FileText className="h-4 w-4 text-slate-500" />
														<span className="font-medium">Status RPS:</span>
														<Badge
															className={rpsStatusColors[mk.rpsStatus]}
															variant="outline">
															{mk.rpsStatus === "approved"
																? "Disetujui"
																: mk.rpsStatus === "pending"
																? "Menunggu"
																: mk.rpsStatus === "draft"
																? "Draft"
																: "Belum ada"}
														</Badge>
													</div>
												</div>
											</div>

											{/* ================= MODAL LIHAT ================= */}
											<Dialog open={openDetail} onOpenChange={setOpenDetail}>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Detail Mata Kuliah</DialogTitle>
													</DialogHeader>

													{selectedMK && (
														<div className="space-y-3 text-sm">
															<p>
																<strong>Kode:</strong> {selectedMK.kode}
															</p>
															<p>
																<strong>Nama:</strong> {selectedMK.nama}
															</p>
															<p>
																<strong>SKS:</strong> {selectedMK.sks}
															</p>
															<p>
																<strong>Semester:</strong> {selectedMK.semester}
															</p>
															<p>
																<strong>Jenis:</strong> {selectedMK.jenis}
															</p>
															<p>
																<strong>Deskripsi:</strong>{" "}
																{selectedMK.deskripsi}
															</p>
															<p>
																<strong>Dosen Pengampu:</strong>{" "}
																{selectedMK.dosen.join(", ")}
															</p>
															<p>
																<strong>Prasyarat:</strong>{" "}
																{selectedMK.prasyarat.join(", ")}
															</p>
															<p>
																<strong>Status RPS:</strong>{" "}
																{selectedMK.rpsStatus}
															</p>
														</div>
													)}
												</DialogContent>
											</Dialog>

											{/* ================= MODAL EDIT ================= */}
											<Dialog open={openEdit} onOpenChange={setOpenEdit}>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Edit Mata Kuliah</DialogTitle>
													</DialogHeader>

													{selectedMK && (
														<div className="space-y-4">
															<Input
																defaultValue={selectedMK.nama}
																placeholder="Nama MK"
															/>
															<Input
																defaultValue={selectedMK.kode}
																placeholder="Kode MK"
															/>
															<Input
																defaultValue={selectedMK.sks}
																type="number"
																placeholder="SKS"
															/>
															<Input
																defaultValue={selectedMK.semester}
																type="number"
																placeholder="Semester"
															/>
															<Input
																defaultValue={selectedMK.deskripsi}
																placeholder="Deskripsi"
															/>

															<Button>Simpan Perubahan</Button>
														</div>
													)}
												</DialogContent>
											</Dialog>

											{/* ================= MODAL RPS ================= */}
											<Dialog open={openRPS} onOpenChange={setOpenRPS}>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>RPS Mata Kuliah</DialogTitle>
													</DialogHeader>

													{selectedMK && (
														<div className="space-y-3">
															<p>
																<strong>Mata Kuliah:</strong> {selectedMK.nama}
															</p>
															<p>
																<strong>Status RPS:</strong>{" "}
																{selectedMK.rpsStatus}
															</p>

															<Button className="w-full mt-2">Lihat RPS</Button>
															<Button variant="outline" className="w-full">
																Generate RPS
															</Button>
														</div>
													)}
												</DialogContent>
											</Dialog>

											<div className="flex flex-row lg:flex-col gap-2 lg:w-32">
												{/* Tombol LIHAT */}
												<Button
													variant="outline"
													size="sm"
													className="flex-1 lg:flex-none"
													onClick={() => openDetailModal(mk)}>
													<Eye className="h-4 w-4 mr-2" />
													Lihat
												</Button>
												{/* Tombol EDIT */}
												<Button
													variant="outline"
													size="sm"
													className="flex-1 lg:flex-none"
													onClick={() => openEditModal(mk)}>
													<Edit className="h-4 w-4 mr-2" />
													Edit
												</Button>

												{/* Tombol RPS */}
												<Button
													variant="outline"
													size="sm"
													className="flex-1 lg:flex-none"
													onClick={() => openRPSModal(mk)}>
													<FileText className="h-4 w-4 mr-2" />
													RPS
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{filteredMataKuliah.length === 0 && (
							<Card>
								<CardContent className="p-12 text-center">
									<div className="flex flex-col items-center gap-4">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
											<BookOpen className="h-8 w-8 text-slate-400" />
										</div>
										<div>
											<h3 className="font-semibold text-slate-900">
												Tidak ada mata kuliah ditemukan
											</h3>
											<p className="text-sm text-slate-600 mt-1">
												Coba ubah filter atau kata kunci pencarian Anda
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="schedule" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Jadwal Mengajar</CardTitle>
								<CardDescription>
									Jadwal mengajar Anda pada semester ini
								</CardDescription>
							</CardHeader>

							<div className="flex justify-end items-center px-6 pb-4">
								<select
									value={selectedScheduleSemester}
									onChange={(e) => setSelectedScheduleSemester(e.target.value)}
									className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
									<option value="all">Semua Semester</option>
									{[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
										<option key={sem} value={sem.toString()}>
											Semester {sem}
										</option>
									))}
								</select>
							</div>

							<CardContent className="space-y-4">
								{/* Jika jadwal kosong */}
								{schedule.length === 0 ? (
									<div className="text-center py-10 text-slate-500">
										Belum ada jadwal mengajar.
									</div>
								) : (
									<div className="overflow-x-auto rounded-lg border border-slate-200">
										<table className="w-full text-sm">
											<thead className="bg-slate-50">
												<tr>
													<th className="px-4 py-3 text-left">Mata Kuliah</th>
													<th className="px-4 py-3 text-left">Kode</th>
													<th className="px-4 py-3 text-left">Semester</th>
													<th className="px-4 py-3 text-left">Hari</th>
													<th className="px-4 py-3 text-left">Waktu</th>
													<th className="px-4 py-3 text-left">Ruangan</th>
												</tr>
											</thead>
											<tbody>
												{filteredSchedule.map((item) => (
													<tr key={item.id} className="border-t">
														<td className="px-4 py-3">{item.mk}</td>
														<td className="px-4 py-3">{item.kode}</td>
														<td className="px-4 py-3">{item.semester}</td>
														<td className="px-4 py-3">{item.hari}</td>
														<td className="px-4 py-3">{item.waktu}</td>
														<td className="px-4 py-3">{item.ruangan}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="evaluation" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Evaluasi Mengajar</CardTitle>
								<CardDescription>
									Hasil evaluasi dan feedback dari mahasiswa
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-12">
									<div className="flex flex-col items-center gap-4">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
											<Star className="h-8 w-8 text-green-600" />
										</div>
										<div>
											<h3 className="font-semibold text-slate-900">
												Evaluasi Mengajar
											</h3>
											<p className="text-sm text-slate-600 mt-1">
												Fitur evaluasi mengajar akan segera tersedia
											</p>
										</div>
										<Button>Lihat Evaluasi</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}  
