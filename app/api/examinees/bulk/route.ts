import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface BulkRow {
  name: string;
  studentId: string;
  className?: string | null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const rows: BulkRow[] = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows provided." }, { status: 400 });
    }

    const userId = (session.user as any).id as string;

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as { row: number; studentId?: string; reason: string }[],
    };

    // Sanitize and detect in-batch duplicates
    const seen = new Set<string>();
    const cleaned: { row: number; data: BulkRow }[] = [];
    rows.forEach((r, idx) => {
      const name = String(r?.name ?? "").trim();
      const studentId = String(r?.studentId ?? "").trim();
      const className = r?.className ? String(r.className).trim() : null;
      if (!name || !studentId) {
        results.errors.push({ row: idx + 1, studentId, reason: "Missing name or student_id" });
        return;
      }
      if (seen.has(studentId)) {
        results.errors.push({ row: idx + 1, studentId, reason: "Duplicate student_id within file" });
        return;
      }
      seen.add(studentId);
      cleaned.push({ row: idx + 1, data: { name, studentId, className } });
    });

    // Find existing IDs in DB
    const existing = await prisma.examinee.findMany({
      where: { studentId: { in: cleaned.map((c) => c.data.studentId) } },
      select: { studentId: true },
    });
    const existingIds = new Set(existing.map((e) => e.studentId));

    const toCreate = cleaned.filter((c) => {
      if (existingIds.has(c.data.studentId)) {
        results.errors.push({
          row: c.row,
          studentId: c.data.studentId,
          reason: "Student ID already exists",
        });
        results.skipped += 1;
        return false;
      }
      return true;
    });

    if (toCreate.length > 0) {
      const result = await prisma.examinee.createMany({
        data: toCreate.map((c) => ({
          name: c.data.name,
          studentId: c.data.studentId,
          className: c.data.className ?? null,
          createdById: userId,
        })),
        skipDuplicates: true,
      });
      results.created = result.count;
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Bulk import error:", err);
    return NextResponse.json({ error: "Failed to import examinees." }, { status: 500 });
  }
}
