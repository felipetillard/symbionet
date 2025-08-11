"use server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1),
  brand: z.string().optional().default(""),
  size: z.string().optional().default(""),
  code: z.string().optional().default(""),
  description: z.string().optional().default(""),
  details: z.string().optional().default(""),
  extras: z.string().optional().default(""),
  price: z.coerce.number().min(0).default(0),
  inventory_count: z.coerce.number().int().min(0).default(0),
});

export async function addProductAction(tenantSlug: string, formData: FormData) {
  const values = schema.parse({
    name: formData.get("name"),
    brand: formData.get("brand") ?? "",
    size: formData.get("size") ?? "",
    code: formData.get("code") ?? "",
    description: formData.get("description") ?? "",
    details: formData.get("details") ?? "",
    extras: formData.get("extras") ?? "",
    price: formData.get("price") ?? 0,
    inventory_count: formData.get("inventory_count") ?? 0,
  });

  const svc = createSupabaseServiceClient();
  const { data: tenant } = await svc.from("tenants").select("id, slug").eq("slug", tenantSlug).single();
  if (!tenant) throw new Error("Tenant not found");

  // Ensure bucket exists
  await svc.storage.createBucket("product-images", { public: true }).catch(() => {});

  const files = formData.getAll("images") as File[];
  const uploaded: { url: string; path: string }[] = [];
  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") continue;
    const arrayBuffer = await file.arrayBuffer();
    const path = `${tenant.slug}/${crypto.randomUUID()}-${file.name}`;
    const { data: up, error: upErr } = await svc.storage.from("product-images").upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) throw upErr;
    const { data: url } = svc.storage.from("product-images").getPublicUrl(up!.path);
    uploaded.push({ url: url.publicUrl, path: up!.path });
  }

  const { error: insErr } = await svc.from("products").insert({
    tenant_id: tenant.id,
    name: values.name,
    brand: values.brand,
    size: values.size,
    code: values.code,
    description: values.description,
    details: values.details,
    extras: values.extras,
    price: values.price,
    inventory_count: values.inventory_count,
    images: uploaded,
    status: "active",
  });
  if (insErr) throw insErr;

  revalidatePath(`/t/${tenantSlug}`);
} 