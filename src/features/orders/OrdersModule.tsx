import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Download, FileDown, Keyboard, MessageCircle, Plus, Printer, Repeat2, Search } from "lucide-react";
import type { MockDb, Order, OrderLine, OrderStatus, PackingStatus } from "../../types";
import { orderStatuses, packingStatuses } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Badge, Button, Card, Drawer, Input, Select, Textarea, cn } from "../../components/ui";
import { exportOrdersCsv, downloadInvoice, printInvoice } from "../../utils/csv";
import { money, today } from "../../utils/format";
import { repeatPreviousOrder } from "../../services/mockDb";

type OrdersModuleProps = {
  db: MockDb;
  globalSearch: string;
  createOrder: (input: { customerId: string; orderDate: string; fulfillment: "Delivery" | "Pickup"; notes: string; lines: OrderLine[] }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePackingStatus: (orderId: string, status: PackingStatus) => void;
  generateInvoice: (orderId: string) => void;
};

export function OrdersModule({
  db,
  globalSearch,
  createOrder,
  updateOrderStatus,
  updatePackingStatus,
  generateInvoice,
}: OrdersModuleProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const selectedOrder = db.orders.find((order) => order.id === selectedOrderId) ?? null;

  const filteredOrders = useMemo(() => {
    const needle = globalSearch.toLowerCase();
    return db.orders.filter((order) => {
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      const haystack = `${order.orderNumber} ${order.invoiceNumber} ${order.storeName} ${order.contactPerson} ${order.phone} ${order.route} ${order.status} ${order.packingStatus}`.toLowerCase();
      return matchesStatus && haystack.includes(needle);
    });
  }, [db.orders, globalSearch, statusFilter]);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Order",
        accessorKey: "orderNumber",
        cell: ({ row }) => (
          <button onClick={() => setSelectedOrderId(row.original.id)} className="text-left font-semibold text-zinc-950 hover:underline">
            {row.original.orderNumber}
            <span className="mt-1 block text-xs font-normal text-zinc-500">{row.original.invoiceNumber}</span>
          </button>
        ),
      },
      { header: "Store", accessorKey: "storeName" },
      { header: "Route", accessorKey: "route" },
      { header: "Batch", accessorKey: "batch" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Packing",
        accessorKey: "packingStatus",
        cell: ({ row }) => <Badge tone="blue">{row.original.packingStatus}</Badge>,
      },
      {
        header: "Value",
        accessorKey: "total",
        cell: ({ row }) => <span className="font-semibold">{money(row.original.total)}</span>,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title="Preorder operations"
        description="Create repeat orders quickly, manage the status pipeline, generate invoices, and keep route/batch work moving."
        action={
          <Button variant="secondary" onClick={() => exportOrdersCsv(filteredOrders)}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      <OrderComposer db={db} createOrder={createOrder} />
      <PipelineBoard orders={db.orders} onOpen={setSelectedOrderId} />

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...orderStatuses].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  statusFilter === status ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-500">{filteredOrders.length} orders in view</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50/80">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer open={Boolean(selectedOrder)} title={selectedOrder?.orderNumber ?? "Order details"} onClose={() => setSelectedOrderId(null)}>
        {selectedOrder && (
          <OrderDrawer
            order={selectedOrder}
            onStatus={(status) => updateOrderStatus(selectedOrder.id, status)}
            onPacking={(status) => updatePackingStatus(selectedOrder.id, status)}
            onInvoice={() => generateInvoice(selectedOrder.id)}
          />
        )}
      </Drawer>
    </div>
  );
}

