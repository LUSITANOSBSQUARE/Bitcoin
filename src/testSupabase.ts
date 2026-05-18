import { supabase } from "./lib/supabaseClient";

export async function testConnection() {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .limit(1);

  console.log("TESTE SUPABASE:", { data, error });
}
