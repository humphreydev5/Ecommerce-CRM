"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CustomerFormState = {
  error: string;
};

export type DeleteCustomerState = {
  error: string;
  success: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function getCustomerFields(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    phone_secondary: String(formData.get("phone_secondary") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function validateCustomer(
  customer: ReturnType<typeof getCustomerFields>,
): string | null {
  if (!customer.full_name || customer.full_name.length > 150) {
    return "Enter a customer name of 1–150 characters.";
  }

  if (
    customer.email.length > 254 ||
    (customer.email && !emailPattern.test(customer.email))
  ) {
    return "Enter a valid email address.";
  }

  if (
    customer.phone.length > 30 ||
    customer.phone_secondary.length > 30 ||
    customer.address.length > 300 ||
    customer.city.length > 100 ||
    customer.state.length > 100 ||
    customer.country.length > 100 ||
    customer.notes.length > 2000
  ) {
    return "One or more fields exceed the allowed length.";
  }

  return null;
}

export async function createCustomer(
  _previousState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const supabase = await verifyAdmin();
  const customer = getCustomerFields(formData);
  const validationError = validateCustomer(customer);

  if (validationError) {
    return { error: validationError };
  }

  const { error } = await supabase.from("customers").insert({
    ...customer,
    email: customer.email || null,
    phone: customer.phone || null,
    phone_secondary: customer.phone_secondary || null,
    address: customer.address || null,
    city: customer.city || null,
    state: customer.state || null,
    country: customer.country || null,
    notes: customer.notes || null,
  });

  if (error) {
    console.error("Customer creation failed:", error.message);
    return {
      error: "Unable to save the customer. Check the details and try again.",
    };
  }

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  _previousState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const supabase = await verifyAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!uuidPattern.test(id)) {
    return { error: "Invalid customer record." };
  }

  const customer = getCustomerFields(formData);
  const validationError = validateCustomer(customer);

  if (validationError) {
    return { error: validationError };
  }

  const { data: updatedCustomer, error } = await supabase
    .from("customers")
    .update({
      ...customer,
      email: customer.email || null,
      phone: customer.phone || null,
      phone_secondary: customer.phone_secondary || null,
      address: customer.address || null,
      city: customer.city || null,
      state: customer.state || null,
      country: customer.country || null,
      notes: customer.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Customer update failed:", error.message);
    return {
      error: "Unable to update this customer. Please try again.",
    };
  }

  if (!updatedCustomer) {
    return { error: "Customer not found or could not be updated." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  revalidatePath(`/customers/${id}/edit`);

  redirect("/customers");
}

export async function deleteCustomer(
  _previousState: DeleteCustomerState,
  formData: FormData,
): Promise<DeleteCustomerState> {
  const supabase = await verifyAdmin();
  const customerId = String(formData.get("id") ?? "").trim();

  if (!uuidPattern.test(customerId)) {
    return { error: "Invalid customer ID.", success: false };
  }

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Customer deletion failed:", error.message);
    return {
      error: "Unable to delete this customer. Please try again.",
      success: false,
    };
  }

  if (!data) {
    return {
      error: "Customer not found or already deleted.",
      success: false,
    };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/customers/${customerId}/edit`);

  return { error: "", success: true };
}