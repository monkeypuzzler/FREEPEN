import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ExamineeForm } from "../_components/examinee-form";

export const dynamic = "force-dynamic";

export default function NewExamineePage() {
  return (
    <div className="space-y-6 max-w-xl">
      <Link href="/examinees" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to examinees
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Add examinee</h1>
        <p className="mt-1 text-muted-foreground">Create a single examinee record manually.</p>
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <ExamineeForm mode="create" />
      </div>
    </div>
  );
}
