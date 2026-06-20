import { useEffect, useMemo, useState } from "react";
import type { AppSettings, MockDb, OrderLine, OrderStatus, PackingStatus, Product } from "../types";
import {
  createOrder,
  duplicateYesterdayPrices,
  generateInvoice,
  addProduct,
  loadDb,
  resetDb,
  saveDb,
  updateOrderStatus,
  updatePackingStatus,
  updateProduct,
} from "../services/mockDb";

export function useMockDb() {
  const [db, setDb] = useState<MockDb>(loadDb);

  useEffect(() => {
    saveDb(db);
  }, [db]);

  const activeProducts = useMemo(
    () => db.products.filter((product) => product.active).sort((a, b) => a.name.localeCompare(b.name)),
    [db.products],
  );

  return {
    db,
    activeProducts,
    createOrder: (input: { customerId: string; orderDate: string; fulfillment: "Delivery" | "Pickup"; notes: string; lines: OrderLine[] }) =>
      setDb((current) => createOrder(current, input)),
    updateOrderStatus: (orderId: string, status: OrderStatus) => setDb((current) => updateOrderStatus(current, orderId, status)),
    updatePackingStatus: (orderId: string, status: PackingStatus) => setDb((current) => updatePackingStatus(current, orderId, status)),
    generateInvoice: (orderId: string) => setDb((current) => generateInvoice(current, orderId)),
    addProduct: (input: Parameters<typeof addProduct>[1]) => setDb((current) => addProduct(current, input)),
    updateProduct: (productId: string, patch: Partial<Product>) => setDb((current) => updateProduct(current, productId, patch)),
    duplicateYesterdayPrices: () => setDb((current) => duplicateYesterdayPrices(current)),
    updateSettings: (patch: Partial<AppSettings>) => setDb((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
    reset: () => setDb(resetDb()),
  };
}
