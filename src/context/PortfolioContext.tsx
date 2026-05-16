import React, { createContext, useContext, useEffect, useState } from "react";

export type Transaction = {
  id: string;
  date: string;
  amountBTC: number;
  priceUSD: number;
};

type PortfolioContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  editTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;
};

const STORAGE_KEY = "btc_engine_portfolio";

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Carregar do localStorage ao iniciar
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

  // Guardar no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (err) {
      console.error("Erro ao guardar portfolio:", err);
    }
  }, [transactions]);

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

  return (
    <PortfolioContext.Provider
      value={{ transactions, addTransaction, editTransaction, removeTransaction }}
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
