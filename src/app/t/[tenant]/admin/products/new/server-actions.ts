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

// Helper function to validate and clean up image URLs
function validateAndCleanImages(images: unknown[]): { url: string; path: string }[] {
  if (!Array.isArray(images)) return [];
  
  return images.filter((image): image is { url: string; path?: string } => {
    // Check if image has required properties
    if (!image || typeof image !== 'object') return false;
    if (!('url' in image) || typeof image.url !== 'string') return false;
    
    // Check if URL is not empty and looks like a valid URL
    const url = image.url.trim();
    if (url === '' || url === 'undefined' || url === 'null') return false;
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }).map(image => ({
    url: image.url,
    path: (image as { url: string; path?: string }).path || ''
  }));
}

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
  // Filter out empty file inputs that occur when no files are selected
  const validFiles = files.filter(file => 
    file && 
    typeof file.arrayBuffer === "function" && 
    file.size > 0 && 
    file.name !== "" &&
    file.name !== "undefined"
  );
  
  const uploaded: { url: string; path: string }[] = [];
  const uploadErrors: string[] = [];
  
  console.log(`Starting upload of ${validFiles.length} valid files (filtered from ${files.length} total) for tenant ${tenant.slug}`);
  
  for (const [index, file] of validFiles.entries()) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const path = `${tenant.slug}/${crypto.randomUUID()}-${file.name}`;
      
      console.log(`Uploading file ${index + 1}/${validFiles.length}: ${file.name} (${file.size} bytes) to path: ${path}`);
      
      const { data: up, error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, Buffer.from(arrayBuffer), {
          contentType: file.type,
          upsert: false,
        });
        
      if (upErr) {
        console.error(`Upload error for file ${file.name}:`, upErr);
        uploadErrors.push(`${file.name}: ${upErr.message}`);
        continue;
      }
      
      const { data: url } = supabase.storage.from("product-images").getPublicUrl(up.path);
      uploaded.push({ url: url.publicUrl, path: up.path });
      console.log(`Successfully uploaded file ${index + 1}: ${file.name}`);
      
    } catch (error) {
      console.error(`Exception uploading file ${file.name}:`, error);x
      uploadErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`Upload complete. Successfully uploaded: ${uploaded.length}, Errors: ${uploadErrors.length}`);
  
  if (uploadErrors.length > 0) {
    console.warn('Upload errors:', uploadErrors);
    // If we have some uploads but also some errors, continue but warn
    // If ALL uploads failed and we tried to upload files, throw an error
    if (uploaded.length === 0 && validFiles.length > 0) {
      throw new Error(`All image uploads failed: ${uploadErrors.join(', ')}`);
    }
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
  // Filter out empty file inputs that occur when no files are selected
  const validFiles = files.filter(file => 
    file && 
    typeof file.arrayBuffer === "function" && 
    file.size > 0 && 
    file.name !== "" &&
    file.name !== "undefined"
  );
  
  const uploaded: { url: string; path: string }[] = [];
  const uploadErrors: string[] = [];
  
  console.log(`Starting upload of ${validFiles.length} valid files (filtered from ${files.length} total) for tenant ${tenant.slug} (updating product ${productId})`);
  
  for (const [index, file] of validFiles.entries()) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const path = `${tenant.slug}/${crypto.randomUUID()}-${file.name}`;
      
      console.log(`Uploading file ${index + 1}/${validFiles.length}: ${file.name} (${file.size} bytes) to path: ${path}`);
      
      const { data: up, error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, Buffer.from(arrayBuffer), {
          contentType: file.type,
          upsert: false,
        });
        
      if (upErr) {
        console.error(`Upload error for file ${file.name}:`, upErr);
        uploadErrors.push(`${file.name}: ${upErr.message}`);
        continue;
      }
      
      const { data: url } = supabase.storage.from("product-images").getPublicUrl(up.path);
      uploaded.push({ url: url.publicUrl, path: up.path });
      console.log(`Successfully uploaded file ${index + 1}: ${file.name}`);
      
    } catch (error) {
      console.error(`Exception uploading file ${file.name}:`, error);
      uploadErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`Upload complete. Successfully uploaded: ${uploaded.length}, Errors: ${uploadErrors.length}`);
  
  if (uploadErrors.length > 0) {
    console.warn('Upload errors:', uploadErrors);
    // If we have some uploads but also some errors, continue but warn
    // If ALL uploads failed and we tried to upload files, throw an error
    if (uploaded.length === 0 && validFiles.length > 0) {
      throw new Error(`All image uploads failed: ${uploadErrors.join(', ')}`);
    }
  }

  // Get existing product to merge images if no new ones uploaded
  const { data: existingProduct } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .single();

  // Clean up existing images and merge with new uploads
  const existingImages = validateAndCleanImages(existingProduct?.images as unknown[] || []);
  const finalImages = [...existingImages, ...uploaded];

  console.log(`Final images: ${existingImages.length} existing + ${uploaded.length} new = ${finalImages.length} total`);

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

export async function cleanupProductImagesAction(tenantSlug: string, productId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products`);
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

  // Get existing product
  const { data: existingProduct } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .single();

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Clean up the images
  const cleanedImages = validateAndCleanImages(existingProduct.images as unknown[] || []);
  
  console.log(`Cleaning product ${productId}: ${(existingProduct.images as unknown[] || []).length} original images -> ${cleanedImages.length} valid images`);

  // Update the product with cleaned images
  const { error: updateError } = await supabase
    .from("products")
    .update({ images: cleanedImages })
    .eq("id", productId)
    .eq("tenant_id", tenant.id);

  if (updateError) {
    throw new Error(`Failed to cleanup product images: ${updateError.message}`);
  }

  revalidatePath(`/t/${tenantSlug}/admin/products`);
  return { success: true, cleanedCount: cleanedImages.length };
} 

export async function reduceInventoryAction(tenantSlug: string, productId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/products`);
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

  // Get current product to check inventory
  const { data: product } = await supabase
    .from("products")
    .select("inventory_count, name")
    .eq("id", productId)
    .eq("tenant_id", tenant.id)
    .single();

  if (!product) {
    throw new Error("Product not found");
  }

  // Calculate new inventory (don't go below 0)
  const currentInventory = product.inventory_count || 0;
  const newInventory = Math.max(0, currentInventory - 1);
  
  console.log(`Reducing inventory for product "${product.name}": ${currentInventory} -> ${newInventory}`);

  // Update the product inventory
  const { error: updateError } = await supabase
    .from("products")
    .update({ inventory_count: newInventory })
    .eq("id", productId)
    .eq("tenant_id", tenant.id);

  if (updateError) {
    throw new Error(`Failed to reduce inventory: ${updateError.message}`);
  }

  revalidatePath(`/t/${tenantSlug}/admin/products`);
  return { success: true, newInventory, previousInventory: currentInventory };
} 