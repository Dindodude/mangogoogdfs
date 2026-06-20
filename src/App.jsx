import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  LayoutDashboard,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "produce-preorder-demo-v2";
const STATUSES = ["Submitted", "Confirmed", "Packed", "Ready", "Completed", "Cancelled"];
const UNITS = ["box", "case", "lb", "kg"];

const today = () => new Date().toISOString().slice(0, 10);
const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

const baseProducts = [
  ["Sindhri Mango", "box", 34],
  ["Anwar Ratol Mango", "box", 42],
  ["Chaunsa Mango", "box", 38],
  ["Jamun", "case", 48],
  ["Cheeko", "case", 36],
  ["Apricot", "case", 31],
  ["Plum", "case", 29],
].map(([name, unit, price], index) => ({
  id: `prod-${index + 1}`,
  name,
  unit,
  price,
  active: true,
}));

const yesterdayProducts = baseProducts.map((product, index) => ({
  ...product,
  id: `yesterday-${index + 1}`,
  price: product.price + (index % 2 === 0 ? 1 : -1),
}));

const sampleOrders = [
  {
    id: "PO-20260620-1042",
    date: today(),
    storeName: "Sample Market",
    buyerName: "A. Khan",
    phone: "555-0134",
    fulfillment: "Delivery",
    notes: "Deliver before noon if possible.",
    status: "Submitted",
    items: [
      { productId: "prod-1", name: "Sindhri Mango", unit: "box", price: 34, quantity: 4, notes: "" },
      { productId: "prod-4", name: "Jamun", unit: "case", price: 48, quantity: 2, notes: "Firm fruit" },
    ],
  },
  {
    id: "PO-20260620-1043",
    date: today(),
    storeName: "Corner Grocer",
    buyerName: "M. Ali",
    phone: "555-0188",
    fulfillment: "Pickup",
    notes: "",
    status: "Confirmed",
    items: [
      { productId: "prod-3", name: "Chaunsa Mango", unit: "box", price: 38, quantity: 6, notes: "" },
      { productId: "prod-7", name: "Plum", unit: "case", price: 29, quantity: 3, notes: "" },
    ],
  },
];

const createInitialData = () => ({
  products: baseProducts,
  orders: sampleOrders,
  orderingClosed: false,
});

const freshOrderForm = () => ({
  date: today(),
  storeName: "",
  buyerName: "",
  phone: "",
  fulfillment: "Delivery",
  notes: "",
});

