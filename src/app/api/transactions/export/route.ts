import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { APP_TIMEZONE } from "@/lib/timezone";
import ExcelJS from "exceljs";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type ReportTransaction = {
  amount: { toString(): string };
  type: "IN" | "OUT";
  currency: "MMK" | "THB";
  description: string | null;
  date: Date;
};

type ReportTotals = {
  count: number;
  inbound: number;
  outbound: number;
  net: number;
};

const HEADER_FILL = "FF1A1A2E";
const HEADER_BORDER = "FF333366";
const INBOUND_COLOR = "FF10B981";
const OUTBOUND_COLOR = "FFF43F5E";

function reportDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: APP_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generatedDate() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: APP_TIMEZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: HEADER_BORDER } },
    };
  });
  row.height = 24;
}

function addTitleRows(
  sheet: ExcelJS.Worksheet,
  title: string,
  endColumn: string,
) {
  sheet.mergeCells(`A1:${endColumn}1`);
  const titleCell = sheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true, color: { argb: HEADER_FILL } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  sheet.mergeCells(`A2:${endColumn}2`);
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Generated on ${generatedDate()}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF888888" } };
  dateCell.alignment = { horizontal: "center" };
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 10;
}

function addCurrencySheet(
  workbook: ExcelJS.Workbook,
  currency: "MMK" | "THB",
  transactions: ReportTransaction[],
  monthName: string,
  year: number,
): ReportTotals {
  const sheet = workbook.addWorksheet(`${currency} Transactions`);
  addTitleRows(sheet, `${currency} Transaction Report — ${monthName} ${year}`, "E");

  const headerRow = sheet.addRow(["#", "Date", "Type", "Amount", "Description"]);
  styleHeaderRow(headerRow);

  sheet.getColumn(1).width = 6;
  sheet.getColumn(2).width = 16;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 18;
  sheet.getColumn(5).width = 42;
  sheet.views = [{ state: "frozen", ySplit: 4 }];
  sheet.autoFilter = "A4:E4";

  let inbound = 0;
  let outbound = 0;

  transactions.forEach((tx, index) => {
    const amount = parseFloat(tx.amount.toString());
    if (tx.type === "IN") {
      inbound += amount;
    } else {
      outbound += amount;
    }

    const dataRow = sheet.addRow([
      index + 1,
      reportDate(tx.date),
      tx.type === "IN" ? "Inbound" : "Outbound",
      amount,
      tx.description || "-",
    ]);

    const bgColor = index % 2 === 0 ? "FFF8F9FA" : "FFFFFFFF";
    dataRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 5 ? "left" : "center",
      };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
      };
    });

    const typeColor = tx.type === "IN" ? INBOUND_COLOR : OUTBOUND_COLOR;
    dataRow.getCell(3).font = { bold: true, color: { argb: typeColor } };
    dataRow.getCell(4).numFmt = currency === "MMK" ? "#,##0" : "#,##0.00";
    dataRow.getCell(4).font = { bold: true, color: { argb: typeColor } };
  });

  if (transactions.length === 0) {
    const emptyRow = sheet.addRow(["", "", "", "", `No ${currency} transactions for this month`]);
    emptyRow.getCell(5).font = { italic: true, color: { argb: "FF888888" } };
  }

  sheet.addRow([]);
  const summaryHeaderRow = sheet.addRow(["", "", "Summary", "", ""]);
  summaryHeaderRow.getCell(3).font = { bold: true, size: 12, color: { argb: HEADER_FILL } };
  summaryHeaderRow.getCell(3).alignment = { horizontal: "center" };

  const addSummaryRow = (label: string, value: number, color: string) => {
    const row = sheet.addRow(["", "", label, value, currency]);
    row.getCell(3).font = { bold: true, size: 11 };
    row.getCell(3).alignment = { horizontal: "right" };
    row.getCell(4).numFmt = currency === "MMK" ? "#,##0" : "#,##0.00";
    row.getCell(4).font = { bold: true, size: 11, color: { argb: color } };
    row.getCell(4).alignment = { horizontal: "center" };
  };

  addSummaryRow("Total Inbound:", inbound, INBOUND_COLOR);
  addSummaryRow("Total Outbound:", outbound, OUTBOUND_COLOR);
  addSummaryRow("Net Balance:", inbound - outbound, inbound - outbound >= 0 ? INBOUND_COLOR : OUTBOUND_COLOR);

  return {
    count: transactions.length,
    inbound,
    outbound,
    net: inbound - outbound,
  };
}

function addSummarySheet(
  workbook: ExcelJS.Workbook,
  monthName: string,
  year: number,
  totals: Record<"MMK" | "THB", ReportTotals>,
) {
  const sheet = workbook.addWorksheet("Summary");
  addTitleRows(sheet, `Transaction Summary — ${monthName} ${year}`, "E");

  const headerRow = sheet.addRow(["Currency", "Transactions", "Inbound", "Outbound", "Net Balance"]);
  styleHeaderRow(headerRow);

  sheet.getColumn(1).width = 14;
  sheet.getColumn(2).width = 16;
  sheet.getColumn(3).width = 18;
  sheet.getColumn(4).width = 18;
  sheet.getColumn(5).width = 18;

  (["MMK", "THB"] as const).forEach((currency, index) => {
    const currencyTotals = totals[currency];
    const row = sheet.addRow([
      currency,
      currencyTotals.count,
      currencyTotals.inbound,
      currencyTotals.outbound,
      currencyTotals.net,
    ]);
    const bgColor = index % 2 === 0 ? "FFF8F9FA" : "FFFFFFFF";
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor },
      };
      cell.alignment = { horizontal: colNumber === 1 ? "left" : "center" };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
      };
    });
    row.getCell(1).font = { bold: true };
    row.getCell(3).numFmt = currency === "MMK" ? "#,##0" : "#,##0.00";
    row.getCell(4).numFmt = currency === "MMK" ? "#,##0" : "#,##0.00";
    row.getCell(5).numFmt = currency === "MMK" ? "#,##0" : "#,##0.00";
    row.getCell(3).font = { bold: true, color: { argb: INBOUND_COLOR } };
    row.getCell(4).font = { bold: true, color: { argb: OUTBOUND_COLOR } };
    row.getCell(5).font = {
      bold: true,
      color: { argb: currencyTotals.net >= 0 ? INBOUND_COLOR : OUTBOUND_COLOR },
    };
  });
}

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
  const mmkTransactions = transactions.filter((tx) => tx.currency === "MMK");
  const thbTransactions = transactions.filter((tx) => tx.currency === "THB");
  const mmkTotals = addCurrencySheet(
    workbook,
    "MMK",
    mmkTransactions,
    monthName,
    year,
  );
  const thbTotals = addCurrencySheet(
    workbook,
    "THB",
    thbTransactions,
    monthName,
    year,
  );
  addSummarySheet(workbook, monthName, year, {
    MMK: mmkTotals,
    THB: thbTotals,
  });

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
