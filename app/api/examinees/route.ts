import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const className = searchParams.get("class")?.trim();

  const examinees = await prisma.examinee.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { studentId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        className ? { className: { equals: className } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, fullName: true, username: true } },
    },
  });
  return NextResponse.json({ examinees });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const studentId = String(body?.studentId ?? "").trim();
    const className = body?.className ? String(body.className).trim() : null;

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!studentId) return NextResponse.json({ error: "Student ID is required." }, { status: 400 });

    const dup = await prisma.examinee.findUnique({ where: { studentId } });
    if (dup) {
      return NextResponse.json({ error: `Student ID '${studentId}' already exists.` }, { status: 409 });
    }

    const examinee = await prisma.examinee.create({
      data: {
        name,
        studentId,
        className: className || null,
        createdById: (session.user as any).id,
      },
    });
    return NextResponse.json({ examinee }, { status: 201 });
  } catch (err: any) {
    console.error("Create examinee error:", err);
    return NextResponse.json({ error: "Failed to create examinee." }, { status: 500 });
  }
}
