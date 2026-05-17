import { useMemo } from "react";

export type MarketIntelLite = {
  riskScore: number;
  opportunityScore: number;
  marketState: string;
  recommendation?: string;
};

export type CapitalSnapshot = {
  availableFunds: number;
  usedFunds: number;
  totalDeposited: number;
  totalBTC: number;
  realizedProfit: number;
  unrealizedProfit: number;
};

export type CapitalAction =
  | "BUY"
  | "BUY_AGGRESSIVE"
  | "BUY_LIGHT"
  | "HOLD"
  | "TAKE_PROFIT"
  | "REDUCE_EXPOSURE"
  | "WAIT";

export type CapitalIntensity = "low" | "medium" | "high";

export type CapitalEngineResult = {
  action: CapitalAction;
  intensity: CapitalIntensity;
  exposureCurrent: number;
  exposureIdeal: number;
  exposureGap: number;
  suggestedBuy: number;
  suggestedSell: number;
  riskLevel: "low" | "medium" | "high" | "extreme";
  opportunityLevel: "low" | "medium" | "high";
  liquidityLevel: "low" | "medium" | "high";
  narrative: string;
  alerts: string[];
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const useCapitalEngine = (
  capital: CapitalSnapshot,
  market: MarketIntelLite
): CapitalEngineResult => {
  return useMemo(() => {
    const {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
      unrealizedProfit,
    } = capital;

    const { riskScore, opportunityScore } = market;

    // EXPOSIÇÃO ATUAL
    const exposureCurrent =
      totalDeposited > 0 ? (usedFunds / totalDeposited) * 100 : 0;

    // EXPOSIÇÃO IDEAL
    let exposureIdeal = 40;

    if (opportunityScore > 65) exposureIdeal += 10;
    if (opportunityScore > 80) exposureIdeal += 10;

    if (riskScore > 60) exposureIdeal -= 10;
    if (riskScore > 80) exposureIdeal -= 10;

    exposureIdeal = clamp(exposureIdeal, 10, 80);

    const exposureGap = exposureIdeal - exposureCurrent;

    // NÍVEIS QUALITATIVOS
    const riskLevel =
      riskScore > 80 ? "extreme" :
      riskScore > 65 ? "high" :
      riskScore > 45 ? "medium" :
      "low";

    const opportunityLevel =
      opportunityScore > 70 ? "high" :
      opportunityScore > 45 ? "medium" :
      "low";

    const liquidityPercent =
      totalDeposited > 0 ? ((totalDeposited - usedFunds) / totalDeposited) * 100 : 100;

    const liquidityLevel =
      liquidityPercent < 15 ? "low" :
      liquidityPercent < 35 ? "medium" :
      "high";

    // TARGET EM €
    const targetInvested = (exposureIdeal / 100) * totalDeposited;

    let suggestedBuy = 0;
    let suggestedSell = 0;

    if (exposureGap > 2 && availableFunds > 0) {
      const gapEuros = targetInvested - usedFunds;
      suggestedBuy = clamp(gapEuros, 0, availableFunds);
    }

    if (exposureGap < -2 && totalBTC > 0) {
      const excessEuros = usedFunds - targetInvested;
      suggestedSell = clamp(excessEuros, 0, usedFunds);
    }

    // AÇÃO PRINCIPAL
    let action: CapitalAction = "HOLD";

    if (opportunityLevel === "high" && riskLevel !== "high" && riskLevel !== "extreme") {
      if (exposureGap > 10 && liquidityLevel !== "low") {
        action = "BUY_AGGRESSIVE";
      } else if (exposureGap > 3) {
        action = "BUY";
      } else {
        action = "BUY_LIGHT";
      }
    } else if (riskLevel === "extreme" && exposureCurrent > exposureIdeal) {
      action = unrealizedProfit > 0 ? "TAKE_PROFIT" : "REDUCE_EXPOSURE";
    } else if (riskLevel === "high" && exposureCurrent > exposureIdeal + 5) {
      action = "REDUCE_EXPOSURE";
    } else if (opportunityLevel === "low" && riskLevel === "medium") {
      action = "WAIT";
    }

    // INTENSIDADE
    const absGap = Math.abs(exposureGap);
    let intensity: CapitalIntensity = "low";

    if (absGap > 20 || riskLevel === "extreme" || opportunityLevel === "high") {
      intensity = "high";
    } else if (absGap > 8 || riskLevel === "high" || opportunityLevel === "medium") {
      intensity = "medium";
    }

    // NARRATIVA
    const parts: string[] = [];

    parts.push(
      `Exposição atual: ${exposureCurrent.toFixed(1)}% (ideal: ${exposureIdeal.toFixed(1)}%).`
    );

    if (exposureGap > 3) {
      parts.push(`Estás abaixo da exposição ideal — acumulação recomendada.`);
    } else if (exposureGap < -3) {
      parts.push(`Estás acima da exposição ideal — redução recomendada.`);
    } else {
      parts.push(`Exposição equilibrada com o cenário atual.`);
    }

    if (suggestedBuy > 0) {
      parts.push(`Sugestão de compra: ~${suggestedBuy.toFixed(2)} €.`);
    }

    if (suggestedSell > 0) {
      parts.push(`Sugestão de realização: ~${suggestedSell.toFixed(2)} €.`);
    }

    if (realizedProfit > 0) {
      parts.push(`Lucros realizados acumulados: ${realizedProfit.toFixed(2)} €.`);
    }

    const narrative = parts.join(" ");

    // ALERTAS
    const alerts: string[] = [];

    if (riskLevel === "extreme") alerts.push("⚠ Risco extremo — evitar aumentar exposição.");
    if (liquidityLevel === "low") alerts.push("⚠ Liquidez baixa — cuidado com compras.");
    if (exposureCurrent > 70) alerts.push("⚠ Exposição acima de 70% — risco elevado.");
    if (unrealizedProfit > 0 && unrealizedProfit / (usedFunds || 1) > 0.25)
      alerts.push("⚠ Lucro não realizado > 25% — considerar take profit.");

    return {
      action,
      intensity,
      exposureCurrent,
      exposureIdeal,
      exposureGap,
      suggestedBuy,
      suggestedSell,
      riskLevel,
      opportunityLevel,
      liquidityLevel,
      narrative,
      alerts,
    };
  }, [capital, market]);
};
