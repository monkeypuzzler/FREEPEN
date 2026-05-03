import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardCheck, QrCode, ScanLine, Users, GraduationCap, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">EM</div>
            <span className="font-display font-semibold tracking-tight text-lg">Exam Manager</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link href="/signup"><Button>Create account</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient">
        <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium mb-6">
              <ShieldCheck className="h-3.5 w-3.5" /> Built for UK schools — runs on your network
            </div>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-[1.05] font-bold">
              Paper exams, <span className="text-primary">digitally</span> managed.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              From examinee enrolment to QR-coded papers, scanned scripts and online marking — Exam Manager streamlines the whole exam workflow for teachers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="gap-2">Get started <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">I already have an account</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-card p-6 shadow-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Examinees", value: "Manage rosters" },
                  { icon: ClipboardCheck, label: "Templates", value: "Coming soon" },
                  { icon: QrCode, label: "QR Papers", value: "Coming soon" },
                  { icon: ScanLine, label: "Scanning", value: "Coming soon" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-secondary/60 p-4">
                    <item.icon className="h-5 w-5 text-primary" />
                    <div className="mt-3 font-display font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Increment 1 features */}
      <section className="bg-secondary/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="font-display text-3xl tracking-tight font-bold mb-2">Available today</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">Increment 1 lays the foundation: secure accounts and a robust examinee register your school can trust.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Secure accounts", body: "Hashed passwords, session-based login, and per-teacher attribution on every record." },
              { icon: Users, title: "Examinee register", body: "Add students one-by-one or import in bulk via CSV with full validation and previews." },
              { icon: GraduationCap, title: "Built for teachers", body: "Clean, fast UI designed for the realities of running exams in a busy school." },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center text-primary mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Exam Manager — open-source for schools</div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
