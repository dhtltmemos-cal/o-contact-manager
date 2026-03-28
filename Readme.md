# Self-hosted Contact Manager

> Quản lý danh bạ cá nhân với ~30,000 contacts  
> Firebase Firestore + Realtime Database + REST API

---

## Tính năng

- 📋 Quản lý 30,000+ contacts với hiệu năng cao
- 🔍 Tìm kiếm prefix real-time (tên, tổ chức, email)
- 📧 Tìm kiếm theo bất kỳ email nào (primary hoặc phụ)
- 🔑 Lưu trữ & tìm kiếm theo userDefined keys (2FA secrets, tokens,...)
- 🏷️ Phân loại theo categories/tags
- 📥 Import từ VCF (vCard)
- 📤 Export JSON/VCF
- 🔒 API Key authentication
- 💰 Tối ưu Firestore quota (50 reads/page thay vì 30,000)

---

## Kiến trúc

```
Firestore
├── contacts_index/{id}     ← list, search, filter (~1KB/doc)
├── contacts_detail/{id}    ← full data on-demand (~5-50KB/doc)
├── email_lookup/{emailId}  ← O(1) reverse lookup by email
├── ud_key_lookup/{keyId}   ← O(1) reverse lookup by userDefined key
├── categories/{id}         ← tag management
└── meta/stats              ← global stats

Realtime Database
├── /api_keys/{keyHash}     ← API key management
├── /sync_status            ← sync status
└── /import_jobs/{jobId}    ← bulk import progress
```

Chi tiết đầy đủ: [`docs/database-architecture.md`](docs/database-architecture.md)

---

## Yêu cầu

- Node.js >= 18
- Firebase project với Firestore và Realtime Database enabled
- Firebase service account key (JSON)

---

## Cài đặt

```bash
# 1. Clone / tải về
git clone <repo-url>
cd contacts-selfhost

# 2. Cài dependencies
cd functions
npm install

# 3. Cấu hình environment
cp .env.example .env
# Sửa .env với Firebase project ID và đường dẫn service account

# 4. Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes

# 5. Tạo API key đầu tiên
node scripts/create-api-key.js

# 6. Chạy server (dev)
node functions/index.js
```

---

## Import Contacts

```bash
# Import từ file VCF
node scripts/import.js --file contacts_export.vcf

# Migration nếu đã có data cũ (chạy 1 lần)
node scripts/migrate-v2.js
```

---

## API Reference

Tất cả requests cần header: `Authorization: Bearer <api-key>`

### Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/contacts` | Danh sách + search + filter |
| GET | `/contacts/:id` | Chi tiết 1 contact |
| POST | `/contacts` | Tạo mới |
| PUT | `/contacts/:id` | Cập nhật toàn bộ |
| PATCH | `/contacts/:id` | Cập nhật từng phần |
| DELETE | `/contacts/:id` | Xóa |
| GET | `/contacts/by-email/:email` | Lookup theo email |
| GET | `/contacts/by-ud-key/:key` | Lookup theo userDefined key |
| GET | `/contacts/ud-keys` | Liệt kê tất cả userDefined keys |
| POST | `/contacts/bulk/import` | Bulk import (async) |
| GET | `/contacts/bulk/export` | Export JSON/VCF |
| GET | `/contacts/meta/stats` | Thống kê tổng |

### Query params cho GET `/contacts`

```
search      string   tìm kiếm (min 2 ký tự)
category    string   lọc theo category
domain      string   lọc theo email domain (vd: gmail.com)
email       string   lọc theo email cụ thể
udKey       string   lọc theo userDefined key
hasUD       boolean  chỉ lấy contacts có userDefined
sort        string   updatedAt | createdAt | displayName
order       string   asc | desc
limit       number   default 50, max 200
cursor      string   cursor để phân trang
```

Xem ví dụ chi tiết: [`docs/api.http`](docs/api.http)

---

## Chi phí Firestore (ước tính)

| Hoạt động | Reads | Ghi chú |
|-----------|-------|---------|
| Load trang đầu | 50 | Pagination 50/trang |
| Tìm kiếm | 50/trang | Dùng searchTokens index |
| Xem chi tiết | 2 | index + detail |
| Lookup email | 2 | O(1) |
| Lookup udKey | 1+N | N = số contacts có key đó |
| Session 30 phút | ~420 | Trước đây: 30,000/lần load |

---

## Trạng thái phát triển

Xem chi tiết: [`project_task.md`](project_task.md)

---

## Changelog

Xem: [`CHANGE_LOGS_USER.md`](CHANGE_LOGS_USER.md)
