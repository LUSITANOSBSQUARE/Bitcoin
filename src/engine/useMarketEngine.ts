import { useMemo } from "react";

interface MarketAnalysis {
  marketState: "bullish" | "bearish" | "neutral";
  riskLevel: "baixo" | "médio" | "alto";
  opportunity: "sim" | "não";
  summary: string;
  recommendation: "investir" | "esperar" | "realizar lucro";
  explanation: string;
}

export const useMarketEngine = (data: any, fearGreed: number | null, dominance: number | null) => {
  return useMemo<MarketAnalysis>(() => {
    if (!data || fearGreed === null || dominance === null) {
      return {
        marketState: "neutral",
        riskLevel: "médio",
        opportunity: "não",
        summary: "A aguardar dados do mercado.",
        recommendation: "esperar",
        explanation: "Os dados ainda estão a ser carregados."
      };
    }

    const { change24h, change7d, volume24h, marketCap } = data;

    /* ---------------- TENDÊNCIA ---------------- */
    let marketState: MarketAnalysis["marketState"] = "neutral";

    if (change24h > 1 && change7d > 3 && fearGreed > 55) marketState = "bullish";
    if (change24h < -1 && change7d < -3 && fearGreed < 45) marketState = "bearish";

    /* ---------------- RISCO ---------------- */
    let riskLevel: MarketAnalysis["riskLevel"] = "médio";

    if (fearGreed > 70) riskLevel = "alto";
    if (fearGreed < 30) riskLevel = "baixo";

    /* ---------------- OPORTUNIDADE ---------------- */
    let opportunity: MarketAnalysis["opportunity"] = "não";

    if (riskLevel === "baixo" && marketState !== "bearish") {
      opportunity = "sim";
    }

    /* ---------------- RECOMENDAÇÃO ---------------- */
    let recommendation: MarketAnalysis["recommendation"] = "esperar";

    if (marketState === "bullish" && riskLevel === "baixo") recommendation = "investir";
    if (marketState === "bearish" && riskLevel === "alto") recommendation = "realizar lucro";

    /* ---------------- RESUMO ---------------- */
    const summary =
      marketState === "bullish"
        ? "O mercado está otimista com pressão compradora crescente."
        : marketState === "bearish"
        ? "O mercado está sob pressão vendedora e sentimento negativo."
        : "O mercado está estável e sem direção clara.";

    /* ---------------- EXPLICAÇÃO HUMANA ---------------- */
    const explanation = `
O Bitcoin apresenta uma variação de ${change24h.toFixed(2)}% nas últimas 24h e ${change7d.toFixed(2)}% nos últimos 7 dias.
O sentimento do mercado (Fear & Greed) está em ${fearGreed}, indicando um risco ${riskLevel}.
A dominância do Bitcoin está em ${dominance.toFixed(2)}%, sugerindo ${dominance > 50 ? "força do BTC" : "maior interesse em altcoins"}.
O volume representa ${(volume24h / marketCap * 100).toFixed(2)}% do market cap, indicando ${volume24h / marketCap > 0.05 ? "liquidez saudável" : "liquidez reduzida"}.

Com base nestes fatores, a recomendação atual é: ${recommendation}.
    `.trim();

    return {
      marketState,
      riskLevel,
      opportunity,
      summary,
      recommendation,
      explanation
    };
  }, [data, fearGreed, dominance]);
};
