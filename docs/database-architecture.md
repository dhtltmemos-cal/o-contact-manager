# Database Architecture — Self-hosted Contact Manager

> Firebase Firestore + Realtime Database | 30K contacts | REST API  
> Version 2 — thêm email_lookup, ud_key_lookup, userDefined search

---

## 1. Vấn đề cần giải quyết

| Triệu chứng                  | Nguyên nhân gốc                 | Giải pháp                                  |
| ---------------------------- | ------------------------------- | ------------------------------------------ |
| Load danh sách chậm          | Đọc 30K document đầy đủ mỗi lần | Tách `index` (nhẹ) vs `detail` (đầy đủ)    |
| Hết quota Firestore          | 1 request = 30K reads           | Pagination 50/page = 50 reads              |
| Search chậm                  | Không có index text             | Pre-compute `searchTokens` array           |
| Email phụ không tìm được     | Chỉ index `primaryEmail`        | Thêm `allEmails[]` + `email_lookup`        |
| userDefined không query được | Chỉ lưu trong `contacts_detail` | Thêm `userDefinedKeys[]` + `ud_key_lookup` |
| API phụ thuộc UI             | Không có REST layer             | Cloud Function / Express + Admin SDK       |

---

## 2. Tổng quan kiến trúc — 6 Collections

```
Firestore
├── contacts_index/{contactId}     ← list, search, filter  (~1KB/doc)
├── contacts_detail/{contactId}    ← full data on-demand   (~5–50KB/doc)
├── email_lookup/{emailId}         ← reverse lookup by email  O(1)
├── ud_key_lookup/{keyId}          ← reverse lookup by userDefined key  O(1)
├── categories/{categoryId}        ← tag management (~50 docs)
└── meta/stats                     ← global stats (1 doc)

Realtime Database
├── /api_keys/{keyHash}            ← API key management
├── /sync_status                   ← trạng thái sync
└── /import_jobs/{jobId}           ← progress bulk import
```

**Nguyên tắc thiết kế:**

- `contacts_index` + `email_lookup` + `ud_key_lookup` write cùng 1 batch — atomically
- Không bao giờ query `contacts_detail` để làm danh sách
- documentId của lookup collections dùng key encoding để tra O(1) không cần query

---

## 3. Schema chi tiết — Firestore

### 3.1 `contacts_index/{contactId}`

> Hiển thị danh sách, search, filter — đọc nhiều nhất. Mục tiêu ≤ 1KB/doc.

```jsonc
{
  "id": "uid_abc123",
  "displayName": "John Doe",
  "nameNormalized": "john doe",
  "primaryEmail": "hau@work.com",
  "emailDomain": "work.com",
  "allEmails": ["hau@work.com", "ongtrieuhau@gmail.com", "hau.personal@yahoo.com"],
  "allDomains": ["work.com", "gmail.com", "yahoo.com"],
  "primaryPhone": "0901234567",
  "organization": "ACME Corp",
  "photoUrl": "https://...",
  "categories": ["myContacts", "friends"],
  "tags": [],
  "searchTokens": ["j", "jo", "joh", "john", "d", "do", "doe", "john doe", "acme"],
  "userDefinedKeys": ["go.2Fa.Secret", "github.token", "gitea.token"],
  "hasUserDefined": true,
  "udKeyCount": 5,
  "emailCount": 3,
  "phoneCount": 2,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-03-28T10:00:00Z",
  "importedAt": "2026-03-01T00:00:00Z",
  "sourceFile": "contacts_export_2026.vcf",
  "version": 1
}
```

### 3.2 `contacts_detail/{contactId}`

```jsonc
{
  "id": "uid_abc123",
  "contact": {
    "displayName": "John Doe",
    "name": { "family": "Doe", "given": "John" },
    "emails": [
      { "type": ["INTERNET", "WORK"], "value": "hau@work.com" },
      { "type": ["INTERNET", "HOME"], "value": "ongtrieuhau@gmail.com" }
    ],
    "phones": [{ "type": ["CELL"], "value": "0901234567" }],
    "organization": "ACME Corp",
    "categories": ["myContacts", "friends"]
  },
  "userDefined": {
    "go.2Fa.Secret": "svvyitqtytdqkzcv5mbtimvxkl7qu7dk",
    "github.token": "ghp_xxx",
    "gitea.token": "gta_yyy"
  },
  "vcfRaw": "BEGIN:VCARD\n...\nEND:VCARD",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-03-28T10:00:00Z",
  "version": 1
}
```

