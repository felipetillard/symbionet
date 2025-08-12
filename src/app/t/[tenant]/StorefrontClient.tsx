"use client";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  images: Array<{ url: string; path?: string }> | null;
  inventory_count: number;
  description: string | null;
  created_at: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type StorefrontClientProps = {
  products: Product[];
  whatsappNumber: string | null;
  storeName: string;
};

export default function StorefrontClient({ products, whatsappNumber, storeName }: StorefrontClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: Product) => {
    if (product.inventory_count <= 0) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        // Check if we can increase quantity
        if (existingItem.quantity >= product.inventory_count) return prevCart;
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.inventory_count) }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "";
    
    let message = `Hi! I'd like to order from ${storeName}:\n\n`;
    
    cart.forEach(item => {
      message += `• ${item.product.name} x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\nTotal: $${getCartTotal().toFixed(2)}\n\n`;
    message += "Please confirm my order. Thank you!";
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = () => {
    if (!whatsappNumber || cart.length === 0) return;
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after sending to WhatsApp
    setCart([]);
    setShowCart(false);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5a9 9 0 019 9" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No Products Available</h3>
        <p className="text-white/60">Check back later for new products!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-5L3 3m2 10h10a2 2 0 002-2m-10 2v10a2 2 0 01-2-2v-8a2 2 0 012-2h8" />
              </svg>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getCartItemCount()}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const images = (product.images || []) as Array<{ url: string; path?: string }>;
          const img = images[0]?.url || "/placeholder-3x4.png";
          const isOutOfStock = product.inventory_count <= 0;
          const cartItem = cart.find(item => item.product.id === product.id);
          
          return (
            <div 
              key={product.id} 
              className={`bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 transition-all hover:bg-white/10 ${
                isOutOfStock ? 'opacity-60 grayscale' : ''
              }`}
            >
              {/* Product Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 mb-4 relative">
                <img 
                  src={img} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-3x4.png";
                  }}
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                    <div className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                      OUT OF STOCK
                    </div>
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium">
                    +{images.length - 1} photos
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <h3 className={`font-semibold text-lg ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`text-xl font-bold ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                    ${product.price.toFixed(2)}
                  </div>
                  <div className={`text-sm ${isOutOfStock ? 'text-white/40' : 'text-white/60'}`}>
                    Stock: {product.inventory_count}
                  </div>
                </div>
                
                {/* Add to Cart / Quantity Controls */}
                {!isOutOfStock && whatsappNumber ? (
                  cartItem ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="text-white">−</span>
                      </button>
                      <span className="text-white font-medium w-8 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        disabled={cartItem.quantity >= product.inventory_count}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-white">+</span>
                      </button>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="ml-auto text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full h-12 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg font-medium text-green-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-5L3 3m2 10h10a2 2 0 002-2m-10 2v10a2 2 0 01-2-2v-8a2 2 0 012-2h8" />
                      </svg>
                      Add to Cart
                    </button>
                  )
                ) : !whatsappNumber ? (
                  <div className="text-center p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-300 text-sm">Checkout not available</p>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white/40 text-sm">Out of Stock</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                    <img 
                      src={(item.product.images?.[0] as { url: string })?.url || "/placeholder-3x4.png"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.product.name}</div>
                    <div className="text-white/60 text-sm">
                      ${item.product.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <div className="text-white font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-white">Total:</span>
                <span className="text-white">${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppCheckout}
                disabled={!whatsappNumber || cart.length === 0}
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
                Order via WhatsApp
              </button>
              <button
                onClick={() => setShowCart(false)}
                className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-white transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 