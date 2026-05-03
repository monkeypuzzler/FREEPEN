import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import { ExamineeForm } from "../../_components/examinee-form";

export const dynamic = "force-dynamic";

export default async function EditExamineePage({ params }: { params: { id: string } }) {
  const examinee = await prisma.examinee.findUnique({ where: { id: params.id } });
  if (!examinee) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <Link href="/examinees" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to examinees
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Edit examinee</h1>
        <p className="mt-1 text-muted-foreground">Update the details for this student.</p>
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <ExamineeForm
          mode="edit"
          initial={{
            id: examinee.id,
            name: examinee.name,
            studentId: examinee.studentId,
            className: examinee.className,
          }}
        />
      </div>
    </div>
  );
}
