import { useMemo } from "react";
import type { MarketIntelligence } from "../engine/useMarketIntelligence";

export type MarketStrength = {
  marketStrength: number;
  trendStrength: number;
  liquidityStrength: number;
  volatilityRegime: "high" | "medium" | "low";
  riskRegime: "extreme" | "high" | "moderate" | "low";
};

export const useMarketStrength = (intel: MarketIntelligence | null): MarketStrength | null => {
  return useMemo(() => {
    if (!intel) return null;

    const { macroScore, technicalScore, liquidityScore, riskScore } = intel;

    const marketStrength = Math.round((macroScore + technicalScore) / 2);
    const trendStrength = Math.round(technicalScore);
    const liquidityStrength = Math.round(liquidityScore);

    const volatilityRegime =
      riskScore > 80 ? "high" :
      riskScore > 60 ? "medium" :
      "low";

    const riskRegime =
      riskScore > 80 ? "extreme" :
      riskScore > 65 ? "high" :
      riskScore > 45 ? "moderate" :
      "low";

    return {
      marketStrength,
      trendStrength,
      liquidityStrength,
      volatilityRegime,
      riskRegime,
    };
  }, [intel]);
};
