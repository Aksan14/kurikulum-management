# Sistem Manajemen Kurikulum

Aplikasi web untuk manajemen kurikulum perguruan tinggi, termasuk pengelolaan RPS (Rencana Pembelajaran Semester), CPL (Capaian Pembelajaran Lulusan), Mata Kuliah, dan pemetaan CPL-MK.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React Framework dengan App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library

### Backend (Required)
- **Golang** - Backend API
- **Gin Framework** - HTTP web framework
- **GORM** - ORM library
- **MySQL 8.0+** - Database

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Backend API server running di `http://localhost:8080`

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/Aksan14/kurikulum-management.git
cd kurikulum-management

# Install dependencies
npm install

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin pages
│   ├── dosen/              # Dosen pages
│   │   ├── dashboard/
│   │   ├── rps/
│   │   ├── mata-kuliah/
│   │   └── ...
│   ├── kaprodi/            # Kaprodi pages
│   │   ├── dashboard/
│   │   ├── cpl/
│   │   ├── mapping/
│   │   ├── assignment/
│   │   ├── rps/
│   │   └── ...
│   └── login/
├── components/             # Reusable components
│   ├── layout/
│   ├── dashboard/
│   └── ui/
├── lib/                    # Utilities & API services
│   ├── api/
│   │   ├── client.ts       # API client with auth
│   │   ├── auth.ts
│   │   ├── rps.ts
│   │   ├── cpl.ts
│   │   ├── mata-kuliah.ts
│   │   ├── users.ts
│   │   ├── cpl-assignment.ts
│   │   └── cpl-mk-mapping.ts
│   └── utils.ts
└── types/
```

---

## 🔌 Backend API Documentation

Base URL: `http://localhost:8080/api/v1`

### Authentication

#### Login
```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "nama": "John Doe",
      "email": "user@example.com",
      "role": "kaprodi"
    },
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {access_token}
```

#### Refresh Token
```http
POST /auth/refresh
```
```json
{
  "refresh_token": "eyJhbG..."
}
```

---

### CPL (Capaian Pembelajaran Lulusan)

#### Get All CPL
```http
GET /cpls?page=1&limit=10&status=published
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "kode": "CPL-01",
        "nama": "Mampu menerapkan pemikiran logis",
        "deskripsi": "Deskripsi lengkap...",
        "status": "published",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

#### Get CPL by ID
```http
GET /cpls/:id
```

#### Create CPL
```http
POST /cpls
```
```json
{
  "kode": "CPL-01",
  "nama": "Mampu menerapkan pemikiran logis",
  "deskripsi": "Deskripsi lengkap...",
  "status": "draft"
}
```

#### Update CPL
```http
PUT /cpls/:id
```

#### Delete CPL
```http
DELETE /cpls/:id
```

---

### Mata Kuliah

#### Get All Mata Kuliah
```http
GET /mata-kuliah?page=1&limit=10&status=aktif&semester=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "kode": "IF101",
        "nama": "Algoritma dan Pemrograman",
        "sks": 3,
        "semester": 1,
        "status": "aktif"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### Create Mata Kuliah
```http
POST /mata-kuliah
```
```json
{
  "kode": "IF101",
  "nama": "Algoritma dan Pemrograman",
  "sks": 3,
  "semester": 1,
  "status": "aktif"
}
```

---

### CPL-MK Mapping

#### Get All Mappings
```http
GET /cpl-mk-mappings?page=1&limit=1000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid-mapping",
        "cpl_id": "uuid-cpl",
        "mata_kuliah_id": "uuid-mk",
        "level": "tinggi",
        "created_at": "2025-01-01T00:00:00Z",
        "cpl": {
          "id": "uuid-cpl",
          "kode": "CPL-01",
          "nama": "Mampu menerapkan..."
        },
        "mata_kuliah": {
          "id": "uuid-mk",
          "kode": "IF101",
          "nama": "Algoritma...",
          "semester": 1
        }
      }
    ],
    "total": 100
  }
}
```

#### Upsert Mapping (Create or Update)
```http
POST /cpl-mk-mappings/upsert
```
```json
{
  "cpl_id": "uuid-cpl",
  "mata_kuliah_id": "uuid-mk",
  "level": "tinggi"
}
```

**level values:** `"tinggi"` | `"sedang"` | `"rendah"`

