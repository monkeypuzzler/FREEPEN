import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { ExamineesTable } from "./_components/examinees-table";

export const dynamic = "force-dynamic";

export default function ExamineesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Examinees</h1>
          <p className="mt-1 text-muted-foreground">Manage the students who will sit your exams.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/examinees/import">
            <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Import CSV</Button>
          </Link>
          <Link href="/examinees/new">
            <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Add examinee</Button>
          </Link>
        </div>
      </div>

      <ExamineesTable />
    </div>
  );
}
