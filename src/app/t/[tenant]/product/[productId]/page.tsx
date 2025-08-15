import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: Promise<{
    tenant: string;
    productId: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { tenant: tenantSlug, productId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get tenant information
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, whatsapp_number")
    .eq("slug", tenantSlug)
    .single();

  if (tenantError || !tenant) {
    notFound();
  }

  // Get product information
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      inventory_count,
      status,
      images
    `)
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .single();

  if (productError || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetailClient 
        product={product}
        tenant={tenant}
      />
    </div>
  );
} 