### 3.3 `email_lookup/{emailId}`
> documentId = email với `.` thay bằng `,`

```jsonc
{
  "email": "ongtrieuhau@gmail.com",
  "contactId": "uid_abc123",
  "isPrimary": false,
  "type": ["INTERNET", "HOME"],
  "label": "Cá nhân"
}
```

### 3.4 `ud_key_lookup/{keyId}`
> documentId = key với `.` thay bằng `,`

```jsonc
{
  "key": "gitea.token",
  "contactIds": ["uid_abc123", "uid_def456"],
  "count": 3,
  "updatedAt": "2026-03-28T10:00:00Z"
}
```

---

## 4. Composite Indexes — `firestore.indexes.json`

```json
{
  "indexes": [
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "searchTokens", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "categories", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "allEmails", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "allDomains", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "userDefinedKeys", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "categories", "arrayConfig": "CONTAINS" }, { "fieldPath": "userDefinedKeys", "arrayConfig": "CONTAINS" }, { "fieldPath": "updatedAt", "order": "DESCENDING" }] },
    { "collectionGroup": "contacts_index", "fields": [{ "fieldPath": "emailDomain", "order": "ASCENDING" }, { "fieldPath": "displayName", "order": "ASCENDING" }] }
  ]
}
```

---

## 5. Query Patterns

```js
// Danh sách thường
db.collection("contacts_index").orderBy("updatedAt", "desc").limit(50);

// Search theo tên/org
db.collection("contacts_index").where("searchTokens", "array-contains", "joi").orderBy("updatedAt", "desc").limit(50);

// Filter theo email bất kỳ
db.collection("contacts_index").where("allEmails", "array-contains", "ongtrieuhau@gmail.com");

// Filter theo userDefined key
db.collection("contacts_index").where("userDefinedKeys", "array-contains", "gitea.token").orderBy("updatedAt", "desc").limit(50);

// Combo: category + udKey
db.collection("contacts_index")
  .where("categories", "array-contains", "myContacts")
  .where("userDefinedKeys", "array-contains", "gitea.token")
  .orderBy("updatedAt", "desc").limit(50);
```

---

## 6. REST API Endpoints

| Method | Path | Mô tả | Reads |
| ------ | ---- | ----- | ----- |
| GET | `/contacts` | Danh sách + filter + search | 50/page |
| GET | `/contacts/:id` | Chi tiết 1 contact | 2 |
| POST | `/contacts` | Tạo mới | 2+N writes |
| PUT | `/contacts/:id` | Cập nhật toàn bộ | 2+N writes |
| PATCH | `/contacts/:id` | Cập nhật từng phần | 2+N writes |
| DELETE | `/contacts/:id` | Xóa | 2+N writes |
| GET | `/contacts/by-email/:email` | Tra ngược theo email | 3 |
| GET | `/contacts/by-ud-key/:key` | Tất cả contacts có key | 1+N |
| GET | `/contacts/ud-keys` | Liệt kê tất cả userDefined keys | ~10–30 |
| POST | `/contacts/bulk/import` | Bulk import (async) | N writes |
| GET | `/contacts/bulk/export` | Export JSON/VCF | N reads |
| GET | `/contacts/meta/stats` | Thống kê tổng | 1 |

---

## 7. Ước tính chi phí Firestore

Session 30 phút bình thường: ~420 reads (trước đây: 30,000 reads/lần load)

Nằm trong free tier Firestore (50K reads/ngày) thoải mái cho dùng cá nhân.

---

## 8. Cấu trúc project

```
contacts-selfhost/
├── functions/
│   ├── index.js
│   ├── routes/contacts.js
│   ├── routes/lookup.js
│   ├── routes/bulk.js
│   ├── routes/meta.js
│   ├── middleware/auth.js
│   └── utils/
│       ├── firebase-admin.js
│       ├── contactMapper.js
│       ├── writeContact.js
│       ├── searchTokens.js
│       └── pagination.js
├── scripts/
│   ├── vcf2json.js
│   ├── import.js
│   ├── export.js
│   └── migrate-v2.js
├── firestore.rules
├── firestore.indexes.json
├── database.rules.json
└── firebase.json
```
