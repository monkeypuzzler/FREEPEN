"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search?.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (!res || res.error) {
        setError("Invalid email or password.");
        toast.error("Sign in failed", { description: "Check your email and password." });
        return;
      }
      toast.success("Welcome back!");
      router.replace(callbackUrl);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@school.edu" autoComplete="email" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" placeholder="••••••••" autoComplete="current-password" />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Sign in
      </Button>
    </form>
  );
}
