import { useMemo } from "react";
import type { BitcoinData } from "../hooks/useBitcoinData";
import type { MarketIntelligence } from "../engine/useMarketIntelligence";

export type TFSignal = {
  trend: "up" | "down" | "neutral";
  momentum: "strong" | "weak" | "neutral";
  volatility: "high" | "medium" | "low";
  condition: "bullish" | "bearish" | "neutral";
};

export type TimeframeSet = {
  "5m": TFSignal;
  "1H": TFSignal;
  "4H": TFSignal;
  "1D": TFSignal;
  "1W": TFSignal;
};

export const useTimeframeAnalysis = (
  market: BitcoinData | null,
  intel: MarketIntelligence | null
): TimeframeSet | null => {
  return useMemo(() => {
    if (!market || !intel) return null;

    const { change24h, change7d, volatility24h, volatility7d, momentumScore } = market;
    const { macroScore, technicalScore, riskScore } = intel;

    const baseTrend =
      change7d > 5 ? "up" : change7d < -5 ? "down" : "neutral";

    const baseMomentum =
      momentumScore > 0.5 ? "strong" : momentumScore < -0.5 ? "weak" : "neutral";

    const baseVol =
      volatility24h > 8 ? "high" : volatility24h < 3 ? "low" : "medium";

    const baseCondition =
      technicalScore > 60 && macroScore > 60
        ? "bullish"
        : riskScore > 70
        ? "bearish"
        : "neutral";

    return {
      "5m": {
        trend: change24h > 0.3 ? "up" : change24h < -0.3 ? "down" : "neutral",
        momentum: baseMomentum,
        volatility: baseVol,
        condition: baseCondition,
      },
      "1H": {
        trend: change24h > 1 ? "up" : change24h < -1 ? "down" : "neutral",
        momentum: baseMomentum,
        volatility: baseVol,
        condition: baseCondition,
      },
      "4H": {
        trend: baseTrend,
        momentum: baseMomentum,
        volatility: baseVol,
        condition: baseCondition,
      },
      "1D": {
        trend: baseTrend,
        momentum: baseMomentum,
        volatility: volatility7d > 10 ? "high" : "medium",
        condition: baseCondition,
      },
      "1W": {
        trend: change7d > 5 ? "up" : change7d < -5 ? "down" : "neutral",
        momentum: baseMomentum,
        volatility: volatility7d > 12 ? "high" : "medium",
        condition: baseCondition,
      },
    };
  }, [market, intel]);
};
