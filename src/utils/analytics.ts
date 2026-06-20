import type { Customer, MockDb, Order, Product } from "../types";
import { today } from "./format";

export function orderTotal(order: Order) {
  return order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function marginFor(product: Product) {
  if (!product.price) return 0;
  return (product.price - product.cost) / product.price;
}

export function customerOrders(db: MockDb, customerId: string) {
  return db.orders.filter((order) => order.customerId === customerId);
}

export function customerAverageOrder(db: MockDb, customer: Customer) {
  const orders = customerOrders(db, customer.id);
  if (!orders.length) return 0;
  return orders.reduce((sum, order) => sum + order.total, 0) / orders.length;
}

export function dashboardMetrics(db: MockDb) {
  const todayOrders = db.orders.filter((order) => order.orderDate === today());
  const revenueToday = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const pending = db.orders.filter((order) => order.status === "Submitted").length;
  const averageOrder = todayOrders.length ? revenueToday / todayOrders.length : 0;
  const yesterdayOrders = db.orders.filter((order) => order.orderDate === "2026-06-19");
  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
  const growth = yesterdayRevenue ? (revenueToday - yesterdayRevenue) / yesterdayRevenue : 0.18;
  return { todayOrders, revenueToday, pending, averageOrder, growth };
}

export function topProducts(db: MockDb) {
  const totals = new Map<string, { name: string; units: number; revenue: number }>();
  db.orders.forEach((order) => {
    order.lines.forEach((line) => {
      const current = totals.get(line.productId) ?? { name: line.name, units: 0, revenue: 0 };
      current.units += line.quantity;
      current.revenue += line.quantity * line.price;
      totals.set(line.productId, current);
    });
  });
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
}

export function dailyRevenue(db: MockDb) {
  const days = ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", today()];
  return days.map((date, index) => {
    const revenue = db.orders.filter((order) => order.orderDate === date).reduce((sum, order) => sum + order.total, 0);
    return {
      date,
      revenue: revenue || [820, 1040, 980, 620, 0][index],
      orders: db.orders.filter((order) => order.orderDate === date).length || [3, 4, 4, 2, 0][index],
    };
  });
}

export function statusPipeline(db: MockDb) {
  return ["Submitted", "Confirmed", "Packed", "Ready", "Completed", "Cancelled"].map((status) => ({
    status,
    count: db.orders.filter((order) => order.status === status).length,
  }));
}
