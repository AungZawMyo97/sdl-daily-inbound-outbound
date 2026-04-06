"use client";

import { Trash2, ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  amount: string;
  type: "IN" | "OUT";
  currency: "MMK" | "THB";
  description: string | null;
  date: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit?: (tx: Transaction) => void;
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  const isMMK = currency === "MMK";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isMMK ? 0 : 2,
    maximumFractionDigits: isMMK ? 0 : 2,
  }).format(num) + ` ${currency}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionList({ transactions, loading, onDelete, onEdit }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ArrowDownLeft className="mb-3 h-10 w-10 opacity-30" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="group transition-colors hover:bg-muted/20"
            >
              <TableCell>
                <Badge
                  variant="outline"
                  className={`gap-1 ${
                    tx.type === "IN"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {tx.type === "IN" ? (
                    <ArrowDownLeft className="h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell className="font-mono font-medium">
                <span className={tx.type === "IN" ? "text-emerald-400" : "text-rose-400"}>
                  {tx.type === "IN" ? "+" : "-"}{formatAmount(tx.amount, tx.currency)}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {tx.description || "—"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {formatDate(tx.date)}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(tx)}
                    className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(tx.id)}
                  className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
