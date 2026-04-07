import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { APP_TIMEZONE } from "@/lib/timezone";
import ExcelJS from "exceljs";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  const yearParam = url.searchParams.get("year");

  if (!monthParam || !yearParam) {
    return Response.json({ error: "Month and year are required" }, { status: 400 });
  }

  const month = parseInt(monthParam, 10);
  const year = parseInt(yearParam, 10);

  if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
    return Response.json({ error: "Invalid month or year" }, { status: 400 });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lt: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Build Excel workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SDL Daily Inbound/Outbound";
  workbook.created = new Date();

  const monthName = MONTH_NAMES[month - 1];
  const sheetName = `${monthName} ${year}`;
  const sheet = workbook.addWorksheet(sheetName);

  // — Title row —
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Transaction Report — ${monthName} ${year}`;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF1A1A2E" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  // — Generated date row —
  sheet.mergeCells("A2:F2");
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Generated on ${new Date().toLocaleDateString("en-US", { timeZone: APP_TIMEZONE, month: "long", day: "numeric", year: "numeric" })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF888888" } };
  dateCell.alignment = { horizontal: "center" };
  sheet.getRow(2).height = 20;

  // — Empty spacer —
  sheet.getRow(3).height = 10;

  // — Header row —
  const headerRow = sheet.addRow(["#", "Date", "Type", "Currency", "Amount", "Description"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A1A2E" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF333366" } },
    };
  });
  headerRow.height = 24;

  // — Column widths —
  sheet.getColumn(1).width = 6;   // #
  sheet.getColumn(2).width = 16;  // Date
  sheet.getColumn(3).width = 10;  // Type
  sheet.getColumn(4).width = 12;  // Currency
  sheet.getColumn(5).width = 18;  // Amount
  sheet.getColumn(6).width = 35;  // Description

  // — Data rows —
  let totalIn = 0;
  let totalOut = 0;

  transactions.forEach((tx, index) => {
    const amount = parseFloat(tx.amount.toString());
    if (tx.type === "IN") totalIn += amount;
    else totalOut += amount;

    const dataRow = sheet.addRow([
      index + 1,
      new Date(tx.date).toLocaleDateString("en-US", {
        timeZone: APP_TIMEZONE,
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      tx.type === "IN" ? "Inbound" : "Outbound",
      tx.currency,
      amount,
      tx.description || "—",
    ]);

    // Alternate row colors
    const bgColor = index % 2 === 0 ? "FFF8F9FA" : "FFFFFFFF";
    dataRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor },
      };
      cell.alignment = { vertical: "middle", horizontal: colNumber === 6 ? "left" : "center" };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
      };
    });

    // Color-code the type and amount
    const typeCell = dataRow.getCell(3);
    typeCell.font = {
      bold: true,
      color: { argb: tx.type === "IN" ? "FF10B981" : "FFF43F5E" },
    };

    const amountCell = dataRow.getCell(5);
    amountCell.numFmt = tx.currency === "MMK" ? "#,##0" : "#,##0.00";
    amountCell.font = {
      bold: true,
      color: { argb: tx.type === "IN" ? "FF10B981" : "FFF43F5E" },
    };
  });

  // — Empty spacer row before summary —
  sheet.addRow([]);

  // — Summary section —
  const summaryHeaderRow = sheet.addRow(["", "", "", "", "Summary", ""]);
  summaryHeaderRow.getCell(5).font = { bold: true, size: 12, color: { argb: "FF1A1A2E" } };
  summaryHeaderRow.getCell(5).alignment = { horizontal: "center" };

  const addSummaryRow = (label: string, value: number, color: string) => {
    const row = sheet.addRow(["", "", "", label, value, ""]);
    row.getCell(4).font = { bold: true, size: 11 };
    row.getCell(4).alignment = { horizontal: "right" };
    row.getCell(5).numFmt = "#,##0.00";
    row.getCell(5).font = { bold: true, size: 11, color: { argb: color } };
    row.getCell(5).alignment = { horizontal: "center" };
  };

  addSummaryRow("Total Inbound:", totalIn, "FF10B981");
  addSummaryRow("Total Outbound:", totalOut, "FFF43F5E");

  const netColor = totalIn - totalOut >= 0 ? "FF10B981" : "FFF43F5E";
  addSummaryRow("Net Balance:", totalIn - totalOut, netColor);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `transactions_${monthName.toLowerCase()}_${year}.xlsx`;

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
