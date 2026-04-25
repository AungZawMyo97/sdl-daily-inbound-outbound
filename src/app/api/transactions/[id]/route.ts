import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Prisma, TransactionType } from "@/generated/prisma/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.transaction.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id: numericId } });

  return Response.json({ success: true });
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.transaction.findUnique({
    where: { id: numericId },
  });
  if (!existing) {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }

  const body = await request.json();
  const { amount, type, description, date, bahtRefill } = body;

  const updateData: Prisma.TransactionUpdateInput = {};

  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }
    updateData.amount = parsedAmount;
  }

  if (type !== undefined) {
    if (!Object.values(TransactionType).includes(type)) {
      return Response.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }
    updateData.type = type;
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  if (date !== undefined) {
    const transactionDate = parseLocalDate(date);
    updateData.date = transactionDate;
  }

  if (bahtRefill !== undefined) {
    updateData.bahtRefill = bahtRefill;
  }

  const updated = await prisma.transaction.update({
    where: { id: numericId },
    data: updateData,
  });

  return Response.json({
    ...updated,
    amount: updated.amount.toString(),
    date: updated.date.toISOString(),
    createdAt: updated.createdAt.toISOString(),
  });
}
