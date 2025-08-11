import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products`);
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, images, inventory_count, status, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <a
            href={`/t/${tenantSlug}/admin/products/new`}
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#1e3c6c] hover:bg-[#244a84] transition text-white text-sm font-bold"
          >
            + Add new
          </a>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
          {(!products || products.length === 0) ? (
            <div className="text-white/70 text-sm">No products yet. Click &quot;Add new&quot; to create your first product.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {products.map((p) => {
                const images = (p.images as Array<{ url: string; path?: string }> | null) || [];
                const img = images[0]?.url || "/placeholder-3x4.png";
                return (
                  <li key={p.id} className="py-3 flex items-center gap-4">
                    <div className="w-12 h-16 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }} />
                    <div className="flex-1">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-white/60">{p.status} • {new Date(p.created_at as string).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-white/80 w-24">${Number(p.price).toFixed(2)}</div>
                    <div className="text-sm text-white/80 w-24">Stock: {p.inventory_count}</div>
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
          )}
        </div>
      </div>
    </div>
  );
} 