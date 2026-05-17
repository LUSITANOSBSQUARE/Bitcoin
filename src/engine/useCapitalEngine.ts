import { useMemo } from "react";

export type MarketIntelLite = {
  riskScore: number;
  opportunityScore: number;
  marketState: string;
  recommendation?: string;

  // NOVOS CAMPOS (todos opcionais)
  athDistancePct?: number;
  cyclePhase?: string;
  volatilityScore?: number;
  dominance?: number;
  momentumScore?: number;
  trendStrength?: number;
  liquidityScore?: number;
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

    const {
      riskScore,
      opportunityScore,
      marketState,
      recommendation,
      athDistancePct,
      cyclePhase,
      volatilityScore,
      dominance,
      momentumScore,
      trendStrength,
    } = market;

    /* ---------------- EXPOSIÇÃO ATUAL ---------------- */
    const exposureCurrent =
      totalDeposited > 0 ? (usedFunds / totalDeposited) * 100 : 0;

    /* ---------------- REGIME DE MERCADO ---------------- */
    let regime:
      | "deep_discount"
      | "accumulation"
      | "healthy_trend"
      | "euphoria"
      | "high_risk"
      | "neutral" = "neutral";

    if (athDistancePct != null) {
      if (athDistancePct <= -60) regime = "deep_discount";
      else if (athDistancePct <= -25) regime = "accumulation";
      else if (athDistancePct < 10) regime = "healthy_trend";
      else regime = "euphoria";
    }

    if (riskScore > 80) regime = "high_risk";

    const stateLower = marketState.toLowerCase();
    if (stateLower.includes("risco")) regime = "high_risk";
    if (stateLower.includes("oportunidade")) regime = "accumulation";

    /* ---------------- EXPOSIÇÃO IDEAL DINÂMICA ---------------- */
    let exposureIdeal = 35;

    switch (regime) {
      case "deep_discount":
        exposureIdeal = 55;
        break;
      case "accumulation":
        exposureIdeal = 45;
        break;
      case "healthy_trend":
        exposureIdeal = 40;
        break;
      case "euphoria":
        exposureIdeal = 25;
        break;
      case "high_risk":
        exposureIdeal = 20;
        break;
      case "neutral":
      default:
        exposureIdeal = 35;
        break;
    }

    if (opportunityScore > 70) exposureIdeal += 5;
    if (opportunityScore > 85) exposureIdeal += 5;

    if (riskScore > 60) exposureIdeal -= 5;
    if (riskScore > 80) exposureIdeal -= 10;

    if (cyclePhase) {
      const phase = cyclePhase.toLowerCase();
      if (phase.includes("pre")) exposureIdeal += 3;
      if (phase.includes("late")) exposureIdeal -= 5;
    }

    exposureIdeal = clamp(exposureIdeal, 10, 80);

    const exposureGap = exposureIdeal - exposureCurrent;

    /* ---------------- NÍVEIS QUALITATIVOS ---------------- */
    const riskLevel =
      riskScore > 80
        ? "extreme"
        : riskScore > 65
        ? "high"
        : riskScore > 45
        ? "medium"
        : "low";

    const opportunityLevel =
      opportunityScore > 70
        ? "high"
        : opportunityScore > 45
        ? "medium"
        : "low";

    const liquidityPercent =
      totalDeposited > 0
        ? ((totalDeposited - usedFunds) / totalDeposited) * 100
        : 100;

    const liquidityLevel =
      liquidityPercent < 15
        ? "low"
        : liquidityPercent < 35
        ? "medium"
        : "high";

    /* ---------------- TARGET EM € ---------------- */
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

    /* ---------------- AÇÃO PRINCIPAL ---------------- */
    let action: CapitalAction = "HOLD";

    if (
      (regime === "deep_discount" || regime === "accumulation") &&
      opportunityLevel === "high" &&
      riskLevel !== "high" &&
      riskLevel !== "extreme"
    ) {
      if (exposureGap > 10 && liquidityLevel !== "low") {
        action = "BUY_AGGRESSIVE";
      } else if (exposureGap > 3) {
        action = "BUY";
      } else {
        action = "BUY_LIGHT";
      }
    } else if (regime === "healthy_trend") {
      if (opportunityLevel === "high" && exposureGap > 5) {
        action = "BUY";
      } else if (opportunityLevel === "medium" && exposureGap > 3) {
        action = "BUY_LIGHT";
      } else if (riskLevel === "high" && exposureCurrent > exposureIdeal + 5) {
        action = "REDUCE_EXPOSURE";
      } else {
        action = "HOLD";
      }
    } else if (regime === "euphoria") {
      if (unrealizedProfit > 0) {
        action = "TAKE_PROFIT";
      } else if (exposureCurrent > exposureIdeal + 5) {
        action = "REDUCE_EXPOSURE";
      } else {
        action = "WAIT";
      }
    } else if (regime === "high_risk") {
      if (exposureCurrent > exposureIdeal) {
        action = unrealizedProfit > 0 ? "TAKE_PROFIT" : "REDUCE_EXPOSURE";
      } else {
        action = "WAIT";
      }
    } else {
      if (opportunityLevel === "high" && exposureGap > 5) {
        action = "BUY";
      } else if (opportunityLevel === "medium" && exposureGap > 3) {
        action = "BUY_LIGHT";
      } else if (riskLevel === "high" && exposureCurrent > exposureIdeal + 5) {
        action = "REDUCE_EXPOSURE";
      } else if (riskLevel === "extreme") {
        action = "WAIT";
      } else {
        action = "HOLD";
      }
    }

    /* ---------------- INTENSIDADE ---------------- */
    let intensityScore = 0;

    const absGap = Math.abs(exposureGap);
    if (absGap > 20) intensityScore += 2;
    else if (absGap > 8) intensityScore += 1;

    if (opportunityLevel === "high") intensityScore += 2;
    else if (opportunityLevel === "medium") intensityScore += 1;

    if (riskLevel === "high") intensityScore -= 1;
    if (riskLevel === "extreme") intensityScore -= 2;

    if (liquidityLevel === "low") intensityScore -= 1;

    if (volatilityScore != null) {
      if (volatilityScore > 70) intensityScore -= 1;
      else if (volatilityScore < 30) intensityScore += 1;
    }

    if (momentumScore != null && momentumScore > 0) intensityScore += 1;
    if (trendStrength != null && trendStrength > 60) intensityScore += 1;

    let intensity: CapitalIntensity = "low";
    if (intensityScore >= 3) intensity = "high";
    else if (intensityScore >= 1) intensity = "medium";
    else intensity = "low";

    /* ---------------- NARRATIVA ---------------- */
    const parts: string[] = [];

    switch (regime) {
      case "deep_discount":
        parts.push(
          "O mercado está em regime de desconto profundo — fase rara de acumulação agressiva, desde que a liquidez esteja controlada."
        );
        break;
      case "accumulation":
        parts.push(
          "O mercado encontra-se em regime de acumulação — contexto favorável para reforço disciplinado."
        );
        break;
      case "healthy_trend":
        parts.push(
          "O mercado está em tendência saudável — acumulação moderada continua a fazer sentido, com atenção ao risco."
        );
        break;
      case "euphoria":
        parts.push(
          "O mercado está em regime de euforia — foco em proteção de capital e realização faseada."
        );
        break;
      case "high_risk":
        parts.push(
          "O mercado apresenta um regime de risco elevado — prioridade é preservar capital e evitar aumentar exposição."
        );
        break;
      case "neutral":
      default:
        parts.push(
          "O mercado está num regime neutro — sem sinais extremos de risco ou oportunidade."
        );
        break;
    }

    parts.push(
      `Exposição atual: ${exposureCurrent.toFixed(
        1
      )}% (ideal: ${exposureIdeal.toFixed(1)}%, gap: ${exposureGap.toFixed(
        1
      )} pp).`
    );

    if (exposureGap > 3) {
      parts.push("Estás abaixo da exposição ideal — acumulação é recomendada.");
    } else if (exposureGap < -3) {
      parts.push(
        "Estás acima da exposição ideal — faz sentido considerar redução ou realização parcial."
      );
    } else {
      parts.push("A exposição está alinhada com o cenário atual.");
    }

    parts.push(
      `Liquidez disponível: ${liquidityPercent.toFixed(
        1
      )}% do capital depositado (${liquidityLevel}).`
    );

    if (suggestedBuy > 0) {
      parts.push(`Sugestão de compra aproximada: ${suggestedBuy.toFixed(2)} €.`);
    }

    if (suggestedSell > 0) {
      parts.push(
        `Sugestão de realização / redução aproximada: ${suggestedSell.toFixed(
          2
        )} €.`
      );
    }

    if (realizedProfit > 0) {
      parts.push(
        `Lucros realizados acumulados: ${realizedProfit.toFixed(
          2
        )} € — importante proteger parte destes ganhos.`
      );
    }

    if (recommendation) {
      parts.push(`Recomendação macro: ${recommendation}.`);
    }

    const narrative = parts.join(" ");

    /* ---------------- ALERTAS ---------------- */
    const alerts: string[] = [];

    if (riskLevel === "extreme")
      alerts.push(
        "⚠ Risco extremo — evitar aumentar exposição e considerar proteção ativa."
      );
    if (liquidityLevel === "low")
      alerts.push(
        "⚠ Liquidez baixa — cuidado com novas compras, runway pode ficar comprometido."
      );
    if (exposureCurrent > 70)
      alerts.push("⚠ Exposição acima de 70% — risco elevado em caso de correção forte.");
    if (unrealizedProfit > 0 && unrealizedProfit / (usedFunds || 1) > 0.25)
      alerts.push(
        "⚠ Lucro não realizado superior a 25% do capital investido — considerar realização parcial."
      );
    if (regime === "euphoria")
      alerts.push(
        "⚠ Regime de euforia — histórico mostra maior probabilidade de correções violentas."
      );
    if (regime === "deep_discount" && liquidityLevel === "high")
      alerts.push(
        "ℹ Desconto profundo com boa liquidez — oportunidade rara para acumulação estratégica."
      );
    if (dominance != null && dominance > 55)
      alerts.push("ℹ Dominância BTC elevada — ambiente mais defensivo (risk-off).");

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
