"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseMonthValue(value: string): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  const now = new Date();

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  }

  return { year, month };
}

function formatMonthValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function MonthSelector({
  id,
  label,
  value,
  onChange,
}: MonthSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseMonthValue(value), [value]);
  const [visibleYear, setVisibleYear] = useState(selected.year);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const selectedLabel = `${MONTHS[selected.month - 1]} ${selected.year}`;

  function handleSelectMonth(month: number) {
    onChange(formatMonthValue(visibleYear, month));
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Label htmlFor={id}>{label}</Label>
      <Button
        id={id}
        type="button"
        variant="outline"
        size="lg"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((current) => {
            if (!current) {
              setVisibleYear(selected.year);
            }

            return !current;
          });
        }}
        className="w-44 justify-start gap-2 font-normal"
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{selectedLabel}</span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={`${label} picker`}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 sm:left-auto"
        >
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous year"
              onClick={() => setVisibleYear((year) => year - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-mono text-sm font-bold">{visibleYear}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next year"
              onClick={() => setVisibleYear((year) => year + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((monthName, index) => {
              const month = index + 1;
              const isSelected =
                selected.year === visibleYear && selected.month === month;

              return (
                <Button
                  key={monthName}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSelectMonth(month)}
                  className={cn(
                    "h-8 justify-center",
                    !isSelected && "text-muted-foreground",
                  )}
                >
                  {monthName}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
