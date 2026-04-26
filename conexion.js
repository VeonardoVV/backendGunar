import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ghfhxtbjzlyqhzoxioqo.supabase.co",
  "TU_SUPABASE_KEY_AQUI"
);