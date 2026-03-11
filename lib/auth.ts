import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const typedProfile = profile as Profile | null;

  if (!typedProfile) {
    redirect("/login");
  }

  return { supabase, user, profile: typedProfile };
}

export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const typedProfile = profile as Profile | null;

  if (!typedProfile) {
    return null;
  }

  return { supabase, user, profile: typedProfile };
}


