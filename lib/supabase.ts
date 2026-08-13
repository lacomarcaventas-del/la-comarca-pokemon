import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wwqkeeducvxxvdpdxxnu.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kPyc-lUnT2-pL9yUF-ITlg_Kr6Ylnwh";

export function supabaseBrowser() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}
