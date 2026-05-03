import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "./_components/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <AppShell
      user={{
        name: session.user.name ?? "Examiner",
        email: session.user.email ?? "",
        username: (session.user as any).username ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
