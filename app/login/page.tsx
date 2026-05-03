import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./_components/login-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex hero-gradient flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">EM</div>
          <span className="font-display font-semibold tracking-tight text-lg">Exam Manager</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Welcome back.</h2>
          <p className="mt-3 text-muted-foreground max-w-sm">Sign in to continue managing your examinees and exam workflow.</p>
        </div>
        <div className="text-xs text-muted-foreground">Designed for schools — your data stays on your network.</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter your credentials to access the dashboard.</p>
          <LoginForm />
          <p className="text-sm text-muted-foreground text-center mt-6">
            New here? <Link href="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
