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

  // Try to create tenant if it doesn't exist
  const { data: tenants } = await supabase.from("tenants").select("slug").eq("slug", slug).limit(1);
  if (!tenants?.length && slug) {
    const { error } = await supabase.rpc("create_tenant_self", { p_name: name, p_slug: slug });
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-3 text-center">
            <h1 className="text-xl font-bold">Onboarding error</h1>
            <p className="text-[#586d8d]">{error.message}</p>
            <Link className="underline" href="/">Back home</Link>
          </div>
        </div>
      );
    }
  }

  redirect(`/auth/login?next=/t/${slug}/admin/products`);
} 