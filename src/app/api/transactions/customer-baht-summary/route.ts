import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { currentMonth, currentYear } from "@/lib/timezone";
import { Currency, TransactionType } from "@/generated/prisma/client";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapCustomerBahtTotals(
  aggregates: {
    type: TransactionType;
    currency: Currency;
    _sum: { amount: Prisma.Decimal | null };
  }[],
) {
  const totals = {
    thbInbound: 0,
    mmkOutbound: 0,
  };

  for (const aggregate of aggregates) {
    const amount = aggregate._sum.amount
      ? new Prisma.Decimal(aggregate._sum.amount).toNumber()
      : 0;

    if (aggregate.currency === "THB" && aggregate.type === "IN") {
      totals.thbInbound = amount;
    }

    if (aggregate.currency === "MMK" && aggregate.type === "OUT") {
      totals.mmkOutbound = amount;
    }
  }

  return totals;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const month = parsePositiveInt(
    url.searchParams.get("month"),
    currentMonth(),
  );
  const year = parsePositiveInt(url.searchParams.get("year"), currentYear());

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const customerBahtFilter = {
    OR: [{ bahtRefill: false }, { bahtRefill: null }],
  };

  const monthlyAggregates = await prisma.transaction.groupBy({
    by: ["type", "currency"],
    where: {
      ...customerBahtFilter,
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
  });

  return Response.json({
    month,
    year,
    totals: mapCustomerBahtTotals(monthlyAggregates),
  });
}
