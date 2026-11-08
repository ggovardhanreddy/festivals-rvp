import { createClient } from "@/lib/production/supabase/server";
import { redirect } from "next/navigation";
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("role,display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["admin","editor"].includes(profile.role)) redirect("/admin/login?error=unauthorized");
  return { supabase, user, profile };
}
