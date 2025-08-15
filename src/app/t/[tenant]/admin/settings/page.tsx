import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WhatsAppSettings from "./WhatsAppSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const p = await params;
  const tenantSlug = p.tenant;

  if (!auth.user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/settings`);
  }

  // Get tenant data
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, whatsapp_number")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) {
    redirect(`/t/${tenantSlug}`);
  }

  // Check if user is admin/staff of this tenant
  const { data: member } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!member) {
    redirect(`/onboarding?prefillSlug=${tenantSlug}&prefillName=${encodeURIComponent(tenant.name || "My Store")}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración de la Tienda</h1>
            <p className="text-white/60 mt-1">Configura las preferencias de pago y contacto de tu tienda</p>
          </div>
          <a
            href={`/t/${tenantSlug}/admin/products`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-white font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Productos
          </a>
        </div>

        {/* Settings Container */}
        <div className="bg-white/5 backdrop-blur rounded-3xl p-6 border border-white/10">
          <WhatsAppSettings 
            tenantSlug={tenantSlug} 
            currentNumber={tenant.whatsapp_number || ""} 
          />
        </div>
      </div>
    </div>
  );
} 