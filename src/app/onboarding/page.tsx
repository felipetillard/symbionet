import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ prefillSlug?: string; prefillName?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    redirect("/auth/login?next=/onboarding");
  }

  const sp = await searchParams;
  const slug = (sp.prefillSlug || "").toLowerCase();
  const name = sp.prefillName || "My Store";

  // First, check if user already has any tenant membership
  const { data: existingMembership } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.user.id)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    // User already has a tenant, redirect them to their tenant's admin
    const { data: userTenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", existingMembership.tenant_id)
      .maybeSingle();

    if (userTenant?.slug) {
      redirect(`/t/${userTenant.slug}/admin/products`);
    }
  }

  if (slug) {
    // Check if tenant with this slug already exists
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingTenant) {
      // Tenant exists but user doesn't have membership
      // Show error explaining the situation
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-4 text-center bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h1 className="text-xl font-bold">Store Already Exists</h1>
            <p className="text-white/80">
              A store with the name &ldquo;{slug}&rdquo; already exists and belongs to another user.
            </p>
            <p className="text-white/80">
              Please choose a different store name or contact the store owner for access.
            </p>
            <Link 
              className="inline-block mt-4 px-4 py-2 bg-[#1e3c6c] hover:bg-[#244a84] rounded-lg transition"
              href="/"
            >
              Go Back
            </Link>
          </div>
        </div>
      );
    }

    // Tenant doesn't exist, create it
    const { error } = await supabase.rpc("create_tenant_self", { p_name: name, p_slug: slug });
    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1224] to-[#0a0f1f] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-3 text-center bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h1 className="text-xl font-bold">Onboarding error</h1>
            <p className="text-white/80">{error.message}</p>
            <Link className="inline-block mt-4 px-4 py-2 bg-[#1e3c6c] hover:bg-[#244a84] rounded-lg transition" href="/">
              Back home
            </Link>
          </div>
        </div>
      );
    }

    // Successfully created tenant, redirect to admin
    redirect(`/t/${slug}/admin/products`);
  }

  // No slug provided, redirect to home
  redirect("/");
} 