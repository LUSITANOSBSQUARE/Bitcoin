import React, { createContext, useContext, useEffect, useState } from "react";

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
}

interface LedgerContextType {
  entries: LedgerEntry[];
  addEntry: (entry: LedgerEntry) => void;
  removeEntry: (id: string) => void;
  clearLedger: () => void;
}

const STORAGE_KEY = "btc_engine_ledger";

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  /* ---------------- LOAD FROM LOCALSTORAGE ---------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch (err) {
      console.error("Erro ao carregar Ledger:", err);
    }
  }, []);

  /* ---------------- SAVE TO LOCALSTORAGE ---------------- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Erro ao guardar Ledger:", err);
    }
  }, [entries]);

  /* ---------------- CRUD ---------------- */

  const addEntry = (entry: LedgerEntry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clearLedger = () => {
    setEntries([]);
  };

  return (
    <LedgerContext.Provider value={{ entries, addEntry, removeEntry, clearLedger }}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
};