function OrderComposer({ db, createOrder }: { db: MockDb; createOrder: OrdersModuleProps["createOrder"] }) {
  const [customerId, setCustomerId] = useState(db.customers[0]?.id ?? "");
  const [orderDate, setOrderDate] = useState(today());
  const [fulfillment, setFulfillment] = useState<"Delivery" | "Pickup">("Delivery");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bulkText, setBulkText] = useState("");
  const customer = db.customers.find((candidate) => candidate.id === customerId);
  const previousQuantities = repeatPreviousOrder(db, customerId);
  const selectedCount = Object.values(quantities).filter(Boolean).length;
  const productsToOrder = db.products.filter((product) => product.active);

  const lines = productsToOrder
    .map((product) => ({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      price: product.price,
      quantity: Number(quantities[product.id] || 0),
      recommendation: previousQuantities[product.id] ? "repeat" : customer?.preferredProductIds.includes(product.id) ? "preferred" : "manual",
    }))
    .filter((line) => line.quantity > 0) as OrderLine[];
  const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);

  function updateQuantity(productId: string, next: number) {
    setQuantities((current) => ({ ...current, [productId]: Math.max(0, next) }));
  }

  function quickAdd(productId: string, amount: number) {
    updateQuantity(productId, Number(quantities[productId] || 0) + amount);
  }

  function applyRepeatOrder() {
    setQuantities(previousQuantities);
  }

  function applyBulkEntry() {
    const next = { ...quantities };
    bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(/\s+/);
        const quantity = Number(parts[parts.length - 1]);
        const key = parts.slice(0, -1).join(" ").toLowerCase();
        const product = db.products.find((candidate) => candidate.sku.toLowerCase() === key || candidate.name.toLowerCase().includes(key));
        if (product && Number.isFinite(quantity)) next[product.id] = quantity;
      });
    setQuantities(next);
  }

  function submitOrder() {
    if (db.settings.orderingClosed || !customerId || lines.length === 0) return;
    createOrder({ customerId, orderDate, fulfillment, notes, lines });
    setQuantities({});
    setNotes("");
    setBulkText("");
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[.8fr_1.55fr_.65fr]">
        <div className="border-b border-zinc-200 p-4 xl:border-b-0 xl:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step 1 / Store</p>
          <Select className="mt-3 w-full" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {db.customers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.storeName} — {item.contactPerson}
              </option>
            ))}
          </Select>
          <div className="mt-4 grid gap-3 text-sm">
            <label className="grid gap-1">
              <span className="font-semibold text-zinc-700">Step 2 / Order date</span>
              <Input type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="font-semibold text-zinc-700">Fulfillment</span>
              <Select value={fulfillment} onChange={(event) => setFulfillment(event.target.value as "Delivery" | "Pickup")}>
                <option>Delivery</option>
                <option>Pickup</option>
              </Select>
            </label>
            <Button variant="secondary" onClick={applyRepeatOrder} disabled={!Object.keys(previousQuantities).length}>
              <Repeat2 size={16} /> Repeat Previous Order
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step 3 / Add products</p>
              <h2 className="mt-1 font-semibold">Keyboard-first quantity grid</h2>
            </div>
            <Badge tone="dark">
              <Keyboard size={13} className="mr-1" /> Tab / Enter optimized
            </Badge>
          </div>

          <div className="grid gap-2 md:hidden">
            {productsToOrder.map((product) => {
              const recommended = customer?.preferredProductIds.includes(product.id) || previousQuantities[product.id];
              const quantity = Number(quantities[product.id] || 0);
              return (
                <div key={product.id} className={cn("rounded-xl border border-zinc-200 bg-white p-3", Boolean(recommended) && "border-emerald-200 bg-emerald-50/40")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-zinc-500">
                        {product.sku} · {product.unit} · {money(product.price)}
                      </p>
                    </div>
                    {recommended && <Badge tone="green">Suggested</Badge>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      aria-label={`Quantity for ${product.name}`}
                      type="number"
                      min="0"
                      value={quantity || ""}
                      onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                      className="w-20"
                    />
                    {[1, 5, 10].map((amount) => (
                      <button key={amount} onClick={() => quickAdd(product.id, amount)} className="rounded-md bg-zinc-100 px-3 py-2 text-xs font-semibold hover:bg-zinc-200">
                        +{amount}
                      </button>
                    ))}
                    <span className="ml-auto text-sm font-semibold">{money(quantity * product.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden max-h-[430px] overflow-auto rounded-xl border border-zinc-200 md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="sticky top-0 bg-zinc-50 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="px-3 py-2">SKU / Item</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Quick</th>
                  <th className="px-3 py-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {productsToOrder.map((product, index) => {
                  const recommended = customer?.preferredProductIds.includes(product.id) || previousQuantities[product.id];
                  const quantity = Number(quantities[product.id] || 0);
                  return (
                    <tr key={product.id} className={cn("border-t border-zinc-100", Boolean(recommended) && "bg-emerald-50/35")}>
                      <td className="px-3 py-2">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-zinc-500">{product.unit}</td>
                      <td className="px-3 py-2">{money(product.price)}</td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Quantity for ${product.name}`}
                          type="number"
                          min="0"
                          value={quantity || ""}
                          onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              const next = document.querySelector<HTMLInputElement>(`[data-qty-index="${index + 1}"]`);
                              next?.focus();
                            }
                          }}
                          data-qty-index={index}
                          className="w-20"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {[1, 5, 10].map((amount) => (
                            <button key={amount} onClick={() => quickAdd(product.id, amount)} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold hover:bg-zinc-200">
                              +{amount}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-semibold">{money(quantity * product.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-zinc-200 p-4 xl:border-l xl:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step 4 / Review</p>
          {db.settings.orderingClosed && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Ordering is closed for this cycle. Reopen ordering in Settings before accepting new preorders.
            </div>
          )}
          <div className="mt-3 rounded-2xl bg-zinc-950 p-4 text-white">
            <p className="text-sm text-zinc-400">Live order total</p>
            <p className="mt-1 text-3xl font-semibold">{money(total)}</p>
            <p className="mt-2 text-xs text-zinc-400">{selectedCount} line items selected</p>
          </div>
          <Textarea className="mt-3" placeholder="Order notes or receiving alerts" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Bulk order entry</p>
            <Textarea
              placeholder={"Paste lines like:\nMNG-SIN-BOX 5\nJamun 2"}
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
            />
            <Button className="mt-2 w-full" variant="secondary" onClick={applyBulkEntry}>
              <Search size={16} /> Apply Bulk Entry
            </Button>
          </div>
          <Button className="mt-3 w-full" onClick={submitOrder} disabled={db.settings.orderingClosed || !lines.length}>
            <Plus size={16} /> Step 5 / Submit Preorder
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PipelineBoard({ orders, onOpen }: { orders: Order[]; onOpen: (orderId: string) => void }) {
  const activeStatuses: OrderStatus[] = ["Submitted", "Confirmed", "Packed", "Ready"];

  return (
    <Card className="mt-5 p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold">Status pipeline and shipment batches</h2>
          <p className="text-sm text-zinc-500">A dispatch-first view for confirmation, packing, staging, and route grouping.</p>
        </div>
        <Badge tone="dark">{orders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length} active orders</Badge>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        {activeStatuses.map((status) => {
          const statusOrders = orders.filter((order) => order.status === status);
          return (
            <div key={status} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{status}</h3>
                <Badge tone={status === "Submitted" ? "amber" : "blue"}>{statusOrders.length}</Badge>
              </div>
              <div className="space-y-2">
                {statusOrders.map((order) => (
                  <button key={order.id} onClick={() => onOpen(order.id)} className="w-full rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{order.storeName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{order.route} · {order.batch}</p>
                      </div>
                      <p className="text-sm font-semibold">{money(order.total)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                      <span>{order.packingStatus}</span>
                      {order.notesAlert && <Badge tone="amber">Notes</Badge>}
                    </div>
                  </button>
                ))}
                {!statusOrders.length && <p className="rounded-xl border border-dashed border-zinc-300 p-3 text-center text-xs text-zinc-400">No orders</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function OrderDrawer({
  order,
  onStatus,
  onPacking,
  onInvoice,
}: {
  order: Order;
  onStatus: (status: OrderStatus) => void;
  onPacking: (status: PackingStatus) => void;
  onInvoice: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="Store" value={order.storeName} />
        <Info label="Route / Batch" value={`${order.route} / ${order.batch}`} />
        <Info label="Total" value={money(order.total)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Status
          <Select value={order.status} onChange={(event) => onStatus(event.target.value as OrderStatus)}>
            {orderStatuses.map((status) => <option key={status}>{status}</option>)}
          </Select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Packing status
          <Select value={order.packingStatus} onChange={(event) => onPacking(event.target.value as PackingStatus)}>
            {packingStatuses.map((status) => <option key={status}>{status}</option>)}
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onInvoice}>
          <FileDown size={16} /> Generate Invoice #
        </Button>
        <Button variant="secondary" onClick={() => downloadInvoice(order)}>
          <Download size={16} /> Download Invoice
        </Button>
        <Button variant="secondary" onClick={() => printInvoice(order)}>
          <Printer size={16} /> Print / Save PDF
        </Button>
        <a
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-950 shadow-sm hover:border-zinc-300"
          href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Order ${order.orderNumber} is ${order.status}. Total ${money(order.total)}.`)}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> WhatsApp Confirmation
        </a>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Line items</h3>
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          {order.lines.map((line) => (
            <div key={line.productId} className="grid grid-cols-[1fr_auto] gap-3 border-t border-zinc-100 px-3 py-2 first:border-t-0">
              <div>
                <p className="text-sm font-semibold">{line.name}</p>
                <p className="text-xs text-zinc-500">{line.sku} · {line.quantity} {line.unit}</p>
              </div>
              <p className="text-sm font-semibold">{money(line.quantity * line.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Notes alert:</strong> {order.notes}
        </div>
      )}

      <div>
        <h3 className="mb-2 font-semibold">Audit trail</h3>
        <div className="space-y-2">
          {order.auditTrail.map((event) => (
            <div key={event.id} className="rounded-xl bg-zinc-50 p-3 text-sm">
              <p className="font-semibold">{event.message}</p>
              <p className="mt-1 text-xs text-zinc-500">{event.actor} · {new Date(event.at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "Cancelled" ? "red" : status === "Completed" ? "green" : status === "Submitted" ? "amber" : "blue";
  return <Badge tone={tone}>{status}</Badge>;
}
