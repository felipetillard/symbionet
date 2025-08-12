"use client";
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
          <li key={p.id} className="py-4 flex items-center gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
              <img 
                src={img} 
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-3x4.png";
                }}
              />
              {/* Show indicator if multiple images */}
              {images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full">
                  +{images.length - 1}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{p.name}</div>
              <div className="text-xs text-white/60 mt-1">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
            
            {/* Price */}
            <div className="text-sm text-white/80 font-medium w-20 text-right">
              ${Number(p.price).toFixed(2)}
            </div>
            
            {/* Edit Button */}
            <a
              href={`/t/${tenantSlug}/admin/products/new?id=${p.id}`}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md transition-colors"
            >
              Edit
            </a>
          </li>
        );
      })}
    </ul>
  );
} 