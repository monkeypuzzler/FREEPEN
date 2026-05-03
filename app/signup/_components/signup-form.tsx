"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail, Lock, User, AtSign } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create account.");
        toast.error("Sign up failed", { description: data?.error });
        return;
      }
      toast.success("Account created — signing you in…");
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!signInRes || signInRes.error) {
        toast.error("Could not auto sign-in", { description: "Please log in manually." });
        router.replace("/login");
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <div className="relative">
          <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" placeholder="Jane Smith" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <AtSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="pl-10" placeholder="jsmith" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@school.edu" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" placeholder="At least 8 characters" autoComplete="new-password" />
        </div>
        <p className="text-xs text-muted-foreground">Use at least 8 characters — mix of letters, numbers and symbols recommended.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create account
      </Button>
    </form>
  );
}
