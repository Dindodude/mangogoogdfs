import type { Order } from "../types";

export function exportOrdersCsv(orders: Order[]) {
  const rows = [
    ["Order", "Invoice", "Date", "Store", "Contact", "Phone", "Route", "Batch", "Status", "Packing", "Total"],
    ...orders.map((order) => [
      order.orderNumber,
      order.invoiceNumber,
      order.orderDate,
      order.storeName,
      order.contactPerson,
      order.phone,
      order.route,
      order.batch,
      order.status,
      order.packingStatus,
      String(order.total),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadText("orders-export.csv", csv, "text/csv");
}

export function downloadInvoice(order: Order) {
  const lines = order.lines
    .map((line) => `${line.quantity} ${line.unit} ${line.name} @ ${line.price.toFixed(2)}`)
    .join("\n");
  const content = [
    `Invoice ${order.invoiceNumber}`,
    `Order ${order.orderNumber}`,
    `Store: ${order.storeName}`,
    `Date: ${order.orderDate}`,
    "",
    lines,
    "",
    `Total: ${order.total.toFixed(2)}`,
  ].join("\n");
  downloadText(`${order.invoiceNumber}.txt`, content, "text/plain");
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
