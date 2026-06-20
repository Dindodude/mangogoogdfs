import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MockDb } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Card } from "../../components/ui";
import { dailyRevenue, topProducts } from "../../utils/analytics";
import { money, shortDate } from "../../utils/format";

export function ReportsModule({ db }: { db: MockDb }) {
  const revenue = dailyRevenue(db);
  const products = topProducts(db).slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Sales, demand, and repeat customer analytics"
        description="Operational reporting for daily sales, product demand, repeat customers, revenue trends, and best-selling SKUs."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Daily Sales</h2>
          <p className="mt-1 text-sm text-zinc-500">Revenue by preorder date.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#064e3b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Product Demand</h2>
          <p className="mt-1 text-sm text-zinc-500">Best-selling SKUs by units.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="units" fill="#18181b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
      <section className="mt-5 grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Repeat Customers</p>
          <p className="mt-2 text-3xl font-semibold">{db.customers.filter((customer) => db.orders.filter((order) => order.customerId === customer.id).length > 1).length}</p>
          <p className="mt-1 text-sm text-zinc-500">customers with multiple recent orders</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Best SKU</p>
          <p className="mt-2 text-2xl font-semibold">{products[0]?.name ?? "No orders"}</p>
          <p className="mt-1 text-sm text-zinc-500">{products[0]?.units ?? 0} units ordered</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Revenue Trend</p>
          <p className="mt-2 text-3xl font-semibold">{money(revenue.reduce((sum, day) => sum + day.revenue, 0))}</p>
          <p className="mt-1 text-sm text-zinc-500">rolling five-day demo revenue</p>
        </Card>
      </section>
    </div>
  );
}
