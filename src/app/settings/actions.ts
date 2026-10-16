
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BusinessSettingsState = {
  error: string;
  success: boolean;
};

async function verifyAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail =
    typeof data?.claims?.email === "string"
      ? data.claims.email.trim().toLowerCase()
      : "";

  if (
    error ||
    !data?.claims ||
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    redirect("/login");
  }

  return supabase;
}

export async function updateBusinessSettings(
  _previousState: BusinessSettingsState,
  formData: FormData,
): Promise<BusinessSettingsState> {
  const supabase = await verifyAdmin();

  const businessName = String(formData.get("business_name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const bankAccountName = String(
    formData.get("bank_account_name") ?? "",
  ).trim();
  const bankAccountNumber = String(
    formData.get("bank_account_number") ?? "",
  ).trim();
  const paymentInstructions = String(
    formData.get("payment_instructions") ?? "",
  ).trim();

  if (!businessName || businessName.length > 150) {
    return {
      error: "Enter a business name of 1–150 characters.",
      success: false,
    };
  }

  if (!["NGN", "USD", "GBP", "EUR"].includes(currency)) {
    return {
      error: "Select a supported currency.",
      success: false,
    };
  }

  if (!timezone || timezone.length > 100) {
    return {
      error: "Enter a valid timezone.",
      success: false,
    };
  }

  if (
    bankName.length > 150 ||
    bankAccountName.length > 150 ||
    bankAccountNumber.length > 50 ||
    paymentInstructions.length > 2000
  ) {
    return {
      error: "One or more settings exceed the allowed length.",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("business_settings")
    .update({
      business_name: businessName,
      currency,
      timezone,
      bank_name: bankName || null,
      bank_account_name: bankAccountName || null,
      bank_account_number: bankAccountNumber || null,
      payment_instructions: paymentInstructions || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Business settings update failed:", error.message);
    return {
      error: "Unable to save business settings. Please try again.",
      success: false,
    };
  }

  if (!data) {
    return {
      error: "The settings record was not found or could not be updated.",
      success: false,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/orders/[id]", "page");

  return { error: "", success: true };
}
