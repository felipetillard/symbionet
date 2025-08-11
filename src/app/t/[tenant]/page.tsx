import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TenantShopPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenant)
    .single();

  const tenantId = tenantRow?.id;

  const [{ data: products }, { data: authUser }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, images, created_at")
      .eq("tenant_id", tenantId ?? "00000000-0000-0000-0000-000000000000")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  let isAdmin = false;
  if (authUser?.user && tenantId) {
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", authUser.user.id)
      .maybeSingle();
    isAdmin = Boolean(member);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{tenantRow?.name || "Shop"}</h1>
          {isAdmin ? (
            <a
              href={`/t/${tenant}/admin/products/new`}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#1e3c6c] hover:bg-[#244a84] transition text-white text-sm font-bold"
            >
              + Add new
            </a>
          ) : (
            <a
              href={`/auth/login?next=/t/${tenant}/admin/products`}
              className="text-sm font-semibold text-[#9ec1ff] hover:underline"
            >
              Admin login
            </a>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
          {!products || products.length === 0 ? (
            <div className="text-white/70 text-sm">
              No products yet. {isAdmin && <a className="underline" href={`/t/${tenant}/admin/products/new`}>Add your first product</a>}.
            </div>
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
                      <div className="text-xs text-white/60">{new Date(p.created_at as string).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-white/80 w-24">${Number((p as unknown as { price: number }).price).toFixed(2)}</div>
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