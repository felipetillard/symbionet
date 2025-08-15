import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsList from "./ProductsList";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  images: Array<{ url: string; path?: string }> | null;
  inventory_count: number;
  created_at: string;
};

export default async function ProductsAdminPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<{ next?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const p = await params;
  const sp = await searchParams;
  const tenantSlug = p.tenant;

  if (!auth.user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products`);
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) {
    redirect(`/t/${tenantSlug}`);
  }

  const { data: member } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!member) {
    // Avoid login loop: send authenticated users without membership to onboarding
    redirect(`/onboarding?prefillSlug=${tenantSlug}&prefillName=${encodeURIComponent(tenant.name || "My Store")}`);
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, images, inventory_count, status, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Productos</h1>
            <p className="text-white/60 mt-1">Administra tu inventario y rastrea los niveles de stock</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/t/${tenantSlug}/admin/settings`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-white font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </a>
            <a
              href={`/t/${tenantSlug}/admin/products/new`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-white font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Producto
            </a>
          </div>
        </div>

        {/* Products Container */}
        <div className="bg-white/5 backdrop-blur rounded-3xl p-6 border border-white/10">
          {products && products.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">
                    {products.length} Producto{products.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-white/60">
                  Stock Total: {products.reduce((sum, p) => sum + (p.inventory_count || 0), 0)} unidades
                </div>
              </div>
              <ProductsList products={(products ?? []) as unknown as ProductRow[]} tenantSlug={tenantSlug} />
            </div>
          ) : (
            <ProductsList products={(products ?? []) as unknown as ProductRow[]} tenantSlug={tenantSlug} />
          )}
        </div>
      </div>
    </div>
  );
} 