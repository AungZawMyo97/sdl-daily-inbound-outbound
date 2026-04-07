import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Currency, TransactionType, Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const currency = url.searchParams.get("currency") as Currency | null;
  const dateStr = url.searchParams.get("date");
  const month = url.searchParams.get("month");
  const year = url.searchParams.get("year");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));

  const where: Record<string, unknown> = {};

  if (currency && Object.values(Currency).includes(currency)) {
    where.currency = currency;
  }

  if (dateStr) {
    const date = new Date(dateStr);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    where.date = { gte: date, lt: nextDate };
  } else if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 1);
    where.date = { gte: startDate, lt: endDate };
  } else if (year) {
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);
    where.date = { gte: startDate, lt: endDate };
  }

  // Fetch paginated transactions and total count in parallel
  const [transactions, totalCount, aggregates] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
    }),
  ]);

  const totalIn = aggregates
    .find((a) => a.type === "IN")
    ?._sum.amount;
  const totalOut = aggregates
    .find((a) => a.type === "OUT")
    ?._sum.amount;

  const serialized = transactions.map((t) => ({
    ...t,
    amount: t.amount.toString(),
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }));

  return Response.json({
    data: serialized,
    totalCount,
    hasMore: page * limit < totalCount,
    totalIn: totalIn ? new Prisma.Decimal(totalIn).toNumber() : 0,
    totalOut: totalOut ? new Prisma.Decimal(totalOut).toNumber() : 0,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, type, currency, description, date } = body;

  if (!amount || !type || !currency) {
    return Response.json(
      { error: "Amount, type, and currency are required" },
      { status: 400 }
    );
  }

  if (!Object.values(TransactionType).includes(type)) {
    return Response.json({ error: "Invalid transaction type" }, { status: 400 });
  }

  if (!Object.values(Currency).includes(currency)) {
    return Response.json({ error: "Invalid currency" }, { status: 400 });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return Response.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  const transactionDate = date ? new Date(date) : new Date();
  transactionDate.setHours(0, 0, 0, 0);

  const transaction = await prisma.transaction.create({
    data: {
      amount: parsedAmount,
      type,
      currency,
      description: description || null,
      date: transactionDate,
    },
  });

  return Response.json({
    ...transaction,
    amount: transaction.amount.toString(),
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
  }, { status: 201 });
}
