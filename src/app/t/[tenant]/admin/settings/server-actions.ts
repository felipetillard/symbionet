"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateWhatsAppNumberAction(tenantSlug: string, whatsappNumber: string) {
  console.log(`[WhatsApp Update] Starting update for tenant: ${tenantSlug}, number: "${whatsappNumber}"`);
  console.log(`[WhatsApp Update] Number length: ${whatsappNumber.length}, starts with +: ${whatsappNumber.startsWith('+')}`);
  
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log(`[WhatsApp Update] Auth error: ${authError?.message || 'No user'}`);
    redirect(`/auth/login?next=/t/${tenantSlug}/admin/settings`);
  }

  console.log(`[WhatsApp Update] User authenticated: ${user.id}`);

  // Simplified validation - just check if it starts with + and has reasonable length
  if (whatsappNumber && (!whatsappNumber.startsWith('+') || whatsappNumber.length < 8 || whatsappNumber.length > 20)) {
    console.log(`[WhatsApp Update] Validation failed for number: "${whatsappNumber}"`);
    throw new Error("Invalid phone number format. Please use international format with country code (e.g., +1234567890)");
  }

  console.log(`[WhatsApp Update] Phone number validation passed`);

  // Get tenant and verify user has access
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug")
    .eq("slug", tenantSlug)
    .single();

  if (tenantError) {
    console.log(`[WhatsApp Update] Tenant query error:`, tenantError);
    throw new Error(`Tenant query failed: ${tenantError.message}`);
  }

  if (!tenant) {
    console.log(`[WhatsApp Update] Tenant not found: ${tenantSlug}`);
    throw new Error("Tenant not found");
  }

  console.log(`[WhatsApp Update] Tenant found: ${tenant.id}`);

  // Check if user is admin/staff of this tenant
  const { data: membership, error: membershipError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .single();
  
  if (membershipError) {
    console.log(`[WhatsApp Update] Membership query error:`, membershipError);
    throw new Error(`Membership check failed: ${membershipError.message}`);
  }

  if (!membership) {
    console.log(`[WhatsApp Update] No membership found for user ${user.id} in tenant ${tenant.id}`);
    throw new Error("You don't have permission to update settings for this tenant");
  }

  console.log(`[WhatsApp Update] User has role: ${membership.role}`);

  // Log the exact update we're about to perform
  const updateValue = whatsappNumber || null;
  console.log(`[WhatsApp Update] About to update tenant ${tenant.id} with whatsapp_number: ${updateValue}`);

  // Update the WhatsApp number
  const { data: updateData, error: updateError } = await supabase
    .from("tenants")
    .update({ whatsapp_number: updateValue })
    .eq("id", tenant.id)
    .select('id, whatsapp_number');

  if (updateError) {
    console.log(`[WhatsApp Update] Update failed:`, updateError);
    throw new Error(`Failed to update WhatsApp number: ${updateError.message}`);
  }

  console.log(`[WhatsApp Update] Update response:`, updateData);
  console.log(`[WhatsApp Update] Successfully updated WhatsApp number for tenant ${tenant.id}`);

  // Revalidate all relevant pages
  revalidatePath(`/t/${tenantSlug}/admin/settings`);
  revalidatePath(`/t/${tenantSlug}/admin/products`);
  revalidatePath(`/t/${tenantSlug}`); // Storefront page
  revalidatePath(`/`); // Root page in case it's cached
  
  return { success: true };
} 