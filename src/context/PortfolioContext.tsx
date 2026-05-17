import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Transaction = {
  id: string;
  date: string;
  amountBTC: number;
  priceUSD: number;
};

export type PortfolioContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  editTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;

  // 🔥 CAMPOS CALCULADOS (necessários para o Capital Engine)
  totalBTC: number;
  totalInvested: number;
  avgPrice: number;
  realizedProfit: number;
  unrealizedProfit: number;
  currentValue: number;
};

const STORAGE_KEY = "btc_engine_portfolio";

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* ------------------------------
     CARREGAR DO LOCALSTORAGE
  ------------------------------ */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Transaction[];
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar portfolio:", err);
    }
  }, []);

  /* ------------------------------
     GUARDAR NO LOCALSTORAGE
  ------------------------------ */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (err) {
      console.error("Erro ao guardar portfolio:", err);
    }
  }, [transactions]);

  /* ------------------------------
     CRUD
  ------------------------------ */
  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
  };

  const editTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  /* ------------------------------
     CÁLCULOS AUTOMÁTICOS
  ------------------------------ */

  // Total BTC acumulado
  const totalBTC = useMemo(
    () => transactions.reduce((s, t) => s + t.amountBTC, 0),
    [transactions]
  );

  // Total investido em €
  const totalInvested = useMemo(
    () => transactions.reduce((s, t) => s + t.amountBTC * t.priceUSD, 0),
    [transactions]
  );

  // Preço médio
  const avgPrice = totalBTC > 0 ? totalInvested / totalBTC : 0;

  // Lucro realizado (por agora 0 — podes evoluir isto mais tarde)
  const realizedProfit = 0;

  // Lucro não realizado → calculado no snapshot (depende do preço atual)
  const unrealizedProfit = 0;

  // Valor atual → calculado no snapshot (depende do preço atual)
  const currentValue = 0;

  return (
    <PortfolioContext.Provider
      value={{
        transactions,
        addTransaction,
        editTransaction,
        removeTransaction,
        totalBTC,
        totalInvested,
        avgPrice,
        realizedProfit,
        unrealizedProfit,
        currentValue,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
};
