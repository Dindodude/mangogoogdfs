import { useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, Command, LayoutDashboard, Search, Settings, ShoppingCart, Users } from "lucide-react";
import type { ModuleKey } from "./types";
import { Shell } from "./components/Shell";
import { Button, Modal } from "./components/ui";
import { useMockDb } from "./hooks/useMockDb";
import { Dashboard } from "./features/dashboard/Dashboard";
import { OrdersModule } from "./features/orders/OrdersModule";
import { ProductsModule } from "./features/products/ProductsModule";
import { CustomersModule } from "./features/customers/CustomersModule";
import { ReportsModule } from "./features/reports/ReportsModule";
import { SettingsModule } from "./features/settings/SettingsModule";

const moduleMeta: Record<ModuleKey, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard },
  orders: { label: "Orders", icon: ShoppingCart },
  products: { label: "Products", icon: Boxes },
  customers: { label: "Customers", icon: Users },
  reports: { label: "Reports", icon: BarChart3 },
  settings: { label: "Settings", icon: Settings },
};

export default function App() {
  const {
    db,
    createOrder,
    updateOrderStatus,
    updatePackingStatus,
    generateInvoice,
    updateProduct,
    addProduct,
    duplicateYesterdayPrices,
    updateSettings,
    reset,
  } = useMockDb();
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      if (key === "n" && !isTypingTarget(event.target)) {
        setActiveModule("orders");
      }
      if (key === "escape") {
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const visibleModule = useMemo(() => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard db={db} />;
      case "orders":
        return (
          <OrdersModule
            db={db}
            globalSearch={globalSearch}
            createOrder={createOrder}
            updateOrderStatus={updateOrderStatus}
            updatePackingStatus={updatePackingStatus}
            generateInvoice={generateInvoice}
          />
        );
      case "products":
        return (
          <ProductsModule
            db={db}
            updateProduct={updateProduct}
            addProduct={addProduct}
            duplicateYesterdayPrices={duplicateYesterdayPrices}
          />
        );
      case "customers":
        return <CustomersModule db={db} />;
      case "reports":
        return <ReportsModule db={db} />;
      case "settings":
        return <SettingsModule settings={db.settings} updateSettings={updateSettings} reset={reset} />;
      default:
        return <Dashboard db={db} />;
    }
  }, [
    activeModule,
    addProduct,
    createOrder,
    db,
    duplicateYesterdayPrices,
    generateInvoice,
    globalSearch,
    reset,
    updateOrderStatus,
    updatePackingStatus,
    updateProduct,
    updateSettings,
  ]);

  return (
    <>
      <Shell
        activeModule={activeModule}
        businessName={db.settings.businessName}
        orderCycleLabel={db.settings.orderCycleLabel}
        cutoffTime={db.settings.orderCutoffTime}
        nextShipmentDate={db.settings.nextShipmentDate}
        globalSearch={globalSearch}
        onSearch={setGlobalSearch}
        onModuleChange={setActiveModule}
        onNewOrder={() => setActiveModule("orders")}
        onCommand={() => setCommandOpen(true)}
      >
        {visibleModule}
      </Shell>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onModuleChange={(module) => {
          setActiveModule(module);
          setCommandOpen(false);
        }}
        onNewOrder={() => {
          setActiveModule("orders");
          setCommandOpen(false);
        }}
      />
    </>
  );
}

function CommandPalette({
  open,
  onClose,
  onModuleChange,
  onNewOrder,
}: {
  open: boolean;
  onClose: () => void;
  onModuleChange: (module: ModuleKey) => void;
  onNewOrder: () => void;
}) {
  return (
    <Modal open={open} title="Command palette" onClose={onClose}>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500">
        <Search size={16} /> Type-to-search command palette mock. Shortcuts: N new order, / search, Ctrl/Cmd K commands.
      </div>
      <div className="grid gap-2">
        <Button variant="secondary" onClick={onNewOrder} className="justify-start">
          <ShoppingCart size={16} /> Create new preorder
        </Button>
        {(Object.keys(moduleMeta) as ModuleKey[]).map((module) => {
          const Icon = moduleMeta[module].icon;
          return (
            <Button key={module} variant="ghost" onClick={() => onModuleChange(module)} className="justify-start">
              <Icon size={16} /> Go to {moduleMeta[module].label}
            </Button>
          );
        })}
        <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
          <Command className="mr-1 inline" size={13} />
          In production this becomes an indexed command system for order lookup, customer search, exports, quick edits, and route actions.
        </div>
      </div>
    </Modal>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}
