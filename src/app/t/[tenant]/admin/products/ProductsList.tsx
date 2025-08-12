import React from "react";

type Product = {
  id: string;
  name: string;
  price: number | string;
  images: Array<{ url: string; path?: string }> | null;
  created_at: string;
};

export default function ProductsList({ products, tenantSlug }: { products: Product[]; tenantSlug: string }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-white/70 text-sm">
        No products yet. <a className="underline" href={`/t/${tenantSlug}/admin/products/new`}>Add your first product</a>.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/10">
      {products.map((p) => {
        const images = (p.images || []) as Array<{ url: string; path?: string }>;
        const img = images[0]?.url || "/placeholder-3x4.png";
        return (
          <li key={p.id} className="py-3 flex items-center gap-4">
            <div className="w-12 h-16 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }} />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-white/60">{new Date(p.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-sm text-white/80 w-24">${Number(p.price).toFixed(2)}</div>
            <a
              href={`/t/${tenantSlug}/admin/products/new?id=${p.id}`}
              className="text-sm font-semibold text-[#9ec1ff] hover:underline"
            >
              Edit
            </a>
          </li>
        );
      })}
    </ul>
  );
} 