import { useState } from "react";
import { History, Phone } from "lucide-react";
import type { Customer, MockDb } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Badge, Card, Drawer } from "../../components/ui";
import { customerAverageOrder, customerOrders } from "../../utils/analytics";
import { money } from "../../utils/format";

export function CustomersModule({ db }: { db: MockDb }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Store buyer intelligence"
        description="Track buyers, routes, preferred products, payment posture, repeat behavior, and average order size."
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">AOV</th>
                <th className="px-4 py-3">Preferred Products</th>
              </tr>
            </thead>
            <tbody>
              {db.customers.map((customer) => (
                <tr key={customer.id} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedCustomer(customer)} className="font-semibold hover:underline">{customer.storeName}</button>
                  </td>
                  <td className="px-4 py-3">{customer.contactPerson}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.route}</td>
                  <td className="px-4 py-3"><Badge tone={customer.paymentStatus === "Current" ? "green" : customer.paymentStatus === "Due" ? "amber" : "red"}>{customer.paymentStatus}</Badge></td>
                  <td className="px-4 py-3 font-semibold">{money(customerAverageOrder(db, customer))}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {customer.preferredProductIds.map((id) => db.products.find((product) => product.id === id)?.name).filter(Boolean).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Drawer open={Boolean(selectedCustomer)} title={selectedCustomer?.storeName ?? "Customer"} onClose={() => setSelectedCustomer(null)}>
        {selectedCustomer && <CustomerDrawer db={db} customer={selectedCustomer} />}
      </Drawer>
    </div>
  );
}

function CustomerDrawer({ db, customer }: { db: MockDb; customer: Customer }) {
  const orders = customerOrders(db, customer.id);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Contact</p>
          <p className="mt-1 font-semibold">{customer.contactPerson}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Phone</p>
          <p className="mt-1 flex items-center gap-2 font-semibold"><Phone size={15} /> {customer.phone}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Average order</p>
          <p className="mt-1 font-semibold">{money(customerAverageOrder(db, customer))}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Preferred products</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {customer.preferredProductIds.map((id) => {
            const product = db.products.find((item) => item.id === id);
            return product ? <Badge key={id} tone="green">{product.name}</Badge> : null;
          })}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 text-sm">
        <p className="font-semibold">Buyer notes</p>
        <p className="mt-1 text-zinc-500">{customer.notes}</p>
      </div>
      <div>
        <h3 className="mb-2 flex items-center gap-2 font-semibold"><History size={16} /> Order history</h3>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3">
              <div>
                <p className="text-sm font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-zinc-500">{order.orderDate} · {order.status}</p>
              </div>
              <p className="font-semibold">{money(order.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
