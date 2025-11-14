import { createClient } from "@supabase/supabase-js";

const supebaseUrl = process.env.SUPABASE_URL!;
const supabaseSuperKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supebaseUrl, supabaseSuperKey);