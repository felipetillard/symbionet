"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// We call server actions exported from a separate file
import { addProductAction, updateProductAction, getProductAction } from "./server-actions";

type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  code: string;
  description: string;
  details: string;
  extras: string;
  price: number;
  inventory_count: number;
  images: Array<{ url: string; path: string }>;
  status: string;
  created_at: string;
};

export default function AddProductPage() {
  const params = useParams<{ tenant: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = params?.tenant as string;
  const productId = searchParams.get("id");
  const isEditing = !!productId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [product, setProduct] = useState<Product | null>(null);

  // Load product data if editing
  useEffect(() => {
    if (isEditing && productId) {
      setLoading(true);
      getProductAction(tenant, productId)
        .then((data: Product) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message || "Failed to load product");
          setLoading(false);
        });
    }
  }, [isEditing, productId, tenant]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing && productId) {
        await updateProductAction(tenant, productId, formData);
      } else {
        await addProductAction(tenant, formData);
      }
      // Don't set isSubmitting to false here since we're navigating away
      router.push(`/t/${tenant}/admin/products`);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [selectedFiles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="animate-spin w-full h-full text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isEditing ? 'Updating Product...' : 'Creating Product...'}
            </h3>
            <p className="text-white/70 text-sm">
              {selectedFiles.length > 0 
                ? `Uploading ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} and saving product details`
                : 'Saving product details'
              }
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
            </svg>
          </button>
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        <form action={handleSubmit} className="space-y-8">
          <input type="hidden" name="tenant" value={tenant} />
          
          {/* Basic Information */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">Product Name *</label>
                <input
                  name="name"
                  placeholder="Enter product name"
                  defaultValue={product?.name || ""}
                  disabled={isSubmitting}
                  required
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Brand</label>
                <input
                  name="brand"
                  placeholder="Enter brand"
                  defaultValue={product?.brand || ""}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Size</label>
                <input
                  name="size"
                  placeholder="Enter size"
                  defaultValue={product?.size || ""}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Product Code</label>
                <input
                  name="code"
                  placeholder="Enter product code"
                  defaultValue={product?.code || ""}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={product?.price || ""}
                    disabled={isSubmitting}
                    required
                    className="w-full h-12 pl-8 pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Inventory Count</label>
                <input
                  name="inventory_count"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={product?.inventory_count || ""}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Product Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                                  <textarea
                    name="description"
                    placeholder="Describe your product..."
                    defaultValue={product?.description || ""}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Details</label>
                <textarea 
                  name="details" 
                  placeholder="Additional details, specifications, features..."
                  defaultValue={product?.details || ""}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Extras</label>
                <textarea 
                  name="extras" 
                  placeholder="Care instructions, warranty, additional information..."
                  defaultValue={product?.extras || ""}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              Product Images
            </h2>

            {/* Show existing images if editing */}
            {isEditing && product?.images && product.images.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-white/70 mb-3">Current Images ({product.images.length}):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
                        <img 
                          src={image.url} 
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50">
                  Upload new images below to add more images to your product
                </p>
              </div>
            )}
            
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-white/20 hover:border-white/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                name="images" 
                multiple 
                accept="image/*"
                disabled={isSubmitting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                onChange={handleFileSelect}
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M208,40H180.28L166.65,26.37A8,8,0,0,0,160.38,24H95.62a8,8,0,0,0-6.27,3.37L75.72,40H48A16,16,0,0,0,32,56V192a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM128,168a36,36,0,1,1,36-36A36,36,0,0,1,128,168Zm0-56a20,20,0,1,0,20,20A20,20,0,0,0,128,112Z"/>
                  </svg>
                </div>
                
                <div>
                  <p className="text-lg font-medium text-white">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} new file(s) selected` 
                      : isEditing 
                        ? 'Add more images (optional)'
                        : 'Upload product images (multiple files supported)'
                    }
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Drag and drop multiple images here, or click to browse
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Supports JPG, PNG, WebP (max 10MB each) • Multiple files supported
                  </p>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Choose Multiple Files
                </button>
              </div>
            </div>
            
            {/* Preview selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-white/70 mb-3">New Images to Upload ({selectedFiles.length}):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/20">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 rounded-full p-1"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-white/80 truncate flex-1">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-6 z-10">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? "Updating Product..." : "Adding Product..."}
                </>
              ) : (
                isEditing ? "Update Product" : "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 