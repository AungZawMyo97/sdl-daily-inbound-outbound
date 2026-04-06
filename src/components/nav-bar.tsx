"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            SDL Daily InOut
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Tracker</span>
          </Button>
          <Button
            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="ml-2 h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
