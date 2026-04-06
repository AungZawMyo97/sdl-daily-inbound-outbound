"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function TrackerPage() {
  const [currency, setCurrency] = useState<"MMK" | "THB">("MMK");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Transaction deleted");
        fetchTransactions();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch {
      toast.error("Network error");
    }
  }

  function handleSuccess() {
    toast.success("Transaction added");
    fetchTransactions();
  }

  function handleEditSuccess() {
    toast.success("Transaction updated");
    fetchTransactions();
  }

  const totalIn = transactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalOut = transactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

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
                  ({transactions.length} records)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions}
                loading={loading}
                onDelete={handleDelete}
                onEdit={setEditingTransaction}
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
