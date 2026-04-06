"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CurrencySwitcherProps {
  value: "MMK" | "THB";
  onChange: (currency: "MMK" | "THB") => void;
}

export function CurrencySwitcher({ value, onChange }: CurrencySwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as "MMK" | "THB")}>
      <TabsList className="grid w-full max-w-xs grid-cols-2">
        <TabsTrigger
          value="MMK"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          🇲🇲 MMK
        </TabsTrigger>
        <TabsTrigger
          value="THB"
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          🇹🇭 THB
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
