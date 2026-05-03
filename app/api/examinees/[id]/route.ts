import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const examinee = await prisma.examinee.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { id: true, fullName: true, username: true } } },
  });
  if (!examinee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ examinee });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const name = body?.name !== undefined ? String(body.name).trim() : undefined;
    const studentId = body?.studentId !== undefined ? String(body.studentId).trim() : undefined;
    const className = body?.className !== undefined
      ? (body.className ? String(body.className).trim() : null)
      : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    if (studentId !== undefined && !studentId) {
      return NextResponse.json({ error: "Student ID cannot be empty." }, { status: 400 });
    }

    if (studentId) {
      const dup = await prisma.examinee.findFirst({
        where: { studentId, NOT: { id: params.id } },
      });
      if (dup) {
        return NextResponse.json(
          { error: `Student ID '${studentId}' already exists.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.examinee.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(studentId !== undefined ? { studentId } : {}),
        ...(className !== undefined ? { className } : {}),
      },
    });
    return NextResponse.json({ examinee: updated });
  } catch (err: any) {
    console.error("Update examinee error:", err);
    return NextResponse.json({ error: "Failed to update examinee." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.examinee.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete examinee error:", err);
    return NextResponse.json({ error: "Failed to delete examinee." }, { status: 500 });
  }
}
