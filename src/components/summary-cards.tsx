"use client";

import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardsProps {
  totals: {
    mmkIn: number;
    mmkOut: number;
    mmkNet: number;
    thbIn: number;
    thbOut: number;
    thbNet: number;
  };
}

function formatNumber(num: number, currency: string): string {
  const isMMK = currency === "MMK";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isMMK ? 0 : 2,
    maximumFractionDigits: isMMK ? 0 : 2,
  }).format(num);
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const cards = [
    {
      title: "MMK Inbound",
      value: totals.mmkIn,
      currency: "MMK",
      icon: ArrowDownLeft,
      color: "emerald",
      prefix: "+",
    },
    {
      title: "MMK Outbound",
      value: totals.mmkOut,
      currency: "MMK",
      icon: ArrowUpRight,
      color: "rose",
      prefix: "-",
    },
    {
      title: "MMK Net",
      value: totals.mmkNet,
      currency: "MMK",
      icon: totals.mmkNet >= 0 ? TrendingUp : TrendingDown,
      color: totals.mmkNet >= 0 ? "emerald" : "rose",
      prefix: totals.mmkNet >= 0 ? "+" : "",
    },
    {
      title: "THB Inbound",
      value: totals.thbIn,
      currency: "THB",
      icon: ArrowDownLeft,
      color: "emerald",
      prefix: "+",
    },
    {
      title: "THB Outbound",
      value: totals.thbOut,
      currency: "THB",
      icon: ArrowUpRight,
      color: "rose",
      prefix: "-",
    },
    {
      title: "THB Net",
      value: totals.thbNet,
      currency: "THB",
      icon: totals.thbNet >= 0 ? TrendingUp : TrendingDown,
      color: totals.thbNet >= 0 ? "emerald" : "rose",
      prefix: totals.thbNet >= 0 ? "+" : "",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isEmerald = card.color === "emerald";

        return (
          <Card
            key={card.title}
            className={`transition-all hover:scale-[1.02] ${
              isEmerald
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-rose-500/20 bg-rose-500/5"
            }`}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                {card.title}
                <Icon
                  className={`h-4 w-4 ${
                    isEmerald ? "text-emerald-400" : "text-rose-400"
                  }`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <p
                className={`font-mono text-base font-bold ${
                  isEmerald ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {card.prefix}{formatNumber(Math.abs(card.value), card.currency)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.currency}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
