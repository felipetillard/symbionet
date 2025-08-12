"use client";
import React, { useState } from "react";
import { reduceInventoryAction } from "./new/server-actions";

type Product = {
  id: string;
  name: string;
  price: number | string;
  images: Array<{ url: string; path?: string }> | null;
  inventory_count: number;
  created_at: string;
};

export default function ProductsList({ products, tenantSlug }: { products: Product[]; tenantSlug: string }) {
  const [reducingStock, setReducingStock] = useState<Record<string, boolean>>({});

  const handleReduceStock = async (productId: string) => {
    setReducingStock(prev => ({ ...prev, [productId]: true }));
    try {
      await reduceInventoryAction(tenantSlug, productId);
    } catch (error) {
      console.error('Error reducing stock:', error);
      // You could add a toast notification here
    } finally {
      setReducingStock(prev => ({ ...prev, [productId]: false }));
    }
  };

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
        const isOutOfStock = p.inventory_count === 0;
        const isReducing = reducingStock[p.id] || false;
        
        return (
          <li 
            key={p.id} 
            className={`py-4 flex items-center gap-4 transition-all ${
              isOutOfStock ? 'opacity-50 grayscale' : ''
            }`}
          >
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
              {/* Out of stock indicator */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">OUT</span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${isOutOfStock ? 'text-gray-400' : 'text-white'}`}>
                {p.name}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
            
            {/* Stock Info */}
            <div className="text-center min-w-[60px]">
              <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-400' : 'text-white/80'}`}>
                Stock: {p.inventory_count}
              </div>
              {!isOutOfStock && (
                <button
                  onClick={() => handleReduceStock(p.id)}
                  disabled={isReducing}
                  className="mt-1 px-2 py-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReducing ? '...' : '-1'}
                </button>
              )}
              {isOutOfStock && (
                <div className="mt-1 text-xs text-red-400 font-medium">
                  OUT OF STOCK
                </div>
              )}
            </div>
            
            {/* Price */}
            <div className={`text-sm font-medium w-20 text-right ${isOutOfStock ? 'text-gray-400' : 'text-white/80'}`}>
              ${Number(p.price).toFixed(2)}
            </div>
            
            {/* Edit Button */}
            <a
              href={`/t/${tenantSlug}/admin/products/new?id=${p.id}`}
              className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                isOutOfStock 
                  ? 'text-gray-400 bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20' 
                  : 'text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30'
              }`}
            >
              Edit
            </a>
          </li>
        );
      })}
    </ul>
  );
} 