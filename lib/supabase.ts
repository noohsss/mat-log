import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Returns a fresh client so each server request gets its own auth session.
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
