import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Command,
  LayoutDashboard,
  PackageCheck,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import type { ModuleKey } from "../types";
import { minutesUntil, today } from "../utils/format";
import { Button, cn, Input } from "./ui";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

const navItems: Array<{ key: ModuleKey; label: string; icon: IconComponent }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "products", label: "Products", icon: Boxes },
  { key: "customers", label: "Customers", icon: Users },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

export function Shell({
  activeModule,
  businessName,
  orderCycleLabel,
  cutoffTime,
  nextShipmentDate,
  globalSearch,
  onSearch,
  onModuleChange,
  onNewOrder,
  onCommand,
  children,
}: {
  activeModule: ModuleKey;
  businessName: string;
  orderCycleLabel: string;
  cutoffTime: string;
  nextShipmentDate: string;
  globalSearch: string;
  onSearch: (value: string) => void;
  onModuleChange: (module: ModuleKey) => void;
  onNewOrder: () => void;
  onCommand: () => void;
  children: React.ReactNode;
}) {
  const cutoffMinutes = minutesUntil(cutoffTime);

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200/80 bg-zinc-950 text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-zinc-950">
              <PackageCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{businessName}</p>
              <p className="text-xs text-zinc-400">Wholesale Ops</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onModuleChange(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                  active ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-300 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            <CalendarClock size={14} /> Cutoff
          </div>
          <p className="mt-3 text-2xl font-semibold">{cutoffMinutes}m</p>
          <p className="mt-1 text-xs text-zinc-400">until today's preorder window closes</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#f8f7f4]/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="lg:hidden">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-white">
                  <PackageCheck size={18} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">{businessName}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>{orderCycleLabel}</span>
                  <span>•</span>
                  <span>Shipment {nextShipmentDate || today()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row xl:max-w-3xl">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-zinc-400" size={17} />
                <Input
                  value={globalSearch}
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder="Search orders, stores, products..."
                  className="w-full pl-9"
                />
              </label>
              <Button variant="secondary" onClick={onCommand}>
                <Command size={16} /> Cmd K
              </Button>
              <Button variant="secondary">
                <Bell size={16} /> 3
              </Button>
              <Button onClick={onNewOrder}>
                <Sparkles size={16} /> New Order
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:py-7">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-zinc-200 bg-white lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onModuleChange(item.key)}
              className={cn("grid gap-1 px-1 py-2 text-[10px] font-semibold", activeModule === item.key ? "text-zinc-950" : "text-zinc-400")}
            >
              <Icon className="mx-auto" size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <Building2 className="mx-auto text-zinc-400" size={24} />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
