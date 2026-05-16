import React, { createContext, useContext, useEffect, useState } from "react";

export type TradeType = "long" | "short";

export type Trade = {
  id: string;
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  type: TradeType;
  notes?: string;
};

type TradesContextType = {
  trades: Trade[];
  addTrade: (t: Trade) => void;
  editTrade: (t: Trade) => void;
  removeTrade: (id: string) => void;
};

const STORAGE_KEY = "btc_engine_trades";

const TradesContext = createContext<TradesContextType | null>(null);

export const TradesProvider = ({ children }: { children: React.ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setTrades(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addTrade = (t: Trade) => setTrades((prev) => [...prev, t]);
  const editTrade = (t: Trade) =>
    setTrades((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  const removeTrade = (id: string) =>
    setTrades((prev) => prev.filter((x) => x.id !== id));

  return (
    <TradesContext.Provider value={{ trades, addTrade, editTrade, removeTrade }}>
      {children}
    </TradesContext.Provider>
  );
};

export const useTrades = () => {
  const ctx = useContext(TradesContext);
  if (!ctx) throw new Error("useTrades must be used inside TradesProvider");
  return ctx;
};
