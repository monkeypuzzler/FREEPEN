import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CsvImporter } from "./_components/csv-importer";

export const dynamic = "force-dynamic";

export default function ImportExamineesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/examinees" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to examinees
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Bulk import examinees</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a CSV with the headers <span className="font-mono text-foreground">name, student_id, class</span>. Preview before confirming.
        </p>
      </div>
      <CsvImporter />
    </div>
  );
}
