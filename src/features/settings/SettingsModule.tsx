import type { AppSettings } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Button, Card, Input, Select } from "../../components/ui";

export function SettingsModule({
  settings,
  updateSettings,
  reset,
}: {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}) {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Operating cycle configuration"
        description="Control the mock business profile, ordering cutoff, next shipment date, and default route settings."
      />
      <Card className="max-w-4xl p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">
            Business name
            <Input value={settings.businessName} onChange={(event) => updateSettings({ businessName: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Current order cycle
            <Input value={settings.orderCycleLabel} onChange={(event) => updateSettings({ orderCycleLabel: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Order cutoff time
            <Input type="time" value={settings.orderCutoffTime} onChange={(event) => updateSettings({ orderCutoffTime: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Next shipment date
            <Input type="date" value={settings.nextShipmentDate} onChange={(event) => updateSettings({ nextShipmentDate: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Default route
            <Select value={settings.defaultRoute} onChange={(event) => updateSettings({ defaultRoute: event.target.value })}>
              {["Route A", "Route B", "Pickup"].map((route) => <option key={route}>{route}</option>)}
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Ordering status
            <Select value={settings.orderingClosed ? "Closed" : "Open"} onChange={(event) => updateSettings({ orderingClosed: event.target.value === "Closed" })}>
              <option>Open</option>
              <option>Closed</option>
            </Select>
          </label>
        </div>
        <div className="mt-5 flex justify-end border-t border-zinc-200 pt-5">
          <Button variant="danger" onClick={reset}>Reset Local Demo Data</Button>
        </div>
      </Card>
    </div>
  );
}
