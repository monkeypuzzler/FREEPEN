import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("johndoe123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      username: "johndoe",
      fullName: "John Doe",
      passwordHash: adminPasswordHash,
    },
  });
  console.log("Seeded admin user:", admin.email);

  // Seed test user (used by automated tests)
  const testPasswordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@school.edu" },
    update: {},
    create: {
      email: "test@school.edu",
      username: "jsmith",
      fullName: "Jane Smith",
      passwordHash: testPasswordHash,
    },
  });
  console.log("Seeded test user.");

  // Sample examinees attached to admin
  const sample = [
    { name: "Alice Johnson", studentId: "STU001", className: "Year 11A" },
    { name: "Ben Carter", studentId: "STU002", className: "Year 11A" },
    { name: "Chloe Davies", studentId: "STU003", className: "Year 11B" },
  ];

  for (const s of sample) {
    await prisma.examinee.upsert({
      where: { studentId: s.studentId },
      update: {},
      create: { ...s, createdById: admin.id },
    });
  }
  console.log("Seeded sample examinees.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
