import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  ScanLine,
  CheckSquare,
  Download,
  ArrowRight,
  PlusCircle,
  Upload,
  Hourglass,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const [examineeCount, myExamineeCount] = await Promise.all([
    prisma.examinee.count(),
    userId ? prisma.examinee.count({ where: { createdById: userId } }) : Promise.resolve(0),
  ]);

  const firstName = (session?.user?.name ?? "there").split(" ")[0];

  const futureFeatures = [
    { icon: FileText, label: "Exam Templates", desc: "Upload exam papers and configure mark schemes.", soon: "Increment 2" },
    { icon: ScanLine, label: "Scanned Pages", desc: "Upload and manage scanned answer scripts.", soon: "Increment 3" },
    { icon: CheckSquare, label: "Marking", desc: "Mark scripts on screen with mark scheme support.", soon: "Increment 4" },
    { icon: Download, label: "Export", desc: "Export marks and reports for analysis.", soon: "Increment 5" },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">{firstName}</span>.
        </h1>
        <p className="mt-2 text-muted-foreground">Manage examinees and prepare for upcoming exam sessions.</p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Examinees in system" value={examineeCount} />
        <StatCard icon={Users} label="Added by you" value={myExamineeCount} />
        <StatCard icon={Hourglass} label="Awaiting features" value={4} hint="Templates, Scanning, Marking, Export" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">Quick actions</h2>
          <Link href="/examinees">
            <Button variant="ghost" className="gap-1">View all examinees <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <ActionCard href="/examinees/new" icon={PlusCircle} title="Add examinee" body="Create a new examinee record manually." />
          <ActionCard href="/examinees/import" icon={Upload} title="Bulk import" body="Upload a CSV to import examinees in bulk." />
          <ActionCard href="/examinees" icon={Users} title="Manage examinees" body="Search, edit, and delete existing records." />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-tight mb-4">Roadmap</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {futureFeatures.map((f) => (
            <div key={f.label} className="bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary text-secondary-foreground grid place-items-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-display font-semibold">{f.label}</div>
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {f.soon}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint?: string }) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-3 font-display text-3xl font-bold tracking-tight font-mono">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function ActionCard({ href, icon: Icon, title, body }: { href: string; icon: any; title: string; body: string }) {
  return (
    <Link href={href} className="group block bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
      </div>
      <div className="mt-3 font-display font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{body}</div>
    </Link>
  );
}
