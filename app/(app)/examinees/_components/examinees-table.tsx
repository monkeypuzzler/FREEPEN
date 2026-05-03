"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Search, Trash2, Loader2, Users, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Examinee {
  id: string;
  name: string;
  studentId: string;
  className: string | null;
  createdAt: string;
  createdBy: { id: string; fullName: string; username: string } | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function ExamineesTable() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [classFilter, setClassFilter] = useState<string>("__all__");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const params = new URLSearchParams();
  if (debounced) params.set("q", debounced);
  if (classFilter && classFilter !== "__all__") params.set("class", classFilter);
  const url = `/api/examinees${params.toString() ? `?${params.toString()}` : ""}`;

  const { data, isLoading, mutate, error } = useSWR<{ examinees: Examinee[] }>(url, fetcher, {
    revalidateOnFocus: false,
  });

  const examinees = data?.examinees ?? [];
  const classes = useMemo(() => {
    const set = new Set<string>();
    (examinees ?? []).forEach((e) => {
      if (e?.className) set.add(e.className);
    });
    return Array.from(set).sort();
  }, [examinees]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/examinees/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Failed to delete", { description: json?.error });
        return;
      }
      toast.success("Examinee deleted");
      setPendingDeleteId(null);
      mutate();
    } finally {
      setDeleting(false);
    }
  }

  const pendingDeleteName = examinees.find((e) => e.id === pendingDeleteId)?.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or student ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 grid place-items-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-destructive">Failed to load examinees.</div>
        ) : examinees.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary grid place-items-center text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display font-semibold">No examinees yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {debounced || classFilter !== "__all__"
                ? "No results matched your filters. Try clearing them."
                : "Add your first examinee or import a CSV to get started."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/examinees/new"><Button>Add examinee</Button></Link>
              <Link href="/examinees/import"><Button variant="outline">Import CSV</Button></Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead>Date added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examinees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="font-mono text-sm">{e.studentId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.className ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.createdBy?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{formatDate(e.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/examinees/${e.id}/edit`}>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => setPendingDeleteId(e.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete examinee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{pendingDeleteName}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDeleteId) handleDelete(pendingDeleteId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
