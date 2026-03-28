# Project Memory — Self-hosted Contact Manager

> Tạo: 2026-03-28 | Task hoàn thành gần nhất: TASK-00 (Lên kế hoạch)  
> Agent đọc file này để nắm toàn bộ context và tiếp tục làm việc

---

## Tổng quan project

**Tên project:** contacts-selfhost  
**Mục đích:** Quản lý danh bạ cá nhân self-hosted với ~30,000 contacts  
**Tech stack:**
- Backend: Firebase Firestore + Realtime Database
- API Layer: Express.js / Cloud Functions + Firebase Admin SDK
- Auth: API Key (hash lưu trong Realtime Database)
- Language: Node.js (CommonJS)

**Tài liệu gốc:** `docs/database-architecture.md` — đây là spec chính, mọi implementation phải tuân theo

---

## Kiến trúc Database (tóm tắt)

### Firestore Collections (6 collections)
| Collection | Mục đích | Kích thước |
|------------|----------|------------|
| `contacts_index/{id}` | Hiển thị danh sách, search, filter | ~1KB/doc × 30K |
| `contacts_detail/{id}` | Dữ liệu đầy đủ, đọc khi click vào 1 contact | ~5-50KB/doc |
| `email_lookup/{emailId}` | Reverse lookup email → contactId (O1) | ~54K docs |
| `ud_key_lookup/{keyId}` | Reverse lookup userDefined key → contactIds | ~10-30 docs |
| `categories/{id}` | Tag management | ~50 docs |
| `meta/stats` | Thống kê tổng | 1 doc |

### Realtime Database
- `/api_keys/{keyHash}` — API key management
- `/sync_status` — trạng thái sync
- `/import_jobs/{jobId}` — bulk import progress

### Encoding rule cho document IDs của lookup collections
- Dấu `.` thay bằng `,`
- Ví dụ: `"gitea.token"` → doc ID: `"gitea,token"`
- Ví dụ: `"ongtrieuhau@gmail.com"` → doc ID: `"ongtrieuhau@gmail,com"`

---

## Trạng thái tasks

### Đã hoàn thành
- *(chưa có)*

### Chưa thực hiện
- TASK-01: Khởi tạo Firebase & cấu hình môi trường
- TASK-02: Cài đặt dependencies & cấu trúc thư mục
- TASK-03: Firestore Security Rules & Indexes
- TASK-04: `contactMapper.js`
- TASK-05: `writeContact.js`
- TASK-06: `pagination.js`
- TASK-07: `routes/contacts.js`
- TASK-08: `routes/lookup.js`
- TASK-09: `routes/bulk.js` & `routes/meta.js`
- TASK-10: `middleware/auth.js`
- TASK-11: `functions/index.js`
- TASK-12: `scripts/vcf2json.js`
- TASK-13: `scripts/import.js`
- TASK-14: `scripts/migrate-v2.js`
- TASK-15: Tests & API docs
- TASK-16: Deploy production

**Task tiếp theo nên làm:** TASK-01, TASK-02, TASK-03 (song song)

---

## Cấu trúc file project (mục tiêu)

```
contacts-selfhost/
├── functions/
│   ├── index.js                      # [TASK-11] Express app entry
│   ├── routes/
│   │   ├── contacts.js               # [TASK-07] CRUD + search
│   │   ├── lookup.js                 # [TASK-08] by-email, by-ud-key
│   │   ├── bulk.js                   # [TASK-09] import/export
│   │   └── meta.js                   # [TASK-09] stats, categories
│   ├── middleware/
│   │   └── auth.js                   # [TASK-10] API key validation
│   └── utils/
│       ├── firebase-admin.js         # [TASK-01] Firebase init
│       ├── contactMapper.js          # [TASK-04] buildContactDocs()
│       ├── writeContact.js           # [TASK-05] writeContact(), deleteContact()
│       ├── searchTokens.js           # [TASK-04] buildSearchTokens()
│       └── pagination.js             # [TASK-06] cursor pagination
│
├── scripts/
│   ├── vcf2json.js                   # [TASK-12] VCF parser
│   ├── import.js                     # [TASK-13] bulk import
│   ├── export.js                     # [TASK-13] export JSON/VCF
│   ├── migrate-v2.js                 # [TASK-14] one-time migration
│   └── create-api-key.js             # [TASK-10] tạo API key mới
│
├── docs/
│   ├── database-architecture.md      # Spec gốc (không sửa)
│   └── api.http                      # [TASK-15] API examples
│
├── tests/                            # [TASK-15]
├── firestore.rules                   # [TASK-03]
├── firestore.indexes.json            # [TASK-03]
├── database.rules.json               # [TASK-03]
├── firebase.json                     # [TASK-01]
├── package.json                      # [TASK-02]
├── .env.example                      # [TASK-01]
│
├── .opushforce.message               # Auto-updated by agent
├── CHANGE_LOGS.md                    # Auto-updated by agent
├── CHANGE_LOGS_USER.md               # Auto-updated by agent
├── project_memory.md                 # Auto-updated by agent (file này)
├── project_task.md                   # Task list với trạng thái
├── template-task.md                  # Hướng dẫn cho agent
└── Readme.md                         # Docs chính
```

---

## Quyết định kỹ thuật đã chốt

1. **Atomic batch write:** Mỗi contact write = 1 Firestore batch (index + detail + email_lookup + ud_key_lookup)
2. **Search tokens:** Prefix ngrams từ ký tự thứ 2 trở đi, NFD normalize để hỗ trợ tiếng Việt
3. **Email encoding:** lowercase trước khi lưu
4. **Pagination:** Cursor-based (không dùng offset — kém hiệu quả với Firestore)
5. **Không query `contacts_detail` để làm danh sách** — chỉ query `contacts_index`
6. **API Key hashing:** Lưu hash của key trong Realtime DB, không lưu key gốc

---

## Cấu hình cần thiết khi setup

```env
# .env (không commit lên git)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# hoặc
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

PORT=3000
NODE_ENV=development
```

---

## Ghi chú quan trọng cho agent

- **Luôn đọc `docs/database-architecture.md`** khi implement — đây là source of truth
- **Schema của `contacts_index` phải ≤ 1KB/doc** — không thêm field nặng vào đây
- **`ud_key_lookup` count field** có thể bị lệch nếu chạy migrate nhiều lần — đây là known limitation
- **Firestore batch limit = 500 operations** — migrate script dùng 400 docs/batch để an toàn
- **Test với data mẫu** trước khi chạy migration trên 30K contacts thật
