import { createSupabaseServerClient } from "@/lib/supabase/server";
import StorefrontClient from "./StorefrontClient";

export default async function TenantShopPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("id, name, slug, whatsapp_number")
    .eq("slug", tenant)
    .single();

  const tenantId = tenantRow?.id;

  const [{ data: products }, { data: authUser }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, images, inventory_count, description, created_at")
      .eq("tenant_id", tenantId ?? "00000000-0000-0000-0000-000000000000")
      .eq("status", "active")
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
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white">
      <div className="max-w-5xl mx-auto">
        {/* Brand Header - Prominent like MERX */}
        <div className="text-center py-8 mb-8">
          <div className="bg-gradient-to-r from-[#1e3c6c] to-[#2563eb] py-6 px-8 rounded-2xl mx-6 shadow-2xl border border-white/10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider text-white">
              {(tenantRow?.name || "SHOP").toUpperCase()}
            </h1>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">Explora productos y realiza pedidos vía WhatsApp</p>
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <a
                  href={`/t/${tenant}/admin/settings`}
                  className="inline-flex items-center justify-center gap-2 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white text-xs font-medium"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </a>
                <a
                  href={`/t/${tenant}/admin/products`}
                  className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition text-white text-xs font-medium"
                >
                  Administrar
                </a>
              </div>
            ) : (
              <a
                href={`/auth/login?next=/t/${tenant}/admin/products`}
                className="text-xs font-semibold text-white/60 hover:text-white transition"
              >
                Acceso administrador
              </a>
            )}
          </div>
        </div>

        {/* WhatsApp Status Alert for Admin */}
        {isAdmin && !tenantRow?.whatsapp_number && (
          <div className="mx-6 mb-6">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-orange-400 font-medium mb-1">Pago por WhatsApp No Configurado</h3>
                  <p className="text-orange-300/80 text-sm mb-3">
                    Los clientes no pueden realizar pedidos hasta que configures tu número de WhatsApp.
                  </p>
                  <a
                    href={`/t/${tenant}/admin/settings`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Configurar Ahora
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-6">
          <div className="bg-white/5 backdrop-blur rounded-3xl p-6 border border-white/10">
            <StorefrontClient 
              products={products || []}
              whatsappNumber={tenantRow?.whatsapp_number || null}
              storeName={tenantRow?.name || "Shop"}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 