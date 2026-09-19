# 📚 Library Borrowed Book Tracker

A simple, reliable, production-ready web application for library staff to record and manage books borrowed by students, track loan statuses, automatically detect overdue books, and dispatch WhatsApp return reminders.

Built with **React.js (Vite)**, **Node.js + Express.js**, **Supabase PostgreSQL & Auth**, **Zod**, and **Tailwind CSS**.

---

## 🏛️ Architecture

```text
React Frontend (Vite + Tailwind CSS)
      │
      ├─► Supabase Auth (Staff Session Management)
      │
      ▼
Express Backend (Node.js, Helmet, CORS, Zod)
      │
      ├─► Auth Middleware (Verifies Supabase JWTs)
      │
      ▼
Supabase PostgreSQL Database
      │
      ├─► borrowing_records Table
      └─► Row Level Security (RLS) Policies (Staff Data Isolation)
```

---

## ✨ Features

- **Staff Authentication:** Secure registration, login, and session persistence via Supabase Auth.
- **Strict Data Isolation:** PostgreSQL Row Level Security (RLS) policies guarantee staff members only ever access their own library records.
- **Borrowing Management:** Full CRUD operations for student loans with book title, book ID, category, student name, and phone number.
- **Dynamic Status Derivation:**
  - `Returned`: Book has a recorded return timestamp.
  - `Overdue`: Expected return date is in the past and the book has not been returned.
  - `Due Soon`: Expected return date is within 48 hours.
  - `Borrowed`: Active loan with more than 2 days remaining.
- **Real-Time Dashboard:** Interactive overview with metric cards, Recharts category breakdown, urgent overdue attention alerts, and recent borrowings.
- **Instant Search & Advanced Filtering:** Search by student name, phone, book title, or book ID; filter by status, category, and date ranges.
- **WhatsApp Reminder Integration:** One-click launcher formatting international phone numbers and opening WhatsApp with a pre-filled library reminder message.
- **CSV Export:** Download filtered or all-time borrowing records for institutional auditing.
- **Responsive Layout:** Works seamlessly across desktop workstations, tablets, and mobile devices.

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A free **[Supabase](https://supabase.com)** account and project

---

### 2. Supabase Setup

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. In the left navigation, go to the **SQL Editor**.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository and copy its entire content.
4. Paste it into the SQL Editor and click **Run**. This will:
   - Create the `borrowing_records` table with constraints.
   - Create B-Tree indexes on `staff_id`, `expected_return_date`, `student_name`, and `book_title`.
   - Enable Row Level Security (RLS) with SELECT, INSERT, UPDATE, and DELETE policies.
   - Create the automatic `updated_at` trigger.
5. In your Supabase Project Settings, go to **API** to retrieve:
   - **Project URL** (`SUPABASE_URL`)
   - **anon / public key** (`SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY` - server-only)

---

### 3. Environment Variables Configuration

#### Backend Configuration (`server/.env`)

Create or update `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase Project Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Client Origin
CLIENT_URL=http://localhost:5173
```

#### Frontend Configuration (`client/.env`)

Create or update `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Installation & Running Locally

Install all dependencies in the root, server, and client with a single command:

```bash
npm run install:all
```

Start both the backend server and frontend development client concurrently:

```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Express Backend:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Specification

All `/api/borrowings` and `/api/dashboard` endpoints require a valid Supabase JWT bearer token passed in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/borrowings` | Retrieve records (query: `search`, `status`, `category`, `startDate`, `endDate`, `page`, `limit`) |
| `POST` | `/api/borrowings` | Create a new borrowing record (validated via Zod) |
| `GET` | `/api/borrowings/:id` | Get details of a single record |
| `PUT` | `/api/borrowings/:id` | Update an existing borrowing record |
| `PUT` | `/api/borrowings/:id/return` | Mark book as returned (`returned_at = now()`) |
| `DELETE` | `/api/borrowings/:id` | Delete a borrowing record |
| `GET` | `/api/dashboard/stats` | Dashboard metrics, category tallies, urgent overdues |

---

## 📱 WhatsApp Reminder Workflow

When a book's `expected_return_date` has passed and it is not marked as returned:
1. The record is flagged with an **Overdue** status badge.
2. An urgent alert appears on the **Dashboard** and **Borrowed Books** directory.
3. Clicking the **"WhatsApp Reminder"** button executes:
   ```javascript
   const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
   window.open(url, '_blank', 'noopener,noreferrer');
   ```
4. The staff member's browser safely opens WhatsApp Web or WhatsApp Desktop with the pre-filled reminder template:
   > *"Hello [Student Name], this is a reminder from the library. The book "[Book Title]" was due for return on [Expected Return Date]. Please return it as soon as possible. Thank you."*

---

## 🛡️ Security Architecture

1. **Supabase Auth:** Passwords are never stored manually. Password hashing, salt, and JWT token rotation are handled directly by Supabase.
2. **PostgreSQL RLS:** The database enforces row-level permissions natively:
   ```sql
   CREATE POLICY "Staff can view own records" ON borrowing_records FOR SELECT USING (auth.uid() = staff_id);
   ```
3. **Backend Token Scoping:** The Express backend extracts the caller's JWT and passes it into the scoped Supabase client.
4. **Zod Validation:** All user inputs are strictly validated before touching the database.
5. **Helmet & CORS:** HTTP response headers and client origin whitelisting are applied on every route.
6. **Key Isolation:** The `SUPABASE_SERVICE_ROLE_KEY` is kept strictly on the Node.js server and is never bundled in frontend code.

---

## 📁 Repository Structure

```text
library-borrowed-book-tracker/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components (Table, Card, Badges, etc.)
│   │   ├── context/             # AuthContext (Supabase Auth)
│   │   ├── pages/               # Route pages (Dashboard, BorrowedBooks, AddBorrowing, etc.)
│   │   ├── routes/              # AppRoutes definition
│   │   ├── services/            # Axios API client & Supabase client
│   │   ├── App.jsx
│   │   ├── index.css            # Tailwind directives and design tokens
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Express Backend
│   ├── config/                  # Supabase clients (Admin and Scoped)
│   ├── controllers/             # Borrowing & Dashboard business logic
│   ├── middleware/              # Auth, Zod Validation, Error Handlers
│   ├── routes/                  # Express route routers
│   ├── utils/                   # Status and days-remaining calculations
│   ├── validators/              # Zod schemas
│   ├── index.js                 # Server entrypoint
│   └── package.json
│
├── supabase/
│   └── schema.sql               # PostgreSQL DDL, Indexes, and RLS policies
│
├── .env.example
├── package.json                 # Root script runner (concurrently)
└── README.md
```
