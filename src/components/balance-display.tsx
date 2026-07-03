"use client";

import { ArrowDownLeft, ArrowUpRight, History, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BalanceDisplayProps {
  totalIn: number;
  totalOut: number;
  currency: "MMK" | "THB";
  yesterdayNet?: number;
  overallNet?: number;
}

function formatNumber(num: number, currency: string): string {
  const isMMK = currency === "MMK";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isMMK ? 0 : 2,
    maximumFractionDigits: isMMK ? 0 : 2,
  }).format(num);
}

export function BalanceDisplay({
  totalIn,
  totalOut,
  currency,
  yesterdayNet,
  overallNet,
}: BalanceDisplayProps) {
  const hasYesterdayNet = typeof yesterdayNet === "number";
  const isYesterdayPositive = (yesterdayNet ?? 0) >= 0;
  const hasOverallNet = typeof overallNet === "number";
  const isOverallPositive = (overallNet ?? 0) >= 0;

  const gridCols =
    hasYesterdayNet && hasOverallNet
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : hasYesterdayNet || hasOverallNet
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 gap-3 ${gridCols}`}>
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Monthly Inbound</p>
            <p className="truncate font-mono text-lg font-bold text-emerald-400">
              +{formatNumber(totalIn, currency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {currency}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
            <ArrowUpRight className="h-5 w-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Monthly Outbound</p>
            <p className="truncate font-mono text-lg font-bold text-rose-400">
              -{formatNumber(totalOut, currency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {currency}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {hasYesterdayNet && (
        <Card
          className={`${
            isYesterdayPositive
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-rose-500/20 bg-rose-500/5"
          }`}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isYesterdayPositive ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              <History
                className={`h-5 w-5 ${
                  isYesterdayPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Yesterday&apos;s Balance
              </p>
              <p
                className={`truncate font-mono text-lg font-bold ${
                  isYesterdayPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isYesterdayPositive ? "+" : ""}
                {formatNumber(yesterdayNet, currency)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {currency}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasOverallNet && (
        <Card
          className={`${
            isOverallPositive
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-rose-500/20 bg-rose-500/5"
          }`}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isOverallPositive ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              <Wallet
                className={`h-5 w-5 ${
                  isOverallPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Overall Net Balance
              </p>
              <p
                className={`truncate font-mono text-lg font-bold ${
                  isOverallPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isOverallPositive ? "+" : ""}
                {formatNumber(overallNet, currency)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {currency}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
