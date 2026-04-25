import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { currentYear, currentMonth } from "@/lib/timezone";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const month = parseInt(
    url.searchParams.get("month") || currentMonth().toString(),
    10,
  );
  const year = parseInt(
    url.searchParams.get("year") || currentYear().toString(),
    10,
  );

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const aggregates = await prisma.transaction.groupBy({
    by: ["type", "currency"],
    where: {
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
  });

  const totals = {
    mmkIn: 0,
    mmkOut: 0,
    mmkNet: 0,
    thbIn: 0,
    thbOut: 0,
    thbNet: 0,
  };

  for (const agg of aggregates) {
    const amount = agg._sum.amount
      ? new Prisma.Decimal(agg._sum.amount).toNumber()
      : 0;
    if (agg.currency === "MMK") {
      if (agg.type === "IN") {
        totals.mmkIn = amount;
      } else {
        totals.mmkOut = amount;
      }
    } else {
      if (agg.type === "IN") {
        totals.thbIn = amount;
      } else {
        totals.thbOut = amount;
      }
    }
  }

  totals.mmkNet = totals.mmkIn - totals.mmkOut;
  totals.thbNet = totals.thbIn - totals.thbOut;

  return Response.json({
    month,
    year,
    totals,
  });
}
