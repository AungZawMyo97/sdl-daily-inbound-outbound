"use client";

import { useState, useEffect, useCallback } from "react";
import { NavBar } from "@/components/nav-bar";
import { SummaryCards } from "@/components/summary-cards";
import { MonthlyTable } from "@/components/monthly-table";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlySummary {
  month: number;
  year: number;
  mmkIn: number;
  mmkOut: number;
  mmkNet: number;
  thbIn: number;
  thbOut: number;
  thbNet: number;
}

interface SummaryData {
  year: number;
  monthly: MonthlySummary[];
  totals: {
    mmkIn: number;
    mmkOut: number;
    mmkNet: number;
    thbIn: number;
    thbOut: number;
    thbNet: number;
  };
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [tableCurrency, setTableCurrency] = useState<"MMK" | "THB">("MMK");
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/summary?year=${year}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Yearly overview of your inbound & outbound
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setYear((y) => y - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-16 text-center font-mono font-bold">
              {year}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        ) : data ? (
          <>
            <SummaryCards totals={data.totals} />

            <Card className="border-border/40">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  Monthly Breakdown — {year}
                </CardTitle>
                <CurrencySwitcher value={tableCurrency} onChange={setTableCurrency} />
              </CardHeader>
              <CardContent>
                <MonthlyTable data={data.monthly} currency={tableCurrency} />
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BarChart3 className="mb-3 h-10 w-10 opacity-30" />
            <p>Failed to load summary data</p>
          </div>
        )}
      </main>
    </div>
  );
}
