import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "./product-form";

export default async function NewProductPage() {
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

  return <ProductForm />;
}