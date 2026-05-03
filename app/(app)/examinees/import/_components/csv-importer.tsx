"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";

interface ParsedRow {
  row: number;
  name: string;
  studentId: string;
  className: string | null;
  errors: string[];
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: { row: number; studentId?: string; reason: string }[];
}

function normalizeKey(k: string) {
  return k.toLowerCase().trim().replace(/[\s-]+/g, "_");
}

export function CsvImporter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setFileName(null);
    setRows([]);
    setParseError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFile(file: File) {
    setParseError(null);
    setResult(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => normalizeKey(h),
      complete: (results) => {
        const data = results.data ?? [];
        const seen = new Map<string, number>();
        const parsed: ParsedRow[] = data.map((r, idx) => {
          const name = String(r?.name ?? "").trim();
          const studentId = String(
            (r?.student_id ?? r?.studentid ?? "") as string
          ).trim();
          const className =
            String((r?.class ?? r?.classname ?? r?.class_group ?? "") as string).trim() || null;
          const errors: string[] = [];
          if (!name) errors.push("Missing name");
          if (!studentId) errors.push("Missing student_id");
          if (studentId) {
            if (seen.has(studentId)) {
              errors.push(`Duplicate of row ${seen.get(studentId)}`);
            } else {
              seen.set(studentId, idx + 1);
            }
          }
          return { row: idx + 1, name, studentId, className, errors };
        });
        if (parsed.length === 0) {
          setParseError("No data rows were found in the CSV.");
        }
        setRows(parsed);
      },
      error: (err) => {
        setParseError(err?.message || "Failed to parse CSV");
      },
    });
  }

  async function handleImport() {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch("/api/examinees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: valid.map((r) => ({
            name: r.name,
            studentId: r.studentId,
            className: r.className,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Import failed", { description: json?.error });
        return;
      }
      const out: ImportResult = json.results;
      setResult(out);
      if (out.created > 0) {
        toast.success(`Imported ${out.created} examinee${out.created === 1 ? "" : "s"}`);
        router.refresh();
      } else {
        toast.warning("No new examinees were imported");
      }
    } finally {
      setImporting(false);
    }
  }

  function downloadSample() {
    const csv = "name,student_id,class\nAlice Johnson,STU2026-001,Year 11A\nBen Carter,STU2026-002,Year 11A\nChloe Davies,STU2026-003,Year 11B\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "examinees-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="space-y-6">
      {!rows.length && !result && (
        <div className="bg-card rounded-xl p-8 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Choose your CSV file</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Required headers: <span className="font-mono">name, student_id, class</span>
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="flex gap-2">
              <Button onClick={() => inputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" /> Select CSV file
              </Button>
              <Button variant="outline" onClick={downloadSample}>Download sample</Button>
            </div>
            {parseError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {parseError}
              </p>
            )}
          </div>
        </div>
      )}

      {rows.length > 0 && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm">
              <div className="font-medium">{fileName}</div>
              <div className="text-muted-foreground">
                {rows.length} rows · <span className="text-emerald-600">{validCount} valid</span>
                {invalidCount > 0 && <> · <span className="text-destructive">{invalidCount} invalid</span></>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Choose different file</Button>
              <Button disabled={importing || validCount === 0} onClick={handleImport} className="gap-2">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import {validCount} valid row{validCount === 1 ? "" : "s"}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[480px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.row} className={r.errors.length > 0 ? "bg-destructive/5" : undefined}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.row}</TableCell>
                      <TableCell>{r.name || <span className="text-muted-foreground italic">missing</span>}</TableCell>
                      <TableCell className="font-mono text-sm">{r.studentId || <span className="text-muted-foreground italic">missing</span>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.className ?? "—"}</TableCell>
                      <TableCell>
                        {r.errors.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" /> {r.errors.join("; ")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-card rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Import complete</h3>
              <p className="text-sm text-muted-foreground">
                Created <span className="font-mono">{result.created}</span> · Skipped <span className="font-mono">{result.skipped}</span> · Errors <span className="font-mono">{result.errors.length}</span>
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Skipped rows</div>
              <ul className="text-sm text-muted-foreground space-y-1 max-h-60 overflow-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-xs text-muted-foreground">row {e.row}</span>
                    {e.studentId && <span className="font-mono text-xs">{e.studentId}</span>}
                    <span>— {e.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => router.push("/examinees")}>Back to examinees</Button>
            <Button variant="outline" onClick={reset}>Import another file</Button>
          </div>
        </div>
      )}
    </div>
  );
}
