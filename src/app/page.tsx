"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NavBar } from "@/components/nav-bar";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
import { BalanceDisplay } from "@/components/balance-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Transaction {
  id: number;
  amount: string;
  type: "IN" | "OUT";
  currency: "MMK" | "THB";
  description: string | null;
  date: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function TrackerPage() {
  const [currency, setCurrency] = useState<"MMK" | "THB">("MMK");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Track current currency to avoid stale closures
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const fetchTransactions = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(
        `/api/transactions?currency=${currencyRef.current}&page=${pageNum}&limit=${PAGE_SIZE}`
      );
      if (res.ok) {
        const result = await res.json();
        if (append) {
          setTransactions((prev) => [...prev, ...result.data]);
        } else {
          setTransactions(result.data);
        }
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
        setTotalIn(result.totalIn);
        setTotalOut(result.totalOut);
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset and reload when currency changes
  useEffect(() => {
    setPage(1);
    setTransactions([]);
    fetchTransactions(1, false);
  }, [currency, fetchTransactions]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Transaction deleted");
        // Reset to page 1 and reload
        setPage(1);
        fetchTransactions(1, false);
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch {
      toast.error("Network error");
    }
  }

  function handleSuccess() {
    toast.success("Transaction added");
    // Reset to page 1 and reload so the new transaction shows at top
    setPage(1);
    fetchTransactions(1, false);
  }

  function handleEditSuccess() {
    toast.success("Transaction updated");
    // Reset to page 1 and reload
    setPage(1);
    fetchTransactions(1, false);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction Tracker</h1>
            <p className="text-sm text-muted-foreground">Record and track your daily inbound & outbound</p>
          </div>
          <CurrencySwitcher value={currency} onChange={setCurrency} />
        </div>

        <BalanceDisplay totalIn={totalIn} totalOut={totalOut} currency={currency} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-border/40">
            <CardHeader>
              <CardTitle className="text-base">New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm currency={currency} onSuccess={handleSuccess} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/40">
            <CardHeader>
              <CardTitle className="text-base">
                {currency} Transactions
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({totalCount} records)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                totalCount={totalCount}
                onDelete={handleDelete}
                onEdit={setEditingTransaction}
                onLoadMore={handleLoadMore}
              />
            </CardContent>
          </Card>
        </div>

        <TransactionEditDialog
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onSuccess={handleEditSuccess}
        />
      </main>
    </div>
  );
}
