import { useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { useCapital } from "../context/CapitalContext";

export const useCapitalPortfolioSync = () => {
  const { totalInvested } = usePortfolio();
  const { usedFunds, setUsedFunds, totalDeposited } = useCapital();

  useEffect(() => {
    // O capital investido real é o que o portfolio diz
    // MAS não pode ultrapassar o capital que realmente existe
    const targetUsed = Math.min(totalInvested, totalDeposited);

    // Se já está sincronizado, não faz nada
    if (targetUsed === usedFunds) return;

    // Atualiza o capital investido
    setUsedFunds(targetUsed);
  }, [totalInvested, totalDeposited, usedFunds, setUsedFunds]);
};
