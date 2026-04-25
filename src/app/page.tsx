"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NavBar } from "@/components/nav-bar";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
import { BalanceDisplay } from "@/components/balance-display";
import { ReportDownload } from "@/components/report-download";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  todayLocalDateString,
  currentMonth,
  currentYear,
} from "@/lib/timezone";

interface Transaction {
  id: number;
  amount: string;
  type: "IN" | "OUT";
  currency: "MMK" | "THB";
  description: string | null;
  date: string;
  createdAt: string;
  bahtRefill?: boolean;
}

const PAGE_SIZE = 10;

export default function TrackerPage() {
  const [currency, setCurrency] = useState<"MMK" | "THB">("MMK");
  const [selectedDate, setSelectedDate] = useState(todayLocalDateString());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [monthlyTotals, setMonthlyTotals] = useState({
    mmkIn: 0,
    mmkOut: 0,
    mmkNet: 0,
    thbIn: 0,
    thbOut: 0,
    thbNet: 0,
  });
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refillDate, setRefillDate] = useState(todayLocalDateString());
  const [bahtRefillTransactions, setBahtRefillTransactions] = useState<
    Transaction[]
  >([]);
  const [bahtRefillLoading, setBahtRefillLoading] = useState(false);
  const [bahtRefillTotals, setBahtRefillTotals] = useState({ MMK: 0, THB: 0 });

  const refillDateRef = useRef(refillDate);
  refillDateRef.current = refillDate;

  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  const fetchTransactions = useCallback(
    async (pageNum: number, append: boolean = false, dateOverride?: string) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const date = dateOverride ?? selectedDateRef.current;
        const res = await fetch(
          `/api/transactions?currency=${currencyRef.current}&date=${date}&page=${pageNum}&limit=${PAGE_SIZE}`,
        );
        if (res.ok) {
          const result = await res.json();
          setTransactions((prev) =>
            append ? [...prev, ...result.data] : result.data,
          );
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
    },
    [],
  );

  const fetchBahtRefillTransactions = useCallback(async (date: string) => {
    setBahtRefillLoading(true);
    try {
      const res = await fetch(`/api/transactions?date=${date}&bahtRefill=true`);
      if (res.ok) {
        const result = await res.json();
        const mmkTotal = result.data
          .filter((t: Transaction) => t.currency === "MMK")
          .reduce(
            (sum: number, t: Transaction) => sum + parseFloat(t.amount),
            0,
          );
        const thbTotal = result.data
          .filter((t: Transaction) => t.currency === "THB")
          .reduce(
            (sum: number, t: Transaction) => sum + parseFloat(t.amount),
            0,
          );

        setBahtRefillTransactions(result.data);
        setBahtRefillTotals({ MMK: mmkTotal, THB: thbTotal });
      }
    } catch {
      toast.error("Failed to load baht refill transactions");
    } finally {
      setBahtRefillLoading(false);
    }
  }, []);

  const fetchMonthlyTotals = useCallback(async () => {
    try {
      const today = new Date(todayLocalDateString());
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const res = await fetch(
        `/api/transactions/monthly-summary?month=${month}&year=${year}`,
      );
      if (res.ok) {
        const result = await res.json();
        setMonthlyTotals(result.totals);
      }
    } catch {
      toast.error("Failed to load monthly totals");
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setTransactions([]);
    fetchTransactions(1, false);
  }, [selectedDate, fetchTransactions]);

  useEffect(() => {
    setPage(1);
    setTransactions([]);
    fetchTransactions(1, false);
  }, [currency, fetchTransactions]);

  useEffect(() => {
    fetchBahtRefillTransactions(refillDate);
  }, [refillDate, fetchBahtRefillTransactions]);

  useEffect(() => {
    fetchMonthlyTotals();
  }, [fetchMonthlyTotals]);

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
        setPage(1);
        fetchTransactions(1, false);
        fetchMonthlyTotals();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch {
      toast.error("Network error");
    }
  }

  function handleSuccess() {
    const today = todayLocalDateString();
    setSelectedDate(today);
    setPage(1);
    setTransactions([]);
    fetchTransactions(1, false, today);
    fetchBahtRefillTransactions(refillDateRef.current);
    fetchMonthlyTotals();
    toast.success("Transaction added");
  }

  function handleEditSuccess() {
    toast.success("Transaction updated");
    setPage(1);
    fetchTransactions(1, false);
    fetchBahtRefillTransactions(refillDateRef.current);
    fetchMonthlyTotals();
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Transaction Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Record and track your daily inbound & outbound
            </p>
          </div>
          <CurrencySwitcher value={currency} onChange={setCurrency} />
        </div>

        <BalanceDisplay
          totalIn={
            currency === "MMK" ? monthlyTotals.mmkIn : monthlyTotals.thbIn
          }
          totalOut={
            currency === "MMK" ? monthlyTotals.mmkOut : monthlyTotals.thbOut
          }
          currency={currency}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-base">New Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm
                  currency={currency}
                  onSuccess={handleSuccess}
                />
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-base">Monthly Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportDownload />
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2 border-border/40">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
              <div>
                <CardTitle className="text-base">
                  {currency} Transactions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Label htmlFor="tracker-date">Date</Label>
                <Input
                  id="tracker-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 w-40"
                />
              </div>
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

        <Card className="border-border/40">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Baht Refill Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Filter by refill date separately from tracker date
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label htmlFor="refill-date">Date</Label>
              <Input
                id="refill-date"
                type="date"
                value={refillDate}
                onChange={(e) => setRefillDate(e.target.value)}
                className="h-9 w-40"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="MMK" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="MMK">MMK</TabsTrigger>
                <TabsTrigger value="THB">THB</TabsTrigger>
              </TabsList>

              <TabsContent value="MMK" className="space-y-4">
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {bahtRefillLoading
                      ? "Loading..."
                      : `Total MMK Refills: ${bahtRefillTotals.MMK.toFixed(2)} MMK`}
                  </p>
                  {bahtRefillTransactions.filter((t) => t.currency === "MMK")
                    .length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bahtRefillTransactions
                          .filter((t) => t.currency === "MMK")
                          .map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {transaction.description || "No description"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {transaction.amount} MMK
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-sm">
                                {new Date(transaction.date).toLocaleDateString(
                                  "en-US",
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    !bahtRefillLoading && (
                      <p className="text-sm text-muted-foreground text-center">
                        No MMK baht refill transactions
                      </p>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="THB" className="space-y-4">
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {bahtRefillLoading
                      ? "Loading..."
                      : `Total THB Refills: ${bahtRefillTotals.THB.toFixed(2)} THB`}
                  </p>
                  {bahtRefillTransactions.filter((t) => t.currency === "THB")
                    .length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bahtRefillTransactions
                          .filter((t) => t.currency === "THB")
                          .map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {transaction.description || "No description"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {transaction.amount} THB
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-sm">
                                {new Date(transaction.date).toLocaleDateString(
                                  "en-US",
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    !bahtRefillLoading && (
                      <p className="text-sm text-muted-foreground text-center">
                        No THB baht refill transactions
                      </p>
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
