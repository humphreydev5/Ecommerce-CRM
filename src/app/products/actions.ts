"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = {
  error: string;
};

async function verifyAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  if (
    error ||
    !email ||
    email.toLowerCase() !==
      process.env.ADMIN_EMAIL?.trim().toLowerCase()
  ) {
    redirect("/login");
  }

  return supabase;
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await verifyAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const skuInput = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceInput = String(formData.get("price") ?? "").trim();
  const stockInput = String(formData.get("available_units") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name) {
    return { error: "Product name is required." };
  }

  if (name.length > 150) {
    return { error: "Product name must be 150 characters or fewer." };
  }

  if (skuInput.length > 100) {
    return { error: "SKU must be 100 characters or fewer." };
  }

  if (description.length > 5000) {
    return { error: "Description must be 5,000 characters or fewer." };
  }

  if (priceInput === "" || !Number.isFinite(Number(priceInput))) {
    return { error: "Enter a valid product price." };
  }

  const price = Number(priceInput);

  if (price < 0 || price > 9999999999.99) {
    return { error: "Price must be between 0 and 9,999,999,999.99." };
  }

  if (!/^\d+$/.test(stockInput)) {
    return { error: "Stock quantity must be a whole number of zero or more." };
  }

  const availableUnits = Number(stockInput);

  if (!Number.isSafeInteger(availableUnits) || availableUnits > 2147483647) {
    return { error: "Stock quantity is too large." };
  }

  const { error } = await supabase.from("products").insert({
    name,
    sku: skuInput || null,
    description: description || null,
    price,
    available_units: availableUnits,
    is_active: isActive,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This SKU already exists. Enter a unique SKU." };
    }

    console.error("Product creation failed:", error.message);
    return { error: "Unable to save the product. Please try again." };
  }

  revalidatePath("/products");
  revalidatePath("/");

  redirect("/products");
}

export async function updateProduct(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const skuInput = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceInput = String(formData.get("price") ?? "").trim();
  const stockInput = String(formData.get("available_units") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { error: "Invalid product ID." };
  }

  if (!name || name.length > 150) {
    return { error: "Product name is required and must be 150 characters or fewer." };
  }

  if (skuInput.length > 100) {
    return { error: "SKU must be 100 characters or fewer." };
  }

  if (description.length > 5000) {
    return { error: "Description must be 5,000 characters or fewer." };
  }

  if (priceInput === "" || !Number.isFinite(Number(priceInput))) {
    return { error: "Enter a valid product price." };
  }

  const price = Number(priceInput);

  if (price < 0 || price > 9999999999.99) {
    return { error: "Price must be between 0 and 9,999,999,999.99." };
  }

  if (!/^\d+$/.test(stockInput)) {
    return { error: "Stock quantity must be a whole number of zero or more." };
  }

  const availableUnits = Number(stockInput);

  if (!Number.isSafeInteger(availableUnits) || availableUnits > 2147483647) {
    return { error: "Stock quantity is too large." };
  }

  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    console.error("Product lookup failed:", lookupError.message);
    return { error: "Unable to find the product. Please try again." };
  }

  if (!existingProduct) {
    return { error: "Product not found." };
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      sku: skuInput || null,
      description: description || null,
      price,
      available_units: availableUnits,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "This SKU already exists. Enter a unique SKU." };
    }

    console.error("Product update failed:", error.message);
    return { error: "Unable to update the product. Please try again." };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath(`/products/${id}/edit`);
  revalidatePath("/");

  redirect("/products");
}


export type DeleteProductState = {
  error: string;
  success: boolean;
};

export async function deleteProduct(
  _previousState: DeleteProductState,
  formData: FormData
): Promise<DeleteProductState> {
  const supabase = await verifyAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    return { error: "Invalid product ID.", success: false };
  }

  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    console.error("Product lookup failed:", lookupError.message);
    return {
      error: "Unable to find the product. Please try again.",
      success: false,
    };
  }

  if (!existingProduct) {
    return { error: "Product not found.", success: false };
  }

  const { data: deletedProduct, error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Product deletion failed:", deleteError.message);

    if (deleteError.code === "23503") {
      return {
        error:
          "This product is linked to other records and cannot be deleted. Consider marking it inactive instead.",
        success: false,
      };
    }

    return {
      error: "Unable to delete the product. Please try again.",
      success: false,
    };
  }

  if (!deletedProduct) {
    return {
      error: "The product could not be deleted. Please refresh and try again.",
      success: false,
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath(`/products/${id}/edit`);
  revalidatePath("/");

  return { error: "", success: true };
}
