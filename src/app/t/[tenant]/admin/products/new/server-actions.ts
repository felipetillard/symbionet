"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const schema = z.object({
  name: z.string().min(1),
  brand: z.string().optional().default(""),
  size: z.string().optional().default(""),
  code: z.string().optional().default(""),
  description: z.string().optional().default(""),
  details: z.string().optional().default(""),
  extras: z.string().optional().default(""),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(z.number().min(0)),
  inventory_count: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(z.number().int().min(0)),
});

export async function addProductAction(tenantSlug: string, formData: FormData) {
  // Helper function to handle empty form values
  const getFormValue = (key: string) => {
    const value = formData.get(key);
    return value === "" ? null : value;
  };

  const values = schema.parse({
    name: formData.get("name"),
    brand: getFormValue("brand") ?? "",
    size: getFormValue("size") ?? "",
    code: getFormValue("code") ?? "",
    description: getFormValue("description") ?? "",
    details: getFormValue("details") ?? "",
    extras: getFormValue("extras") ?? "",
    price: getFormValue("price") ?? "0",
    inventory_count: getFormValue("inventory_count") ?? "0",
  });

  // Use server client with authenticated user session
  const supabase = await createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products/new`);
  }

  // Get tenant and verify user has access
  const { data: tenant } = await supabase.from("tenants").select("id, slug").eq("slug", tenantSlug).single();
  if (!tenant) throw new Error("Tenant not found");

  // Check if user is a member of this tenant
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .single();
  
  if (!membership) {
    throw new Error("You don't have permission to create products for this tenant");
  }

  // Handle file uploads (we'll need to update RLS policies for storage)
  const files = formData.getAll("images") as File[];
  const uploaded: { url: string; path: string }[] = [];
  
  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") continue;
    const arrayBuffer = await file.arrayBuffer();
    const path = `${tenant.slug}/${crypto.randomUUID()}-${file.name}`;
    
    const { data: up, error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });
      
    if (upErr) {
      console.error("Upload error:", upErr);
      // Continue without this image rather than failing completely
      continue;
    }
    
    const { data: url } = supabase.storage.from("product-images").getPublicUrl(up.path);
    uploaded.push({ url: url.publicUrl, path: up.path });
  }

  // Create the product
  const { error: insertError } = await supabase.from("products").insert({
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
  
  if (insertError) {
    throw new Error(`Failed to create product: ${insertError.message}`);
  }

  revalidatePath(`/t/${tenantSlug}/admin/products`);
} 

export async function getProductAction(tenantSlug: string, productId: string) {
  const supabase = await createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products/new?id=${productId}`);
  }

  // Get tenant and verify user has access
  const { data: tenant } = await supabase.from("tenants").select("id, slug").eq("slug", tenantSlug).single();
  if (!tenant) throw new Error("Tenant not found");

  // Check if user is a member of this tenant
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .single();
  
  if (!membership) {
    throw new Error("You don't have permission to access products for this tenant");
  }

  // Get the product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .single();

  if (productError) {
    throw new Error("Product not found");
  }

  return product;
}

export async function updateProductAction(tenantSlug: string, productId: string, formData: FormData) {
  // Helper function to handle empty form values
  const getFormValue = (key: string) => {
    const value = formData.get(key);
    return value === "" ? null : value;
  };

  const values = schema.parse({
    name: formData.get("name"),
    brand: getFormValue("brand") ?? "",
    size: getFormValue("size") ?? "",
    code: getFormValue("code") ?? "",
    description: getFormValue("description") ?? "",
    details: getFormValue("details") ?? "",
    extras: getFormValue("extras") ?? "",
    price: getFormValue("price") ?? "0",
    inventory_count: getFormValue("inventory_count") ?? "0",
  });

  // Use server client with authenticated user session
  const supabase = await createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products/new?id=${productId}`);
  }

  // Get tenant and verify user has access
  const { data: tenant } = await supabase.from("tenants").select("id, slug").eq("slug", tenantSlug).single();
  if (!tenant) throw new Error("Tenant not found");

  // Check if user is a member of this tenant
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .single();
  
  if (!membership) {
    throw new Error("You don't have permission to update products for this tenant");
  }

  // Handle file uploads (if any new files)
  const files = formData.getAll("images") as File[];
  const uploaded: { url: string; path: string }[] = [];
  
  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") continue;
    const arrayBuffer = await file.arrayBuffer();
    const path = `${tenant.slug}/${crypto.randomUUID()}-${file.name}`;
    
    const { data: up, error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });
      
    if (upErr) {
      console.error("Upload error:", upErr);
      continue;
    }
    
    const { data: url } = supabase.storage.from("product-images").getPublicUrl(up.path);
    uploaded.push({ url: url.publicUrl, path: up.path });
  }

  // Get existing product to merge images if no new ones uploaded
  const { data: existingProduct } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .single();

  const finalImages = uploaded.length > 0 ? uploaded : (existingProduct?.images || []);

  // Update the product
  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: values.name,
      brand: values.brand,
      size: values.size,
      code: values.code,
      description: values.description,
      details: values.details,
      extras: values.extras,
      price: values.price,
      inventory_count: values.inventory_count,
      images: finalImages,
    })
    .eq("id", productId)
    .eq("tenant_id", tenant.id);
  
  if (updateError) {
    throw new Error(`Failed to update product: ${updateError.message}`);
  }

  revalidatePath(`/t/${tenantSlug}/admin/products`);
} 