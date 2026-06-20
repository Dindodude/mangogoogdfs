import type { MockDb, Order, OrderLine, OrderStatus, PackingStatus, Product } from "../types";
import { createInitialDb } from "../mock/data";
import { today, uid } from "../utils/format";

const STORAGE_KEY = "produce-enterprise-saas-v1";

export function loadDb(): MockDb {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as MockDb) : createInitialDb();
    if (!Array.isArray(parsed.customers) || !Array.isArray(parsed.products) || !Array.isArray(parsed.orders)) {
      return createInitialDb();
    }
    return { ...createInitialDb(), ...parsed };
  } catch {
    return createInitialDb();
  }
}

export function saveDb(db: MockDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb() {
  const initial = createInitialDb();
  saveDb(initial);
  return initial;
}

export function buildOrderLines(products: Product[], quantities: Record<string, number>, notes: Record<string, string> = {}): OrderLine[] {
  return products
    .map((product) => ({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      price: product.price,
      quantity: Number(quantities[product.id] || 0),
      notes: notes[product.id],
      recommendation: "manual" as const,
    }))
    .filter((line) => line.quantity > 0);
}

export function createOrder(db: MockDb, input: {
  customerId: string;
  orderDate: string;
  fulfillment: "Delivery" | "Pickup";
  notes: string;
  lines: OrderLine[];
}): MockDb {
  const customer = db.customers.find((candidate) => candidate.id === input.customerId);
  if (!customer || input.lines.length === 0) return db;
  const createdAt = new Date().toISOString();
  const orderSequence = db.orders.length + 1001;
  const orderNumber = `PO-${input.orderDate.replaceAll("-", "")}-${orderSequence}`;
  const invoiceNumber = `INV-${input.orderDate.replaceAll("-", "")}-${300 + db.orders.length + 1}`;
  const total = input.lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
  const order: Order = {
    id: uid("ord"),
    orderNumber,
    invoiceNumber,
    customerId: customer.id,
    storeName: customer.storeName,
    contactPerson: customer.contactPerson,
    phone: customer.phone,
    orderDate: input.orderDate,
    createdAt,
    fulfillment: input.fulfillment,
    route: input.fulfillment === "Pickup" ? "Pickup" : customer.route,
    batch: input.fulfillment === "Pickup" ? "Pickup Hold" : customer.route === "Route A" ? "AM-A1" : "AM-B1",
    status: "Submitted",
    packingStatus: "Not started",
    notes: input.notes,
    notesAlert: input.notes.trim().length > 0,
    lines: input.lines,
    total,
    auditTrail: [
      { id: uid("audit"), at: createdAt, actor: "Portal", message: "Order submitted." },
      { id: uid("audit"), at: createdAt, actor: "System", message: `${invoiceNumber} generated.` },
    ],
  };
  return { ...db, orders: [order, ...db.orders] };
}

export function updateOrderStatus(db: MockDb, orderId: string, status: OrderStatus): MockDb {
  return updateOrder(db, orderId, { status }, `Status changed to ${status}.`);
}

export function updatePackingStatus(db: MockDb, orderId: string, packingStatus: PackingStatus): MockDb {
  return updateOrder(db, orderId, { packingStatus }, `Packing status changed to ${packingStatus}.`);
}

export function generateInvoice(db: MockDb, orderId: string): MockDb {
  const nextInvoice = `INV-${today().replaceAll("-", "")}-${300 + db.orders.length + 1}`;
  return updateOrder(db, orderId, { invoiceNumber: nextInvoice }, `${nextInvoice} generated.`);
}

export function updateProduct(db: MockDb, productId: string, patch: Partial<Product>): MockDb {
  return {
    ...db,
    products: db.products
      .map((product) => {
        if (product.id !== productId) return product;
        const next = { ...product, ...patch };
        if (patch.price || patch.cost) {
          next.priceHistory = [
            ...product.priceHistory,
            { date: today(), price: Number(next.price), cost: Number(next.cost) },
          ];
        }
        return next;
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function addProduct(db: MockDb, input: Pick<Product, "name" | "category" | "unit" | "price" | "cost" | "seasonalAvailability">): MockDb {
  const sku = `${input.category.slice(0, 3).toUpperCase()}-${input.name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")}-${input.unit.toUpperCase()}`;
  const product: Product = {
    id: uid("prod"),
    sku,
    name: input.name,
    category: input.category,
    unit: input.unit,
    price: Number(input.price),
    cost: Number(input.cost),
    active: true,
    seasonalAvailability: input.seasonalAvailability,
    priceHistory: [{ date: today(), price: Number(input.price), cost: Number(input.cost) }],
  };
  return {
    ...db,
    products: [...db.products, product].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function duplicateYesterdayPrices(db: MockDb): MockDb {
  return {
    ...db,
    products: db.products.map((product) => {
      const yesterday = product.priceHistory[product.priceHistory.length - 2] ?? product.priceHistory[product.priceHistory.length - 1];
      if (!yesterday) return product;
      return {
        ...product,
        price: yesterday.price,
        cost: yesterday.cost,
        priceHistory: [...product.priceHistory, { date: today(), price: yesterday.price, cost: yesterday.cost }],
      };
    }),
  };
}

export function repeatPreviousOrder(db: MockDb, customerId: string): Record<string, number> {
  const previous = db.orders.find((order) => order.customerId === customerId);
  if (!previous) return {};
  return Object.fromEntries(previous.lines.map((line) => [line.productId, line.quantity]));
}

function updateOrder(db: MockDb, orderId: string, patch: Partial<Order>, message: string): MockDb {
  const at = new Date().toISOString();
  return {
    ...db,
    orders: db.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            ...patch,
            auditTrail: [...order.auditTrail, { id: uid("audit"), at, actor: "Operations", message }],
          }
        : order,
    ),
  };
}
