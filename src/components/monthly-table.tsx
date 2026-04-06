"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface MonthlyTableProps {
  data: MonthlySummary[];
  currency: "MMK" | "THB";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatNumber(num: number, isMMK?: boolean): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isMMK ? 0 : 2,
    maximumFractionDigits: isMMK ? 0 : 2,
  }).format(num);
}

function NetBadge({ value, isMMK }: { value: number; isMMK?: boolean }) {
  if (value === 0) {
    return (
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
        0{isMMK ? "" : ".00"}
      </Badge>
    );
  }

  const isPositive = value > 0;
  return (
    <Badge
      variant="outline"
      className={`font-mono text-xs ${
        isPositive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-rose-500/30 bg-rose-500/10 text-rose-400"
      }`}
    >
      {isPositive ? "+" : ""}{formatNumber(value, isMMK)}
    </Badge>
  );
}

export function MonthlyTable({ data, currency }: MonthlyTableProps) {
  const hasData = data.some(
    (m) => m.mmkIn > 0 || m.mmkOut > 0 || m.thbIn > 0 || m.thbOut > 0
  );

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No data for this year</p>
      </div>
    );
  }

  const isMMK = currency === "MMK";

  return (
    <div className="rounded-lg border border-border/50 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="sticky left-0 bg-muted/30">Month</TableHead>
            <TableHead className="text-center text-emerald-400">In</TableHead>
            <TableHead className="text-center text-rose-400">Out</TableHead>
            <TableHead className="text-center">Net</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const isEmpty = row.mmkIn === 0 && row.mmkOut === 0 && row.thbIn === 0 && row.thbOut === 0;
            const cIn = isMMK ? row.mmkIn : row.thbIn;
            const cOut = isMMK ? row.mmkOut : row.thbOut;
            const cNet = isMMK ? row.mmkNet : row.thbNet;

            return (
              <TableRow
                key={row.month}
                className={`transition-colors ${isEmpty ? "opacity-40" : "hover:bg-muted/20"}`}
              >
                <TableCell className="sticky left-0 bg-background font-medium">
                  {MONTH_NAMES[row.month - 1]}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-emerald-400">
                  {cIn > 0 ? `+${formatNumber(cIn, isMMK)}` : "—"}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-rose-400">
                  {cOut > 0 ? `-${formatNumber(cOut, isMMK)}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <NetBadge value={cNet} isMMK={isMMK} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
