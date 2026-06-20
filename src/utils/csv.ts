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

export function printInvoice(order: Order) {
  const invoice = window.open("", "_blank", "width=860,height=1000");
  if (!invoice) return;
  const rows = order.lines
    .map(
      (line) => `
        <tr>
          <td>${line.sku}</td>
          <td>${line.name}</td>
          <td>${line.quantity} ${line.unit}</td>
          <td>$${line.price.toFixed(2)}</td>
          <td>$${(line.quantity * line.price).toFixed(2)}</td>
        </tr>`,
    )
    .join("");
  invoice.document.write(`
    <html>
      <head>
        <title>${order.invoiceNumber}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; color: #18181b; padding: 32px; }
          header { display: flex; justify-content: space-between; border-bottom: 1px solid #e4e4e7; padding-bottom: 18px; margin-bottom: 22px; }
          h1 { margin: 0; font-size: 28px; }
          p { margin: 4px 0; color: #52525b; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { text-align: left; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #71717a; background: #f4f4f5; }
          th, td { padding: 10px; border-bottom: 1px solid #e4e4e7; }
          .total { text-align: right; margin-top: 24px; font-size: 22px; font-weight: 700; color: #18181b; }
          @media print { button { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print / Save PDF</button>
        <header>
          <div>
            <h1>${order.invoiceNumber}</h1>
            <p>${order.orderNumber}</p>
          </div>
          <div>
            <p><strong>${order.storeName}</strong></p>
            <p>${order.contactPerson} · ${order.phone}</p>
            <p>${order.orderDate} · ${order.route} · ${order.batch}</p>
          </div>
        </header>
        <table>
          <thead><tr><th>SKU</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">Invoice Total: $${order.total.toFixed(2)}</div>
      </body>
    </html>
  `);
  invoice.document.close();
  invoice.focus();
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
