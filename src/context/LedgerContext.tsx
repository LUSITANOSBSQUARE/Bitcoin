import React, { createContext, useContext } from "react";
import { useLedgerSupabase } from "../hooks/useLedgerSupabase";

/* ---------------- TYPES (mantidos aqui para não quebrar nada) ---------------- */

export type LedgerEntryType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "BUY"
  | "SELL"
  | "ENGINE_BUY"
  | "ENGINE_SELL"
  | "ENGINE_REBALANCE";

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amountEUR: number;
  amountBTC?: number;
  priceEUR?: number;
  date: string;
  meta?: Record<string, any>;
  created_at?: string;
}

/* ---------------- CONTEXT INTERFACE ---------------- */

interface LedgerContextType {
  entries: LedgerEntry[];
  loading: boolean;
  addEntry: (entry: LedgerEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearLedger: () => Promise<void>;
}

/* ---------------- CONTEXT ---------------- */

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { entries, loading, addEntry, removeEntry, clearLedger } =
    useLedgerSupabase();

  return (
    <LedgerContext.Provider
      value={{
        entries,
        loading,
        addEntry,
        removeEntry,
        clearLedger,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
};
