import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfTodayLocal } from "@/lib/timezone";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = startOfTodayLocal();

  const aggregates = await prisma.transaction.groupBy({
    by: ["type", "currency"],
    where: {
      date: { lt: todayStart },
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

  return Response.json({ totals });
}
