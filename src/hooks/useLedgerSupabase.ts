import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { LedgerEntry } from "../context/LedgerContext";

export function useLedgerSupabase() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH INITIAL DATA ---------------- */
  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar ledger do Supabase:", error);
      } else if (data) {
        setEntries(data as LedgerEntry[]);
      }

      setLoading(false);
    };

    fetchLedger();
  }, []);

  /* ---------------- ADD ENTRY ---------------- */
  const addEntry = async (entry: LedgerEntry) => {
    const { error } = await supabase.from("ledger").insert(entry);

    if (error) {
      console.error("Erro ao adicionar entrada ao Supabase:", error);
      return;
    }

    setEntries((prev) => [...prev, entry]);
  };

  /* ---------------- REMOVE ENTRY ---------------- */
  const removeEntry = async (id: string) => {
    const { error } = await supabase.from("ledger").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover entrada do Supabase:", error);
      return;
    }

    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  /* ---------------- CLEAR LEDGER ---------------- */
  const clearLedger = async () => {
    const { error } = await supabase.from("ledger").delete().neq("id", "");

    if (error) {
      console.error("Erro ao limpar ledger no Supabase:", error);
      return;
    }

    setEntries([]);
  };

  return {
    entries,
    loading,
    addEntry,
    removeEntry,
    clearLedger,
  };
}