**Response:**
```json
{
  "success": true,
  "message": "Mapping berhasil disimpan",
  "data": {
    "id": "uuid-mapping",
    "cpl_id": "uuid-cpl",
    "mata_kuliah_id": "uuid-mk",
    "level": "tinggi"
  }
}
```

#### Delete Mapping
```http
DELETE /cpl-mk-mappings/:id
```

#### Delete by CPL & MK Pair
```http
DELETE /cpl-mk-mappings/cpl/:cplId/mk/:mkId
```

---

### CPL Assignment (Penugasan CPL)

#### Get All Assignments
```http
GET /cpl-assignments?page=1&limit=10&status=assigned
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "cpl_id": "uuid-cpl",
        "dosen_id": "uuid-dosen",
        "mata_kuliah": "Pemrograman Web",
        "mata_kuliah_id": "uuid-mk",
        "status": "assigned",
        "deadline": "2025-06-01T23:59:59Z",
        "catatan": "Silakan buat RPS",
        "assigned_at": "2025-01-01T00:00:00Z",
        "cpl": {
          "id": "uuid",
          "kode": "CPL-01",
          "nama": "..."
        },
        "dosen": {
          "id": "uuid",
          "nama": "Dr. John Doe"
        }
      }
    ]
  }
}
```

#### Create Assignment
```http
POST /cpl-assignments
```
```json
{
  "cpl_id": "uuid-cpl",
  "dosen_id": "uuid-dosen",
  "mata_kuliah": "Pemrograman Web",
  "mata_kuliah_id": "uuid-mk",
  "deadline": "2025-06-01T23:59:59Z",
  "catatan": "Silakan buat RPS untuk mata kuliah ini"
}
```

#### Update Assignment Status
```http
PATCH /cpl-assignments/:id/status
```
```json
{
  "status": "cancelled",
  "rejection_reason": "Penugasan dibatalkan karena..."
}
```

**status values:** `"assigned"` | `"accepted"` | `"rejected"` | `"done"` | `"cancelled"`

#### Delete Assignment
```http
DELETE /cpl-assignments/:id
```

---

### RPS (Rencana Pembelajaran Semester)

#### Get All RPS
```http
GET /rps?page=1&limit=10&status=draft
```

#### Get My RPS (Dosen)
```http
GET /rps/my
```

#### Get RPS by ID
```http
GET /rps/:id
```

#### Create RPS
```http
POST /rps
```

#### Update RPS
```http
PUT /rps/:id
```

#### Approve RPS (Kaprodi)
```http
POST /rps/:id/approve
```

#### Reject RPS (Kaprodi)
```http
POST /rps/:id/reject
```
```json
{
  "reason": "Alasan penolakan..."
}
```

---

### Users

#### Get All Users
```http
GET /users?page=1&limit=10&role=dosen&status=active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "nama": "Dr. John Doe",
        "email": "john@university.ac.id",
        "role": "dosen",
        "status": "active"
      }
    ]
  }
}
```

---

## 🗄️ Database Schema

### cpl_mk_mappings
```sql
CREATE TABLE cpl_mk_mappings (
  id VARCHAR(36) PRIMARY KEY,
  cpl_id VARCHAR(36) NOT NULL,
  mata_kuliah_id VARCHAR(36) NOT NULL,
  level ENUM('tinggi', 'sedang', 'rendah') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cpl_id) REFERENCES cpls(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliahs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cpl_mk (cpl_id, mata_kuliah_id)
);
```

### cpl_assignments
```sql
CREATE TABLE cpl_assignments (
  id VARCHAR(36) PRIMARY KEY,
  cpl_id VARCHAR(36) NOT NULL,
  dosen_id VARCHAR(36) NOT NULL,
  mata_kuliah VARCHAR(255),
  mata_kuliah_id VARCHAR(36),
  status ENUM('assigned', 'accepted', 'rejected', 'done', 'cancelled') DEFAULT 'assigned',
  deadline TIMESTAMP NULL,
  catatan TEXT,
  rejection_reason TEXT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cpl_id) REFERENCES cpls(id) ON DELETE CASCADE,
  FOREIGN KEY (dosen_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliahs(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Data tidak valid",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan server"
}
```

---

## 👥 User Roles

| Role | Akses |
|------|-------|
| **admin** | Full access ke semua fitur |
| **kaprodi** | Kelola CPL, Mata Kuliah, Mapping, Assignment, Review RPS |
| **dosen** | Lihat assignment, Kelola RPS sendiri |

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
