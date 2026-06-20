import { useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, Command, Download, LayoutDashboard, Search, Settings, ShoppingCart, Sparkles, Users } from "lucide-react";
import type { ModuleKey } from "./types";
import { Shell } from "./components/Shell";
import { Button, Input, Modal, ToastMessage, ToastViewport } from "./components/ui";
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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function notify(title: string, description?: string, tone: ToastMessage["tone"] = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3800);
  }

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
            createOrder={(input) => {
              createOrder(input);
              notify("Preorder submitted", "Order created, invoice number assigned, and audit trail updated.");
            }}
            updateOrderStatus={(orderId, status) => {
              updateOrderStatus(orderId, status);
              notify("Order status updated", `Moved to ${status}.`);
            }}
            updatePackingStatus={(orderId, status) => {
              updatePackingStatus(orderId, status);
              notify("Packing status updated", `Packing is now ${status}.`);
            }}
            generateInvoice={(orderId) => {
              generateInvoice(orderId);
              notify("Invoice regenerated", "A new invoice number was added to the audit trail.");
            }}
          />
        );
      case "products":
        return (
          <ProductsModule
            db={db}
            updateProduct={updateProduct}
            addProduct={(input) => {
              addProduct(input);
              notify("SKU added", `${input.name} is active for preorder.`);
            }}
            duplicateYesterdayPrices={() => {
              duplicateYesterdayPrices();
              notify("Prices duplicated", "Yesterday's price sheet is now today's active price sheet.");
            }}
          />
        );
      case "customers":
        return <CustomersModule db={db} />;
      case "reports":
        return <ReportsModule db={db} />;
      case "settings":
        return (
          <SettingsModule
            settings={db.settings}
            updateSettings={(patch) => {
              updateSettings(patch);
              notify("Settings updated", "Operating cycle configuration saved.");
            }}
            reset={() => {
              reset();
              notify("Demo data reset", "Local mock database restored.", "neutral");
            }}
          />
        );
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
        onSearch={(query) => {
          setGlobalSearch(query);
          setCommandOpen(false);
        }}
      />
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </>
  );
}

function CommandPalette({
  open,
  onClose,
  onModuleChange,
  onNewOrder,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onModuleChange: (module: ModuleKey) => void;
  onNewOrder: () => void;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const commands = [
    { id: "new-order", label: "Create new preorder", hint: "Start customer-first order workflow", icon: ShoppingCart, action: onNewOrder },
    { id: "search-pending", label: "Find pending confirmations", hint: "Filter global search to submitted work", icon: Search, action: () => onSearch("Submitted") },
    { id: "export", label: "Open export-ready orders", hint: "Go to Orders for CSV/PDF actions", icon: Download, action: () => onModuleChange("orders") },
    { id: "reports", label: "Open revenue reports", hint: "View daily sales and demand charts", icon: BarChart3, action: () => onModuleChange("reports") },
    ...((Object.keys(moduleMeta) as ModuleKey[]).map((module) => ({
      id: module,
      label: `Go to ${moduleMeta[module].label}`,
      hint: "Navigate workspace",
      icon: moduleMeta[module].icon,
      action: () => onModuleChange(module),
    }))),
  ];
  const filteredCommands = commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal open={open} title="Command palette" onClose={onClose}>
      <label className="relative mb-4 block">
        <Search className="absolute left-3 top-2.5 text-zinc-400" size={17} />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands, modules, exports..." className="w-full pl-9" autoFocus />
      </label>
      <div className="grid gap-2">
        {filteredCommands.map((command) => {
          const Icon = command.icon;
          return (
            <Button key={command.id} variant={command.id === "new-order" ? "secondary" : "ghost"} onClick={command.action} className="h-auto justify-start py-3">
              <Icon size={16} />
              <span className="text-left">
                <span className="block">{command.label}</span>
                <span className="block text-xs font-normal text-zinc-500">{command.hint}</span>
              </span>
            </Button>
          );
        })}
        <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
          <Command className="mr-1 inline" size={13} /> Shortcuts: <strong>N</strong> new order, <strong>/</strong> search, <strong>Ctrl/Cmd K</strong> commands, <strong>Esc</strong> close.
          <Sparkles className="ml-2 mr-1 inline" size={13} /> Designed for high-volume operators who should not be hunting through menus.
        </div>
      </div>
    </Modal>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}
