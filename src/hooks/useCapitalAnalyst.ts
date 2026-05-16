import { useMemo } from "react";

export const useCapitalAnalyst = (
  capital: {
    availableFunds: number;
    usedFunds: number;
    totalDeposited: number;
    totalBTC: number;
    realizedProfit: number;
  },
  marketIntel: {
    riskScore: number;
    opportunityScore: number;
    marketState: string;
    recommendation: string;
  }
) => {
  return useMemo(() => {
    const {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
    } = capital;

    const { riskScore, opportunityScore, marketState, recommendation } =
      marketIntel;

    const exposure =
      totalDeposited > 0 ? (usedFunds / totalDeposited) * 100 : 0;

    /* ------------------ LÓGICA MATEMÁTICA ------------------ */

    let action = "Neutro";
    let intensity = "Normal";
    let reason = "";

    // 1) Mercado com oportunidade + liquidez disponível
    if (opportunityScore > 70 && availableFunds > totalDeposited * 0.05) {
      action = "Aumentar exposição";
      intensity = opportunityScore > 80 ? "Forte" : "Moderada";
      reason = "O mercado apresenta oportunidade e tens liquidez disponível";
    }

    // 2) Mercado de risco + exposição alta
    if (riskScore > 70 && exposure > 60) {
      action = "Reduzir risco";
      intensity = riskScore > 85 ? "Forte" : "Moderada";
      reason = "Exposição elevada num mercado de risco";
    }

    // 3) Mercado neutro + exposição equilibrada
    if (riskScore < 60 && opportunityScore < 60) {
      action = "Manter posição";
      intensity = "Normal";
      reason = "Mercado equilibrado e exposição saudável";
    }

    // 4) Lucros realizados altos → sugerir proteção
    if (realizedProfit > totalDeposited * 0.25) {
      action = "Proteger ganhos";
      intensity = "Moderada";
      reason = "Lucros realizados significativos";
    }

    // 5) Exposição muito baixa → sugerir acumulação
    if (exposure < 20 && opportunityScore > 60) {
      action = "Acumular gradualmente";
      intensity = "Leve";
      reason = "Exposição baixa e mercado favorável";
    }

    /* ------------------ SCORE FINAL ------------------ */

    const finalScore =
      opportunityScore * 0.6 +
      (100 - riskScore) * 0.4 -
      exposure * 0.2 +
      (availableFunds > 0 ? 5 : 0);

    /* ------------------ NARRATIVA ------------------ */

    const narrative = `
      ${marketState}. 
      A tua exposição atual está em ${exposure.toFixed(1)}%. 
      ${reason}.
    `.trim();

    return {
      action,
      intensity,
      reason,
      exposure,
      finalScore,
      narrative,
    };
  }, [capital, marketIntel]);
};
