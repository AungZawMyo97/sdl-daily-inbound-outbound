"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

interface Transaction {
  id: number;
  amount: string;
  type: "IN" | "OUT";
  currency: "MMK" | "THB";
  description: string | null;
  date: string;
  createdAt: string;
}

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransactionEditDialog({
  transaction,
  isOpen,
  onOpenChange,
  onSuccess,
}: TransactionEditDialogProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction && isOpen) {
      setAmount(transaction.amount);
      setType(transaction.type);
      setDescription(transaction.description || "");
      setDate(new Date(transaction.date).toISOString().split("T")[0]);
      setError("");
    }
  }, [transaction, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transaction) return;
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type, description, date }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update transaction");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
            <Label htmlFor="edit-amount">Amount ({transaction.currency})</Label>
            <Input
              id="edit-amount"
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
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              placeholder="e.g. Salary, Rent, Transfer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !amount}
            className="w-full mt-4"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
