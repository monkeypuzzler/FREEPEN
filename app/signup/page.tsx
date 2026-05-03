import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignupForm } from "./_components/signup-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
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
          <h2 className="font-display text-3xl font-bold tracking-tight">Join your school's workspace.</h2>
          <p className="mt-3 text-muted-foreground max-w-sm">Create an examiner account to start managing examinees and exams.</p>
        </div>
        <div className="text-xs text-muted-foreground">Passwords are securely hashed — we never store them in plain text.</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-8">All fields are required.</p>
          <SignupForm />
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already a member? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
