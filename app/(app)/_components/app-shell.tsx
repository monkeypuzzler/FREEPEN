"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  FileText,
  ScanLine,
  CheckSquare,
  Download,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  disabled?: boolean;
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/examinees", label: "Examinees", icon: Users },
  { href: "/exams", label: "Exam Templates", icon: FileText, disabled: true, badge: "Soon" },
  { href: "/scans", label: "Scanned Pages", icon: ScanLine, disabled: true, badge: "Soon" },
  { href: "/marking", label: "Marking", icon: CheckSquare, disabled: true, badge: "Soon" },
  { href: "/export", label: "Export", icon: Download, disabled: true, badge: "Soon" },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; username: string };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.name ?? "E")
    .split(" ")
    .map((s) => s?.[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-accent"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold text-sm">
                EM
              </div>
              <span className="font-display font-semibold tracking-tight hidden sm:inline">
                Exam Manager
              </span>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-accent px-2 py-1 transition">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                  {initials || "EM"}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-medium">{user?.name ?? "Examiner"}</div>
                  <div className="text-xs text-muted-foreground">@{user?.username ?? ""}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-6 md:py-10 grid md:grid-cols-[220px_1fr] gap-6 md:gap-10">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1">
            {NAV.map((item) => {
              const active = !item.disabled && (pathname === item.href || pathname?.startsWith(item.href + "/"));
              const Icon = item.icon;
              const inner = (
                <span
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent text-foreground/80",
                    item.disabled && "opacity-60 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {item.badge}
                    </span>
                  )}
                </span>
              );
              return item.disabled ? (
                <div key={item.href} aria-disabled>{inner}</div>
              ) : (
                <Link key={item.href} href={item.href}>{inner}</Link>
              );
            })}
          </nav>
        </aside>

        {mobileOpen && (
          <div className="md:hidden col-span-full bg-card rounded-xl shadow-md p-3 -mt-2">
            <nav className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = !item.disabled && (pathname === item.href || pathname?.startsWith(item.href + "/"));
                const inner = (
                  <span
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                      item.disabled && "opacity-60"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </span>
                );
                return item.disabled ? (
                  <div key={item.href}>{inner}</div>
                ) : (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{inner}</Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
