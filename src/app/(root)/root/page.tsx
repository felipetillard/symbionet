export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  admin_email: z.string().email(),
  admin_password: z.string().min(8),
});

async function signUpAndCreateTenant(formData: FormData) {
  "use server";
  const values = schema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    admin_email: formData.get("admin_email"),
    admin_password: formData.get("admin_password"),
  });

  const supabase = await createSupabaseServerClient();

  const { data: signUp, error: signErr } = await supabase.auth.signUp({
    email: values.admin_email,
    password: values.admin_password,
  });
  if (signErr) throw signErr;

  const { data: tenantId, error: rpcErr } = await supabase.rpc("create_tenant_self", {
    p_name: values.name,
    p_slug: values.slug,
  });
  if (rpcErr) throw rpcErr;

  revalidatePath("/root");
}

export default async function RootAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tenants } = await supabase.from("tenants").select("id, name, slug").order("created_at", { ascending: false });
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
        <h2 className="text-[#101319] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Root Admin</h2>
      </div>

      <form action={signUpAndCreateTenant} className="max-w-xl w-full mx-auto p-4 space-y-4">
        <h3 className="text-[#101319] text-lg font-bold">Create Tenant</h3>
        <input name="name" placeholder="Tenant Name" className="form-input w-full rounded-lg bg-[#e9ecf1] h-12 p-4" />
        <input name="slug" placeholder="slug (e.g. acme)" className="form-input w-full rounded-lg bg-[#e9ecf1] h-12 p-4" />
        <input name="admin_email" placeholder="email" className="form-input w-full rounded-lg bg-[#e9ecf1] h-12 p-4" />
        <input type="password" name="admin_password" placeholder="password" className="form-input w-full rounded-lg bg-[#e9ecf1] h-12 p-4" />
        <button className="h-12 bg-[#1e3c6c] text-white rounded-lg px-5 font-bold">Sign up & Create</button>
      </form>

      <div className="max-w-2xl mx-auto p-4">
        <h3 className="text-[#101319] text-lg font-bold">Tenants</h3>
        <ul className="mt-2 space-y-2">
          {tenants?.map((t: { id: string; name: string; slug: string }) => (
            <li key={t.id} className="p-3 rounded-lg bg-[#e9ecf1] flex items-center justify-between">
              <span className="font-medium">{t.name}</span>
              <a className="text-[#1e3c6c] underline" href={`/t/${t.slug}`}>Open Store</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 