import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { currentYear } from "@/lib/timezone";
import { Prisma } from "@/generated/prisma/client";

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

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year") || currentYear().toString();
  const yearNum = parseInt(year);

  const startDate = new Date(yearNum, 0, 1);
  const endDate = new Date(yearNum + 1, 0, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lt: endDate },
    },
    orderBy: { date: "asc" },
  });

  const monthlyMap = new Map<number, MonthlySummary>();

  for (let m = 1; m <= 12; m++) {
    monthlyMap.set(m, {
      month: m,
      year: yearNum,
      mmkIn: 0,
      mmkOut: 0,
      mmkNet: 0,
      thbIn: 0,
      thbOut: 0,
      thbNet: 0,
    });
  }

  for (const tx of transactions) {
    const txMonth = tx.date.getMonth() + 1;
    const summary = monthlyMap.get(txMonth)!;
    const amount = new Prisma.Decimal(tx.amount).toNumber();

    if (tx.currency === "MMK") {
      if (tx.type === "IN") {
        summary.mmkIn += amount;
      } else {
        summary.mmkOut += amount;
      }
    } else {
      if (tx.type === "IN") {
        summary.thbIn += amount;
      } else {
        summary.thbOut += amount;
      }
    }
  }

  const monthly: MonthlySummary[] = [];
  for (const [, summary] of monthlyMap) {
    summary.mmkNet = summary.mmkIn - summary.mmkOut;
    summary.thbNet = summary.thbIn - summary.thbOut;
    monthly.push(summary);
  }

  const totals = {
    mmkIn: monthly.reduce((s, m) => s + m.mmkIn, 0),
    mmkOut: monthly.reduce((s, m) => s + m.mmkOut, 0),
    mmkNet: monthly.reduce((s, m) => s + m.mmkNet, 0),
    thbIn: monthly.reduce((s, m) => s + m.thbIn, 0),
    thbOut: monthly.reduce((s, m) => s + m.thbOut, 0),
    thbNet: monthly.reduce((s, m) => s + m.thbNet, 0),
  };

  return Response.json({ year: yearNum, monthly, totals });
}
