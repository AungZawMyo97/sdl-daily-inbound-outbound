"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

interface TransactionFormProps {
  currency: "MMK" | "THB";
  onSuccess: () => void;
}

export function TransactionForm({ currency, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type, currency, description, date }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create transaction");
        return;
      }

      setAmount("");
      setDescription("");
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === "IN" ? "default" : "outline"}
          className={`flex-1 gap-2 transition-all ${
            type === "IN"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              : ""
          }`}
          onClick={() => setType("IN")}
        >
          <ArrowDownLeft className="h-4 w-4" />
          Inbound
        </Button>
        <Button
          type="button"
          variant={type === "OUT" ? "default" : "outline"}
          className={`flex-1 gap-2 transition-all ${
            type === "OUT"
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              : ""
          }`}
          onClick={() => setType("OUT")}
        >
          <ArrowUpRight className="h-4 w-4" />
          Outbound
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ({currency})</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="text-lg font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="e.g. Salary, Rent, Transfer..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !amount}
        className="w-full gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Add Transaction"
        )}
      </Button>
    </form>
  );
}
