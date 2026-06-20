import { ArrowUpRight, Clock3, DollarSign, PackageCheck, ShoppingCart, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MockDb } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Badge, Card } from "../../components/ui";
import { dashboardMetrics, dailyRevenue, statusPipeline, topProducts } from "../../utils/analytics";
import { money, percent, shortDate } from "../../utils/format";

export function Dashboard({ db }: { db: MockDb }) {
  const metrics = dashboardMetrics(db);
  const productLeaders = topProducts(db).slice(0, 5);
  const revenue = dailyRevenue(db);
  const pipeline = statusPipeline(db);

  return (
    <div>
      <PageHeader
        eyebrow="Executive operations"
        title="Daily wholesale command center"
        description="A dense operating view for today's preorder cycle, packing workload, product demand, and revenue movement."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<ShoppingCart size={18} />} label="Orders Today" value={String(metrics.todayOrders.length)} trend="+14%" />
        <KpiCard icon={<DollarSign size={18} />} label="Revenue Today" value={money(metrics.revenueToday)} trend={percent(metrics.growth)} />
        <KpiCard icon={<Clock3 size={18} />} label="Pending Confirmations" value={String(metrics.pending)} trend="Needs action" tone="amber" />
        <KpiCard icon={<TrendingUp size={18} />} label="Average Order Value" value={money(metrics.averageOrder)} trend="+8.2%" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Weekly Revenue Trend</h2>
              <p className="mt-1 text-sm text-zinc-500">Preorder value by operating day.</p>
            </div>
            <Badge tone="green">Live local demo</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(value) => shortDate(String(value))} />
                <Area dataKey="revenue" stroke="#064e3b" strokeWidth={2} fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold">Status Pipeline</h2>
            <p className="mt-1 text-sm text-zinc-500">Where today's work is sitting.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid stroke="#e4e4e7" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis dataKey="status" type="category" width={86} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#18181b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <PackageCheck size={18} />
            <h2 className="font-semibold">Top Products</h2>
          </div>
          <div className="space-y-3">
            {productLeaders.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{index + 1}. {product.name}</p>
                  <p className="text-xs text-zinc-500">{product.units} units ordered</p>
                </div>
                <p className="text-sm font-semibold">{money(product.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Operational Alerts</h2>
              <p className="mt-1 text-sm text-zinc-500">Notes, payment holds, and packing friction surfaced before they become phone calls.</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <AlertCard label="Notes alerts" value={String(db.orders.filter((order) => order.notesAlert).length)} description="orders with receiving instructions" />
            <AlertCard label="Payment due" value={String(db.customers.filter((customer) => customer.paymentStatus === "Due").length)} description="customers need follow-up" />
            <AlertCard label="Active SKUs" value={String(db.products.filter((product) => product.active).length)} description="available for preorder" />
          </div>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({ icon, label, value, trend, tone = "green" }: { icon: React.ReactNode; label: string; value: string; trend: string; tone?: "green" | "amber" }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white">{icon}</div>
        <Badge tone={tone}>{trend}</Badge>
      </div>
      <p className="mt-5 text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}

function AlertCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
}
