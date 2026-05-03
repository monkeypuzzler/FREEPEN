import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");
    const fullName = String(body?.fullName ?? "").trim();
    const username = String(body?.username ?? "").trim().toLowerCase();

    if (!email || !password || !fullName || !username) {
      return NextResponse.json(
        { error: "All fields (email, username, full name, password) are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-32 chars (letters, digits, _ . -)." },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "This username is taken." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, fullName, passwordHash },
      select: { id: true, email: true, username: true, fullName: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
