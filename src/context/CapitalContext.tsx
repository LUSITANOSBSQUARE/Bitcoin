import React, { createContext, useContext, useState } from "react";

type Movement = { amount: number; date: number };

type CapitalContextType = {
  totalDeposited: number;
  availableFunds: number;
  usedFunds: number;
  deposits: Movement[];
  withdrawals: Movement[];
  addFunds: (amount: number) => void;
  withdrawFunds: (amount: number) => void;
};

const CapitalContext = createContext<CapitalContextType | null>(null);

export const CapitalProvider = ({ children }: { children: React.ReactNode }) => {
  const [deposits, setDeposits] = useState<Movement[]>([]);
  const [withdrawals, setWithdrawals] = useState<Movement[]>([]);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [usedFunds, setUsedFunds] = useState(0);

  const totalDeposited = deposits.reduce((a, b) => a + b.amount, 0);

  const addFunds = (amount: number) => {
    setDeposits((prev) => [...prev, { amount, date: Date.now() }]);
    setAvailableFunds((v) => v + amount);
  };

  const withdrawFunds = (amount: number) => {
    setWithdrawals((prev) => [...prev, { amount, date: Date.now() }]);
    setAvailableFunds((v) => v - amount);
  };

  return (
    <CapitalContext.Provider
      value={{
        totalDeposited,
        availableFunds,
        usedFunds,
        deposits,
        withdrawals,
        addFunds,
        withdrawFunds,
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
