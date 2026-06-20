import type { Customer, MockDb, Order, Product } from "../types";
import { today } from "../utils/format";

const todayValue = today();

export const products: Product[] = [
  product("prod-1", "MNG-SIN-BOX", "Sindhri Mango", "Mangoes", "box", 34, 23, "Peak", [
    ["2026-06-18", 32, 22],
    ["2026-06-19", 33, 22],
    [todayValue, 34, 23],
  ]),
  product("prod-2", "MNG-ANR-BOX", "Anwar Ratol Mango", "Mangoes", "box", 42, 29, "Limited", [
    ["2026-06-18", 41, 28],
    ["2026-06-19", 42, 29],
    [todayValue, 42, 29],
  ]),
  product("prod-3", "MNG-CHA-BOX", "Chaunsa Mango", "Mangoes", "box", 38, 26, "Available", [
    ["2026-06-18", 37, 25],
    ["2026-06-19", 38, 26],
    [todayValue, 38, 26],
  ]),
  product("prod-4", "FRU-JAM-CASE", "Jamun", "Berries", "case", 48, 34, "Peak", [
    ["2026-06-18", 46, 33],
    ["2026-06-19", 48, 34],
    [todayValue, 48, 34],
  ]),
  product("prod-5", "FRU-CHE-CASE", "Cheeko", "Tropical", "case", 36, 24, "Available", [
    ["2026-06-18", 35, 24],
    ["2026-06-19", 36, 24],
    [todayValue, 36, 24],
  ]),
  product("prod-6", "STN-APR-CASE", "Apricot", "Stone Fruit", "case", 31, 21, "Available", [
    ["2026-06-18", 30, 20],
    ["2026-06-19", 31, 21],
    [todayValue, 31, 21],
  ]),
  product("prod-7", "STN-PLM-CASE", "Plum", "Stone Fruit", "case", 29, 19, "Available", [
    ["2026-06-18", 29, 18],
    ["2026-06-19", 28, 18],
    [todayValue, 29, 19],
  ]),
];

export const customers: Customer[] = [
  {
    id: "cust-1",
    storeName: "Northside Foods",
    contactPerson: "Sam Patel",
    phone: "555-0199",
    route: "Route A",
    preferredProductIds: ["prod-1", "prod-3", "prod-4"],
    paymentStatus: "Current",
    notes: "Prefers early delivery window and firm mangoes.",
  },
  {
    id: "cust-2",
    storeName: "Sample Market",
    contactPerson: "A. Khan",
    phone: "555-0134",
    route: "Route B",
    preferredProductIds: ["prod-1", "prod-2", "prod-4", "prod-7"],
    paymentStatus: "Due",
    notes: "Call before delivery dock arrival.",
  },
  {
    id: "cust-3",
    storeName: "Corner Grocer",
    contactPerson: "M. Ali",
    phone: "555-0188",
    route: "Pickup",
    preferredProductIds: ["prod-3", "prod-5", "prod-7"],
    paymentStatus: "Current",
    notes: "Usually picks up after 2 PM.",
  },
  {
    id: "cust-4",
    storeName: "Metro Fresh Mart",
    contactPerson: "N. Shah",
    phone: "555-0171",
    route: "Route A",
    preferredProductIds: ["prod-2", "prod-3", "prod-6"],
    paymentStatus: "Current",
    notes: "Requests WhatsApp confirmation after packing.",
  },
];

export const orders: Order[] = [
  order("ord-1001", "PO-20260620-1001", "INV-20260620-301", "cust-1", todayValue, "Submitted", "Not started", [
    ["prod-1", 5, "repeat"],
    ["prod-3", 4, "preferred"],
    ["prod-4", 2, "repeat"],
  ], "Delivery", "High-priority receiving window."),
  order("ord-1002", "PO-20260620-1002", "INV-20260620-302", "cust-2", todayValue, "Confirmed", "Picking", [
    ["prod-1", 4, "repeat"],
    ["prod-2", 2, "preferred"],
    ["prod-7", 3, "manual"],
  ], "Delivery", "Deliver before noon if possible."),
  order("ord-1003", "PO-20260620-1003", "INV-20260620-303", "cust-3", todayValue, "Ready", "Staged", [
    ["prod-3", 6, "repeat"],
    ["prod-5", 2, "preferred"],
    ["prod-7", 3, "repeat"],
  ], "Pickup", ""),
  order("ord-1004", "PO-20260619-1004", "INV-20260619-244", "cust-4", "2026-06-19", "Completed", "Loaded", [
    ["prod-2", 3, "repeat"],
    ["prod-6", 4, "preferred"],
  ], "Delivery", "WhatsApp confirmation sent."),
  order("ord-1005", "PO-20260618-1005", "INV-20260618-198", "cust-1", "2026-06-18", "Completed", "Loaded", [
    ["prod-1", 5, "repeat"],
    ["prod-4", 2, "repeat"],
  ], "Delivery", ""),
];

export function createInitialDb(): MockDb {
  return {
    customers,
    products,
    orders,
    settings: {
      businessName: "Business Name Placeholder",
      orderCycleLabel: "Today 4:00 AM - 11:00 AM",
      orderCutoffTime: "11:00",
      nextShipmentDate: todayValue,
      orderingClosed: false,
      defaultRoute: "Route A",
    },
  };
}

function product(
  id: string,
  sku: string,
  name: Product["name"],
  category: string,
  unit: Product["unit"],
  price: number,
  cost: number,
  seasonalAvailability: Product["seasonalAvailability"],
  priceHistory: Array<[string, number, number]>,
): Product {
  return {
    id,
    sku,
    name,
    category,
    unit,
    price,
    cost,
    active: true,
    seasonalAvailability,
    priceHistory: priceHistory.map(([date, historyPrice, historyCost]) => ({
      date,
      price: historyPrice,
      cost: historyCost,
    })),
  };
}

function order(
  id: string,
  orderNumber: string,
  invoiceNumber: string,
  customerId: string,
  orderDate: string,
  status: Order["status"],
  packingStatus: Order["packingStatus"],
  orderLines: Array<[string, number, NonNullable<Order["lines"][number]["recommendation"]>]>,
  fulfillment: Order["fulfillment"],
  notes: string,
): Order {
  const customer = customers.find((candidate) => candidate.id === customerId)!;
  const lines = orderLines.map(([productId, quantity, recommendation]) => {
    const orderProduct = products.find((candidate) => candidate.id === productId)!;
    return {
      productId,
      sku: orderProduct.sku,
      name: orderProduct.name,
      unit: orderProduct.unit,
      price: orderProduct.price,
      quantity,
      recommendation,
    };
  });
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return {
    id,
    orderNumber,
    invoiceNumber,
    customerId,
    storeName: customer.storeName,
    contactPerson: customer.contactPerson,
    phone: customer.phone,
    orderDate,
    createdAt: `${orderDate}T08:12:00`,
    fulfillment,
    route: customer.route,
    batch: fulfillment === "Pickup" ? "Pickup Hold" : customer.route === "Route A" ? "AM-A1" : "AM-B1",
    status,
    packingStatus,
    notes,
    notesAlert: notes.length > 0,
    lines,
    total,
    auditTrail: [
      { id: `${id}-audit-1`, at: `${orderDate}T08:12:00`, actor: "System", message: "Order created from daily preorder portal." },
      { id: `${id}-audit-2`, at: `${orderDate}T08:14:00`, actor: "Operations", message: `Status set to ${status}.` },
    ],
  };
}
