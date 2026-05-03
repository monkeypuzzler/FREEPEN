"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface Props {
  mode: "create" | "edit";
  initial?: { id: string; name: string; studentId: string; className: string | null };
}

export function ExamineeForm({ mode, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [studentId, setStudentId] = useState(initial?.studentId ?? "");
  const [className, setClassName] = useState(initial?.className ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Full name is required.");
    if (!studentId.trim()) return setError("Student ID is required.");
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        studentId: studentId.trim(),
        className: className.trim() || null,
      };
      const res = await fetch(
        mode === "create" ? "/api/examinees" : `/api/examinees/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Failed to save examinee.");
        toast.error("Could not save", { description: json?.error });
        return;
      }
      toast.success(mode === "create" ? "Examinee created" : "Changes saved");
      router.push("/examinees");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Patel" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="studentId">Student ID <span className="text-destructive">*</span></Label>
        <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU2026-001" required className="font-mono" />
        <p className="text-xs text-muted-foreground">Must be unique across the system.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="className">Class / Group <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. Year 11A" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Create examinee" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/examinees")} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
