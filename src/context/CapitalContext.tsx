import React, { createContext, useContext, useEffect, useState } from "react";

type Movement = { amount: number; date: number };

export type CapitalContextType = {
  totalDeposited: number;      // total de capital dentro do sistema
  availableFunds: number;      // capital ainda não investido
  usedFunds: number;           // capital investido (ligado ao portfolio)

  deposits: Movement[];
  withdrawals: Movement[];

  registerDeposit: (amount: number, date?: number) => void;
  registerWithdrawal: (amount: number, date?: number) => void;

  // usado pelo sync com o portfolio
  setUsedFunds: React.Dispatch<React.SetStateAction<number>>;
};

const STORAGE_KEY = "btc_engine_capital";

const CapitalContext = createContext<CapitalContextType | null>(null);

export const CapitalProvider = ({ children }: { children: React.ReactNode }) => {
  const [deposits, setDeposits] = useState<Movement[]>([]);
  const [withdrawals, setWithdrawals] = useState<Movement[]>([]);
  const [usedFunds, setUsedFunds] = useState(0);

  /* -----------------------------------------
     CARREGAR DO LOCALSTORAGE
  ----------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      setDeposits(parsed.deposits ?? []);
      setWithdrawals(parsed.withdrawals ?? []);
      setUsedFunds(parsed.usedFunds ?? 0);
    } catch (err) {
      console.error("Erro ao carregar capital:", err);
    }
  }, []);

  /* -----------------------------------------
     GUARDAR NO LOCALSTORAGE
  ----------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          deposits,
          withdrawals,
          usedFunds,
        })
      );
    } catch (err) {
      console.error("Erro ao guardar capital:", err);
    }
  }, [deposits, withdrawals, usedFunds]);

  /* -----------------------------------------
     CÁLCULOS DERIVADOS (NUNCA NEGATIVOS)
  ----------------------------------------- */

  const totalDeposits = deposits.reduce((a, b) => a + b.amount, 0);
  const totalWithdrawals = withdrawals.reduce((a, b) => a + b.amount, 0);

  // capital líquido dentro do sistema
  const totalDeposited = totalDeposits - totalWithdrawals;

  // disponível = capital líquido - capital investido
  const rawAvailable = totalDeposited - usedFunds;
  const availableFunds = rawAvailable > 0 ? rawAvailable : 0;

  /* -----------------------------------------
     FUNÇÕES
  ----------------------------------------- */

  const registerDeposit = (amount: number, date?: number) => {
    setDeposits((prev) => [...prev, { amount, date: date ?? Date.now() }]);
  };

  const registerWithdrawal = (amount: number, date?: number) => {
    setWithdrawals((prev) => [...prev, { amount, date: date ?? Date.now() }]);
  };

  return (
    <CapitalContext.Provider
      value={{
        totalDeposited,
        availableFunds,
        usedFunds,
        deposits,
        withdrawals,
        registerDeposit,
        registerWithdrawal,
        setUsedFunds,
      }}
    >
      {children}
    </CapitalContext.Provider>
  );
};

export const useCapital = () => {
  const ctx = useContext(CapitalContext);
  if (!ctx) throw new Error("useCapital must be used inside CapitalProvider");
  return ctx;
};
