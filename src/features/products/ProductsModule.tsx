import { useState } from "react";
import type { MockDb, Product, Unit } from "../../types";
import { units } from "../../types";
import { PageHeader } from "../../components/Shell";
import { Badge, Button, Card, Input, Select } from "../../components/ui";
import { marginFor } from "../../utils/analytics";
import { money, percent } from "../../utils/format";

type ProductDraft = Pick<Product, "name" | "category" | "unit" | "price" | "cost" | "seasonalAvailability">;

export function ProductsModule({
  db,
  updateProduct,
  addProduct,
  duplicateYesterdayPrices,
}: {
  db: MockDb;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  addProduct: (input: ProductDraft) => void;
  duplicateYesterdayPrices: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>({
    name: "",
    category: "Mangoes",
    unit: "box",
    price: 0,
    cost: 0,
    seasonalAvailability: "Available",
  });

  function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name || !draft.price) return;
    addProduct(draft);
    setDraft({ name: "", category: "Mangoes", unit: "box", price: 0, cost: 0, seasonalAvailability: "Available" });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Products"
        title="SKU, pricing, margin, and seasonal control"
        description="Manage what buyers can preorder, where margin is moving, and which seasonal items should be surfaced in the fast order grid."
        action={<Button variant="secondary" onClick={duplicateYesterdayPrices}>Duplicate Yesterday's Prices</Button>}
      />

      <Card className="p-4">
        <form onSubmit={submitProduct} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_.8fr_120px_120px_120px_150px_auto]">
          <Input placeholder="Product name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input placeholder="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
          <Select value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value as Unit })}>
            {units.map((unit) => <option key={unit}>{unit}</option>)}
          </Select>
          <Input type="number" placeholder="Price" value={draft.price || ""} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
          <Input type="number" placeholder="Cost" value={draft.cost || ""} onChange={(event) => setDraft({ ...draft, cost: Number(event.target.value) })} />
          <Select value={draft.seasonalAvailability} onChange={(event) => setDraft({ ...draft, seasonalAvailability: event.target.value as Product["seasonalAvailability"] })}>
            {["Peak", "Available", "Limited", "Paused"].map((status) => <option key={status}>{status}</option>)}
          </Select>
          <Button type="submit">Add SKU</Button>
        </form>
      </Card>

      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">SKU / Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Season</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Pricing History</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((product) => (
                <tr key={product.id} className="border-t border-zinc-100 align-top">
                  <td className="px-4 py-3">
                    <Input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} className="w-56" />
                    <p className="mt-1 text-xs text-zinc-500">{product.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Input value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value })} className="w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <Select value={product.unit} onChange={(event) => updateProduct(product.id, { unit: event.target.value as Unit })} className="w-24">
                      {units.map((unit) => <option key={unit}>{unit}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })} className="w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" value={product.cost} onChange={(event) => updateProduct(product.id, { cost: Number(event.target.value) })} className="w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={marginFor(product) > 0.3 ? "green" : "amber"}>{percent(marginFor(product))}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={product.seasonalAvailability} onChange={(event) => updateProduct(product.id, { seasonalAvailability: event.target.value as Product["seasonalAvailability"] })} className="w-32">
                      {["Peak", "Available", "Limited", "Paused"].map((status) => <option key={status}>{status}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={product.active} onChange={(event) => updateProduct(product.id, { active: event.target.checked })} className="h-5 w-5 accent-emerald-900" />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {product.priceHistory.slice(-3).map((point) => (
                      <p key={`${product.id}-${point.date}`}>{point.date}: {money(point.price)} / cost {money(point.cost)}</p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
