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
        Sin productos aún. <a className="underline" href={`/t/${tenantSlug}/admin/products/new`}>Agrega tu primer producto</a>.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {products.map((p) => {
        const images = (p.images || []) as Array<{ url: string; path?: string }>;
        const img = images[0]?.url || "/placeholder-3x4.png";
        const isOutOfStock = p.inventory_count === 0;
        const isReducing = reducingStock[p.id] || false;
        
        return (
          <li 
            key={p.id} 
            className={`bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/10 ${
              isOutOfStock ? 'opacity-60 grayscale border-white/5' : 'hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-6">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                <img 
                  src={img} 
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-3x4.png";
                  }}
                />
                {/* Multiple images indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    +{images.length - 1}
                  </div>
                )}
                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                    <div className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                      AGOTADO
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-lg truncate mb-1 ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                  {p.name}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span>Agregado {new Date(p.created_at).toLocaleDateString()}</span>
                  {images.length > 1 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      {images.length} fotos
                    </span>
                  )}
                </div>
              </div>
              
              {/* Stock Section */}
              <div className="text-center w-24">
                <div className="text-sm text-white/60 mb-1">Inventario</div>
                <div className={`text-2xl font-bold mb-3 ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                  {p.inventory_count}
                </div>
                {!isOutOfStock ? (
                  <button
                    onClick={() => handleReduceStock(p.id)}
                    disabled={isReducing}
                    className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {isReducing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-xs">Actualizando</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span>−</span>
                        <span className="text-xs">Vender Uno</span>
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-white/40 font-medium text-xs">SIN STOCK</div>
                  </div>
                )}
              </div>
              
              {/* Price Section */}
              <div className="text-center w-24">
                <div className="text-sm text-white/60 mb-1">Precio</div>
                <div className={`text-xl font-bold ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                  ${Number(p.price).toFixed(2)}
                </div>
              </div>
              
              {/* Edit Button */}
              <div className="w-20">
                <a
                  href={`/t/${tenantSlug}/admin/products/new?id=${p.id}`}
                  className={`inline-flex items-center justify-center w-full px-4 py-2 font-medium border rounded-lg transition-all duration-200 ${
                    isOutOfStock 
                      ? 'text-white/40 bg-white/5 border-white/10 hover:bg-white/10' 
                      : 'text-white bg-white/10 hover:bg-white/20 border-white/20'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm">Editar</span>
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
} 