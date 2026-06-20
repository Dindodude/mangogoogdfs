export const orderStatuses = ["Submitted", "Confirmed", "Packed", "Ready", "Completed", "Cancelled"] as const;
export const packingStatuses = ["Not started", "Picking", "Packed", "Staged", "Loaded"] as const;
export const paymentStatuses = ["Current", "Due", "Hold"] as const;
export const units = ["box", "case", "lb", "kg"] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PackingStatus = (typeof packingStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type Unit = (typeof units)[number];

export type PricePoint = {
  date: string;
  price: number;
  cost: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: Unit;
  price: number;
  cost: number;
  active: boolean;
  seasonalAvailability: "Peak" | "Available" | "Limited" | "Paused";
  priceHistory: PricePoint[];
};

export type Customer = {
  id: string;
  storeName: string;
  contactPerson: string;
  phone: string;
  route: string;
  preferredProductIds: string[];
  paymentStatus: PaymentStatus;
  notes: string;
};

export type OrderLine = {
  productId: string;
  sku: string;
  name: string;
  unit: Unit;
  price: number;
  quantity: number;
  notes?: string;
  recommendation?: "repeat" | "preferred" | "manual";
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  message: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  customerId: string;
  storeName: string;
  contactPerson: string;
  phone: string;
  orderDate: string;
  createdAt: string;
  fulfillment: "Delivery" | "Pickup";
  route: string;
  batch: string;
  status: OrderStatus;
  packingStatus: PackingStatus;
  notes: string;
  notesAlert: boolean;
  lines: OrderLine[];
  total: number;
  auditTrail: AuditEvent[];
};

export type AppSettings = {
  businessName: string;
  orderCycleLabel: string;
  orderCutoffTime: string;
  nextShipmentDate: string;
  orderingClosed: boolean;
  defaultRoute: string;
};

export type MockDb = {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  settings: AppSettings;
};

export type ModuleKey = "dashboard" | "orders" | "products" | "customers" | "reports" | "settings";
