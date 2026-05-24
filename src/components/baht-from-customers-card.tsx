"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthSelector } from "@/components/month-selector";

interface BahtFromCustomersCardProps {
  thbInbound: number;
  mmkOutbound: number;
  monthValue: string;
  onMonthChange: (value: string) => void;
  loading?: boolean;
}

function formatAmount(amount: number, currency: "MMK" | "THB"): string {
  const isMMK = currency === "MMK";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isMMK ? 0 : 2,
    maximumFractionDigits: isMMK ? 0 : 2,
  }).format(amount);
}

export function BahtFromCustomersCard({
  thbInbound,
  mmkOutbound,
  monthValue,
  onMonthChange,
  loading = false,
}: BahtFromCustomersCardProps) {
  return (
    <Card className="overflow-visible border-border/40">
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Baht From Customers</CardTitle>
        <MonthSelector
          id="customer-baht-month"
          label="Month"
          value={monthValue}
          onChange={onMonthChange}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Inbound THB</p>
              {loading ? (
                <Skeleton className="mt-1 h-7 w-32" />
              ) : (
                <p className="truncate font-mono text-lg font-bold text-emerald-400">
                  {formatAmount(thbInbound, "THB")}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    THB
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
              <ArrowUpRight className="h-5 w-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">MMK Equivalent</p>
              {loading ? (
                <Skeleton className="mt-1 h-7 w-36" />
              ) : (
                <p className="truncate font-mono text-lg font-bold text-rose-400">
                  {formatAmount(mmkOutbound, "MMK")}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    MMK
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
