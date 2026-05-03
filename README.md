# FREEPEN

## Overview
A comprehensive examination management system for UK schools, designed to digitally manage paper-based exams (upload templates → generate QR-coded papers → scan completed scripts → mark online → export results). Hobby/open-source, intended to run on school intranets via Docker.

## Roadmap
- **Increment 1 (DONE):** Foundation, auth, examinee management
- **Increment 2:** Exam template & mark-scheme upload/configuration
- **Increment 3:** Scanned page upload & management
- **Increment 4:** Marking interface (with GCSE maths mark-scheme support)
- **Increment 5:** Export functionality

## Stack
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui (components/ui/*)
- **Backend:** Next.js API routes (Note: user originally asked for Python/FastAPI, but available tooling is Next.js-only — proceeded with Next.js API routes; revisit if user insists on Python)
- **DB:** PostgreSQL via Prisma (singleton in `lib/db.ts`)
- **Auth:** NextAuth (CredentialsProvider, JWT sessions); auth options in `lib/auth.ts`
- **File storage:** AWS S3 configured (for future increments — CSV imports are parsed client-side with papaparse, not uploaded)

## Visual Style / Design
- **Brand:** "Exam Manager" with monogram "EM" badge in primary color
- **Primary color:** indigo (`hsl(262 83% 58%)`) — uses CSS-var design tokens, never hardcoded
- **Fonts:** DM Sans (body), Plus Jakarta Sans (display, `font-display`), JetBrains Mono (data/IDs)
- **Layout:** max-w-[1200px] centered everywhere; sticky header (semi-transparent backdrop blur); sidebar nav on desktop, mobile hamburger
- **Cards:** `bg-card rounded-xl shadow-sm` with hover `shadow-md` transitions; no borders, use background contrast
- **Status indicators:** emerald-600 for success, destructive for errors, primary/10 + primary text for badges

## Page Structure
- `/` — public landing (redirects to `/dashboard` if logged in)
- `/login`, `/signup` — split-screen auth pages (gradient panel + form)
- `/(app)` route group — authenticated layout with header + sidebar (`AppShell`)
  - `/dashboard` — welcome, stats (examinee counts), quick actions, roadmap
  - `/examinees` — list with search/class filter, edit/delete
  - `/examinees/new` — manual create form
  - `/examinees/[id]/edit` — edit form
  - `/examinees/import` — CSV importer (client-side parse → preview → confirm)

## API Routes
- `POST /api/signup` — create user (validates email, username, password ≥ 8)
- `/api/auth/[...nextauth]` — NextAuth handler
- `GET/POST /api/examinees` — list (with `?q=` search and `?class=` filter) / create
- `GET/PATCH/DELETE /api/examinees/[id]` — CRUD for one
- `POST /api/examinees/bulk` — bulk import; validates duplicates in-batch and against DB; returns `{created, skipped, errors[]}`

## Database Schema (Prisma)
- **User:** id, email (unique), username (unique), fullName, passwordHash, createdAt, updatedAt
- **Examinee:** id, name, studentId (unique), className (nullable), createdById → User, timestamps; `onDelete: Restrict` to protect attribution
- All sensitive routes guarded by `getServerSession(authOptions)` returning 401 when missing.

## Conventions / Important Rules
- All API route files use `export const dynamic = "force-dynamic"`
- Sidebar nav items for future increments are rendered as disabled with "Soon" badges (FileText/ScanLine/CheckSquare/Download)
- Seed script (`scripts/seed.ts`) seeds: admin (john@doe.com / johndoe123), test user (test@school.edu / password123 — required by automated tests), and 3 sample examinees. Uses `upsert` (no deletes).
- CSV import accepts headers: `name`, `student_id`, `class` (also tolerates `studentid`, `classname`, `class_group`)
- Date formatting uses `en-GB` locale.