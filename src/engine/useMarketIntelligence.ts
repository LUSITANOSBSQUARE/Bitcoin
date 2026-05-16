import { useMemo } from "react";
import type { BitcoinData } from "../hooks/useBitcoinData";
import type { OnChainData } from "../hooks/useOnChainData";


export interface MarketIntelligence {
  macroScore: number;
  technicalScore: number;
  onChainScore: number;
  liquidityScore: number;
  riskScore: number;
  opportunityScore: number;

  marketState: string;
  alerts: string[];
  narrative: string;
  recommendation: string;
}

export const useMarketIntelligence = (
  market: BitcoinData | null,
  onchain: OnChainData | null,
  fearGreed: number | null,
  dominance: number | null
): MarketIntelligence | null => {
  return useMemo(() => {
    if (!market || !onchain || fearGreed == null || dominance == null) {
      return null;
    }

    /* ---------------- MACRO SCORE ---------------- */
    const macroScore =
      (100 - fearGreed) * 0.25 + // medo = oportunidade
      (100 - market.volatility30d) * 0.25 +
      (market.momentumScore > 0 ? 20 : 0) +
      (market.change1y > 0 ? 20 : 0);

    /* ---------------- TECHNICAL SCORE ---------------- */
    const technicalScore =
      (1 - Math.abs(market.zScore24h)) * 40 +
      (market.trendStrength < 20 ? 20 : 0) +
      (market.momentumScore > 0 ? 20 : 0) +
      (market.pricePosition24h < 0.3 ? 20 : 0);

    /* ---------------- ON-CHAIN SCORE ---------------- */
    const onChainScore =
      (onchain.hashrate ? 1 : 0) * 20 +
      (onchain.difficulty ? 1 : 0) * 20 +
      (onchain.txPerDay ? 1 : 0) * 20 +
      (onchain.blockTime && onchain.blockTime < 620 ? 20 : 0) +
      (onchain.mempoolTxCount && onchain.mempoolTxCount < 150000 ? 20 : 0);

    /* ---------------- LIQUIDITY SCORE ---------------- */
    const liquidityScore =
      market.volumeToMarketCap * 50 +
      (onchain.feeLow && onchain.feeLow < 20 ? 20 : 0) +
      (onchain.mempoolVSize && onchain.mempoolVSize < 200000000 ? 30 : 0);

    /* ---------------- RISK SCORE ---------------- */
    const riskScore =
      market.volatility24h * 0.4 +
      market.volatility7d * 0.3 +
      (1 - market.liquidityScore) * 20 +
      (onchain.mempoolTxCount && onchain.mempoolTxCount > 200000 ? 20 : 0);

    /* ---------------- OPPORTUNITY SCORE ---------------- */
    const opportunityScore =
      (fearGreed < 30 ? 30 : 0) +
      (market.pricePosition24h < 0.25 ? 30 : 0) +
      (market.zScore24h < -1 ? 20 : 0) +
      (dominance < 45 ? 20 : 0);

    /* ---------------- MARKET STATE ---------------- */
    const marketState =
      riskScore > 80
        ? "Risco Extremo"
        : riskScore > 60
        ? "Risco Elevado"
        : opportunityScore > 70
        ? "Oportunidade Forte"
        : macroScore > 70
        ? "Tendência Saudável"
        : "Neutro";

    /* ---------------- ALERTAS INTELIGENTES ---------------- */
    const alerts: string[] = [];

    if (market.zScore24h > 2) alerts.push("Preço esticado acima da média (Z-Score > 2).");
    if (market.zScore24h < -2) alerts.push("Preço muito abaixo da média (Z-Score < -2).");
    if (onchain.mempoolTxCount != null && onchain.mempoolTxCount > 200000) {
  alerts.push("Mempool congestionado.");
}

    if (onchain.feeHigh && onchain.feeHigh > 50) alerts.push("Fees elevadas.");
    if (market.volatility24h > 8) alerts.push("Volatilidade 24h elevada.");
    if (dominance > 55) alerts.push("BTC dominância muito alta (risk-off).");
    if (dominance < 40) alerts.push("Altcoins dominantes (risk-on).");

    /* ---------------- NARRATIVA PROFISSIONAL ---------------- */
    const narrative = `
O mercado apresenta um estado ${marketState.toLowerCase()}.

• Macro: ${macroScore.toFixed(1)} / 100  
• Técnico: ${technicalScore.toFixed(1)} / 100  
• On‑Chain: ${onChainScore.toFixed(1)} / 100  
• Liquidez: ${liquidityScore.toFixed(1)} / 100  
• Risco: ${riskScore.toFixed(1)} / 100  
• Oportunidade: ${opportunityScore.toFixed(1)} / 100  

Hashrate e dificuldade sugerem uma rede saudável.  
Mempool indica ${onchain.mempoolTxCount} transações pendentes.  
Fees atuais: baixa=${onchain.feeLow}, média=${onchain.feeMedium}, alta=${onchain.feeHigh}.  
Preço atual está ${market.zScore24h > 0 ? "acima" : "abaixo"} da média 24h (Z‑Score ${market.zScore24h.toFixed(2)}).  
    `.trim();

    /* ---------------- RECOMENDAÇÃO ---------------- */
    const recommendation =
      opportunityScore > 70
        ? "Ambiente favorável para acumulação controlada."
        : riskScore > 70
        ? "Ambiente de risco elevado — exposição defensiva."
        : macroScore > 60
        ? "Tendência saudável — exposição moderada."
        : "Aguardar confirmação — exposição reduzida.";

    return {
      macroScore,
      technicalScore,
      onChainScore,
      liquidityScore,
      riskScore,
      opportunityScore,
      marketState,
      alerts,
      narrative,
      recommendation,
    };
  }, [market, onchain, fearGreed, dominance]);
};
