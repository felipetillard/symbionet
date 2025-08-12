"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  status: string;
  images: Array<{ url: string; path?: string }> | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string | null;
}

interface ProductDetailClientProps {
  product: Product;
  tenant: Tenant;
}

export default function ProductDetailClient({ product, tenant }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images || [];
  const hasImages = images.length > 0;
  const isOutOfStock = product.inventory_count <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!tenant.whatsapp_number) {
      alert("WhatsApp checkout is not configured for this store.");
      return;
    }

    const message = `Hi! I'd like to order:\n\n🛍️ ${product.name}\n💰 ${formatPrice(product.price)}\n📦 Quantity: ${quantity}\n💵 Total: ${formatPrice(product.price * quantity)}\n\nThank you!`;
    const whatsappUrl = `https://wa.me/${tenant.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/t/${tenant.slug}`}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {tenant.name}
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-green-400">{formatPrice(product.price)}</span>
          <div className="flex items-center gap-2 text-white/60">
            <Package className="w-4 h-4" />
            <span>{product.inventory_count} in stock</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {hasImages ? (
            <>
              {/* Main Image */}
              <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={images[selectedImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-white/5 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-purple-400' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
              <div className="text-center text-white/40">
                <Package className="w-16 h-16 mx-auto mb-4" />
                <p>No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Stock Status */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-white font-medium">
                {isOutOfStock ? 'Out of Stock' : `${product.inventory_count} Available`}
              </span>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white font-medium transition-all"
                >
                  -
                </button>
                <span className="w-16 text-center text-white font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory_count, quantity + 1))}
                  disabled={quantity >= product.inventory_count}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white font-medium transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-white">
                <span>Total:</span>
                <span className="text-2xl font-bold text-green-400">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !tenant.whatsapp_number}
                className="w-full h-14 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Order via WhatsApp'}
              </button>

              {!tenant.whatsapp_number && (
                <p className="text-orange-400 text-sm text-center">
                  WhatsApp checkout is not configured for this store.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 