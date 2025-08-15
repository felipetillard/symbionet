"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Heart, Minus, Plus } from "lucide-react";

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
      alert("El pago por WhatsApp no está configurado para esta tienda.");
      return;
    }

    const message = `¡Hola! Me gustaría pedir:\n\n🛍️ ${product.name}\n💰 ${formatPrice(product.price)}\n📦 Cantidad: ${quantity}\n💵 Total: ${formatPrice(product.price * quantity)}\n\n¡Gracias!`;
    const whatsappUrl = `https://wa.me/${tenant.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href={`/t/${tenant.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-medium text-gray-900">Product Detail</h1>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            {/* Image selector */}
            {hasImages && images.length > 1 && (
              <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-6">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-gray-500 ${
                        selectedImageIndex === index ? 'ring-2 ring-gray-500' : ''
                      }`}
                    >
                      <span className="sr-only">Image {index + 1}</span>
                      <span className="absolute inset-0 rounded-md overflow-hidden">
                        <img src={image.url} alt="" className="w-full h-full object-center object-cover" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full aspect-w-1 aspect-h-1">
              {hasImages ? (
                <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                  <img
                    src={images[selectedImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-base text-gray-700 space-y-6">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center">
                <h3 className="text-sm text-gray-600">Availability</h3>
                <div className="ml-4 flex items-center">
                  <div className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span className="ml-2 text-sm text-gray-500">
                    {isOutOfStock ? 'Out of stock' : `${product.inventory_count} in stock`}
                  </span>
                </div>
              </div>
            </div>

            {/* Size picker */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Available Size</h3>
              </div>
              <div className="mt-2">
                <button className="group relative border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 bg-white shadow-sm text-gray-900 cursor-pointer">
                  S
                </button>
              </div>
            </div>

            <form className="mt-6">
              {/* Quantity */}
              <div className="flex items-center space-x-3">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.inventory_count, quantity + 1))}
                    disabled={quantity >= product.inventory_count}
                    className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !tenant.whatsapp_number}
                  className="flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOutOfStock ? 'Out of stock' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Add to favorites
                </button>
              </div>
            </form>

            {!tenant.whatsapp_number && (
              <p className="mt-4 text-orange-500 text-sm text-center">
                WhatsApp payments are not configured for this store.
              </p>
            )}

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="text-lg font-medium text-gray-900">Categories</h2>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">Cart</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 