const emptyLinesFor = (products) =>
  Object.fromEntries(products.map((product) => [product.id, { quantity: "", notes: "" }]));

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 0), 0);
}

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : createInitialData();
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.orders)) return createInitialData();
    return { ...createInitialData(), ...parsed };
  } catch {
    return createInitialData();
  }
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 ${props.className || ""}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 ${props.className || ""}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-24 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 ${props.className || ""}`}
    />
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState("order");

  useEffect(() => {
    // Future backend database integration: replace this persistence layer with API reads/writes.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeProducts = useMemo(
    () => data.products.filter((product) => product.active).sort((a, b) => a.name.localeCompare(b.name)),
    [data.products],
  );

  function submitOrder(order) {
    // Future customer account, invoicing, and payment hooks can be attached after this order object is created.
    setData((current) => ({ ...current, orders: [order, ...current.orders] }));
  }

  function resetDemoData() {
    setData(createInitialData());
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="no-print border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Business Name Placeholder</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Wholesale Pre-Order Portal</p>
          </div>
          <nav className="flex rounded-lg border border-line bg-paper p-1">
            <button
              onClick={() => setView("order")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${view === "order" ? "bg-white shadow-sm" : "text-muted"}`}
            >
              <ClipboardList size={16} /> Store Order
            </button>
            <button
              onClick={() => setView("admin")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${view === "admin" ? "bg-white shadow-sm" : "text-muted"}`}
            >
              <LayoutDashboard size={16} /> Admin
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "order" ? (
          <OrderPage
            products={activeProducts}
            orderingClosed={data.orderingClosed}
            onSubmit={submitOrder}
          />
        ) : (
          <AdminPage data={data} setData={setData} onResetDemoData={resetDemoData} />
        )}
      </div>
    </main>
  );
}

function OrderPage({ products, orderingClosed, onSubmit }) {
  const [form, setForm] = useState(freshOrderForm);
  const [lines, setLines] = useState(() => emptyLinesFor(products));
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setLines((current) => ({
      ...Object.fromEntries(products.map((product) => [product.id, current[product.id] || { quantity: "", notes: "" }])),
    }));
  }, [products]);

  const orderItems = products
    .map((product) => ({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      price: Number(product.price),
      quantity: Number(lines[product.id]?.quantity || 0),
      notes: lines[product.id]?.notes || "",
    }))
    .filter((item) => item.quantity > 0);

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateLine(productId, patch) {
    setLines((current) => ({ ...current, [productId]: { ...current[productId], ...patch } }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (orderingClosed || orderItems.length === 0) return;

    const order = {
      id: `PO-${form.date.replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...form,
      status: "Submitted",
      items: orderItems,
    };
    onSubmit(order);
    setConfirmation(order);
    setLines(emptyLinesFor(products));
  }

  return (
    <div className="grid gap-6">
      {orderingClosed && (
        <div className="rounded-lg border border-line bg-white p-4 text-sm font-medium text-muted">
          Ordering is closed for the day. Admin can reopen ordering from the dashboard.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="print-panel rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-1 border-b border-line pb-4">
            <h2 className="text-lg font-semibold">Buyer Information</h2>
            <p className="text-sm text-muted">For store and business buyers placing daily wholesale pre-orders.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Order date">
              <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </Field>
            <Field label="Store name">
              <TextInput value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required />
            </Field>
            <Field label="Buyer name">
              <TextInput value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} required />
            </Field>
            <Field label="Phone number">
              <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </Field>
            <Field label="Delivery / pickup">
              <SelectInput value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value })}>
                <option>Delivery</option>
                <option>Pickup</option>
              </SelectInput>
            </Field>
            <Field label="Notes">
              <TextArea placeholder="Delivery instructions, preferred ripeness, or receiving notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="print-panel overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Product Pre-Order Table</h2>
              <p className="mt-1 text-sm text-muted">Enter quantities for tomorrow or the next requested order date.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Live total</p>
              <p className="text-2xl font-semibold">{money(total)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Unit / Box type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Order quantity</th>
                  <th className="px-4 py-3">Line total</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr className="border-t border-line">
                    <td className="px-4 py-8 text-center text-muted" colSpan="6">
                      No active products are available for ordering today.
                    </td>
                  </tr>
                )}
                {products.map((product) => {
                  const quantity = Number(lines[product.id]?.quantity || 0);
                  return (
                    <tr key={product.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-muted">{product.unit}</td>
                      <td className="px-4 py-3">{money(product.price)}</td>
                      <td className="px-4 py-3">
                        <TextInput
                          aria-label={`Order quantity for ${product.name}`}
                          type="number"
                          min="0"
                          step="1"
                          value={lines[product.id]?.quantity || ""}
                          onChange={(e) => updateLine(product.id, { quantity: e.target.value })}
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">{money(quantity * product.price)}</td>
                      <td className="px-4 py-3">
                        <TextInput
                          aria-label={`Notes for ${product.name}`}
                          value={lines[product.id]?.notes || ""}
                          onChange={(e) => updateLine(product.id, { notes: e.target.value })}
                          className="w-full"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <p className="text-sm text-muted sm:mr-auto">
            {orderItems.length} line item{orderItems.length === 1 ? "" : "s"} selected
          </p>
          <SecondaryButton type="button" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save Summary
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={orderingClosed || orderItems.length === 0}>
            Submit Pre-Order
          </PrimaryButton>
        </div>
      </form>

      {confirmation && <Confirmation order={confirmation} />}
    </div>
  );
}

function Confirmation({ order }) {
  return (
    <section className="print-panel rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-1 text-accent" size={22} />
          <div>
            <h2 className="text-lg font-semibold">Pre-order submitted</h2>
            <p className="mt-1 text-sm text-muted">Order number: <span className="font-semibold text-ink">{order.id}</span></p>
          </div>
        </div>
        <SecondaryButton type="button" onClick={() => window.print()} className="no-print">
          <Printer size={16} /> Print / Save
        </SecondaryButton>
      </div>
      <OrderSummary order={order} />
    </section>
  );
}

function OrderSummary({ order }) {
  return (
    <div className="mt-5">
      <div className="grid gap-2 text-sm text-muted sm:grid-cols-2 lg:grid-cols-4">
        <p><span className="font-semibold text-ink">Store:</span> {order.storeName}</p>
        <p><span className="font-semibold text-ink">Buyer:</span> {order.buyerName}</p>
        <p><span className="font-semibold text-ink">Phone:</span> {order.phone}</p>
        <p><span className="font-semibold text-ink">Method:</span> {order.fulfillment}</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={`${order.id}-${item.productId}`} className="border-t border-line">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-muted">{item.unit}</td>
                <td className="px-3 py-2">{money(item.price)}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2 font-semibold">{money(item.price * item.quantity)}</td>
                <td className="px-3 py-2 text-muted">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-right text-xl font-semibold">Order Total: {money(orderTotal(order))}</p>
    </div>
  );
}

function AdminPage({ data, setData, onResetDemoData }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [draftProduct, setDraftProduct] = useState({ name: "", unit: "box", price: "" });

  const filteredOrders = data.orders.filter((order) => {
    const search = `${order.storeName} ${order.buyerName} ${order.phone}`.toLowerCase();
    const matchesQuery = search.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const todaysOrders = data.orders.filter((order) => order.date === today());
  const pendingCount = data.orders.filter((order) => order.status === "Submitted").length;
  const totalValue = data.orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const topItem = getTopItem(data.orders);

  function addProduct(event) {
    event.preventDefault();
    if (!draftProduct.name || !draftProduct.price) return;
    setData((current) => ({
      ...current,
      products: [
        ...current.products,
        {
          id: `prod-${crypto.randomUUID()}`,
          name: draftProduct.name,
          unit: draftProduct.unit,
          price: Number(draftProduct.price),
          active: true,
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    setDraftProduct({ name: "", unit: "box", price: "" });
  }

  function updateProduct(productId, patch) {
    setData((current) => ({
      ...current,
      products: current.products
        .map((product) => (product.id === productId ? { ...product, ...patch } : product))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }

  function deleteProduct(productId) {
    setData((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId),
    }));
  }

  function duplicateYesterday() {
    setData((current) => ({
      ...current,
      products: yesterdayProducts
        .map((product) => ({ ...product, id: `prod-${crypto.randomUUID()}` }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }

  function updateOrderStatus(orderId, status) {
    setData((current) => ({
      ...current,
      orders: current.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    }));
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Today's pre-orders" value={todaysOrders.length} />
        <Metric label="Pending confirmation" value={pendingCount} />
        <Metric label="Total pre-order value" value={money(totalValue)} />
        <Metric label="Top ordered item" value={topItem || "No orders yet"} />
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Admin Controls</h2>
            {/* Future login/authentication: protect this admin-only area before launch. */}
            <p className="mt-1 text-sm text-muted">First draft controls without login. Add authentication here before production use.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SecondaryButton onClick={duplicateYesterday}>
              <Copy size={16} /> Duplicate Yesterday's List
            </SecondaryButton>
            <SecondaryButton onClick={onResetDemoData}>
              <RotateCcw size={16} /> Reset Demo Data
            </SecondaryButton>
            <PrimaryButton onClick={() => setData((current) => ({ ...current, orderingClosed: !current.orderingClosed }))}>
              {data.orderingClosed ? "Open Ordering" : "Close Ordering"}
            </PrimaryButton>
          </div>
        </div>

        <form onSubmit={addProduct} className="mt-5 grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]">
          <TextInput placeholder="Add product name" value={draftProduct.name} onChange={(e) => setDraftProduct({ ...draftProduct, name: e.target.value })} />
          <SelectInput value={draftProduct.unit} onChange={(e) => setDraftProduct({ ...draftProduct, unit: e.target.value })}>
            {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
          </SelectInput>
          <TextInput type="number" min="0" step="0.01" placeholder="Price" value={draftProduct.price} onChange={(e) => setDraftProduct({ ...draftProduct, price: e.target.value })} />
          <PrimaryButton type="submit"><Plus size={16} /> Add Product</PrimaryButton>
        </form>
      </section>

      <OrdersTable orders={filteredOrders} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onStatus={updateOrderStatus} />
      <ProductsTable products={data.products} onUpdate={updateProduct} onDelete={deleteProduct} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function OrdersTable({ orders, query, setQuery, statusFilter, setStatusFilter, onStatus }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Submitted Pre-Orders</h2>
          <p className="mt-1 text-sm text-muted">Search by store name, buyer name, or phone number.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_160px]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-muted" size={17} />
            <TextInput className="w-full pl-9" placeholder="Search orders" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </SelectInput>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr className="border-t border-line">
                <td className="px-4 py-8 text-center text-muted" colSpan="7">
                  No pre-orders match the current search or status filter.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line align-top">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3 text-muted">{order.date}</td>
                <td className="px-4 py-3">{order.storeName}</td>
                <td className="px-4 py-3">{order.buyerName}</td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{money(orderTotal(order))}</p>
                  <p className="mt-1 max-w-56 text-xs text-muted">
                    <FileText className="mr-1 inline" size={13} />
                    {order.items.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(", ")}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <SelectInput value={order.status} onChange={(e) => onStatus(order.id, e.target.value)} className="w-40">
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </SelectInput>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductsTable({ products, onUpdate, onDelete }) {
  const activeCount = products.filter((product) => product.active).length;

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <div className="flex flex-col gap-2 border-b border-line p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Product Management</h2>
          <p className="mt-1 text-sm text-muted">Products are sorted alphabetically and can be marked inactive for ordering.</p>
        </div>
        <p className="text-sm font-semibold text-muted">{activeCount} active / {products.length} total</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Unit type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {[...products].sort((a, b) => a.name.localeCompare(b.name)).map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <TextInput value={product.name} onChange={(e) => onUpdate(product.id, { name: e.target.value })} className="w-full" />
                </td>
                <td className="px-4 py-3">
                  <SelectInput value={product.unit} onChange={(e) => onUpdate(product.id, { unit: e.target.value })} className="w-32">
                    {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                  </SelectInput>
                </td>
                <td className="px-4 py-3">
                  <TextInput type="number" min="0" step="0.01" value={product.price} onChange={(e) => onUpdate(product.id, { price: Number(e.target.value) })} className="w-32" />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={product.active}
                    onChange={(e) => onUpdate(product.id, { active: e.target.checked })}
                    className="h-5 w-5 accent-accent"
                    aria-label={`Mark ${product.name} active`}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(product.id)} className="inline-flex rounded-md p-2 text-muted hover:bg-paper hover:text-ink" aria-label={`Delete ${product.name}`}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getTopItem(orders) {
  const totals = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      totals.set(item.name, (totals.get(item.name) || 0) + Number(item.quantity || 0));
    });
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}
