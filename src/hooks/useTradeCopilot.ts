import { useMemo } from "react";
import type { BitcoinData } from "../hooks/useBitcoinData";
import type { MarketIntelligence } from "../engine/useMarketIntelligence";

/* ---------- TIPOS ---------- */

export type TradeSetupType =
  | "trend-follow"
  | "mean-reversion"
  | "breakout"
  | "defensive";

export type TradeSetup = {
  id: string;
  type: TradeSetupType;
  title: string;
  thesis: string;
  direction: "long" | "short";
  entryZone: string;
  invalidation: string;
  targetZone: string;
  leverage: string;
  confidence: number;
  conditions: string[];
  riskNote: string;
};

export type TradeAlertLevel = "info" | "warning" | "critical";

export type TradeAlert = {
  id: string;
  level: TradeAlertLevel;
  title: string;
  message: string;
  persistent: boolean;
};

type Params = {
  market: BitcoinData | null;
  intel: MarketIntelligence | null;
};

/* ---------- CAPSULE TRADE ENGINE ---------- */

export const useTradeCopilot = ({ market, intel }: Params) => {
  return useMemo<{ setups: TradeSetup[]; alerts: TradeAlert[] }>(() => {
    const setups: TradeSetup[] = [];
    const alerts: TradeAlert[] = [];

    if (!market || !intel) return { setups, alerts };

    const price = market.priceUSD ?? market.priceEUR ?? 0;

    const {
      riskScore,
      opportunityScore,
      macroScore,
      technicalScore,
      liquidityScore,
      marketState,
    } = intel;

    const { volatility24h, volatility7d, change24h, change7d, zScore24h, pricePosition24h } =
      market;

    /* ---------- SINAIS BASE ---------- */

    const strongUpTrend =
      change7d > 6 && change24h > 1 && technicalScore > 60 && macroScore > 55;

    const strongDownTrend =
      change7d < -6 && change24h < -1 && technicalScore < 45 && macroScore < 50;

    const highVol = volatility24h > 9 || volatility7d > 10;
    const lowVol = volatility24h < 3 && volatility7d < 4;

    const oversold =
      zScore24h < -1.5 || pricePosition24h < 0.25 || change24h < -5;

    const overbought =
      zScore24h > 1.8 || pricePosition24h > 0.8 || change24h > 5;

    const highOpportunity = opportunityScore > 70 && riskScore < 75;
    const highRisk = riskScore > 75;
    const decentLiquidity = liquidityScore > 55;

    /* ---------- BREAKOUT LONG ---------- */

    const bullBreakout =
      strongUpTrend &&
      !highRisk &&
      !lowVol &&
      opportunityScore > 65 &&
      !overbought;

    if (bullBreakout && price > 0) {
      setups.push({
        id: "breakout-long",
        type: "breakout",
        title: "Breakout de Alta",
        thesis:
          "Tendência de alta forte com continuação provável. Mercado aceita preços acima da resistência recente.",
        direction: "long",
        entryZone: `${(price * 1.002).toFixed(0)} – ${(price * 1.006).toFixed(0)} USDT`,
        invalidation: `${(price * 0.985).toFixed(0)} USDT`,
        targetZone: `${(price * 1.04).toFixed(0)} – ${(price * 1.07).toFixed(0)} USDT`,
        leverage: "2x–5x",
        confidence: 86,
        conditions: [
          "Fecho acima da resistência recente",
          "Volume acima da média",
          "Sem reversão imediata após o breakout",
        ],
        riskNote: "Breakouts falhados podem gerar reversões rápidas. Evitar entrar após vela extrema.",
      });

      alerts.push({
        id: "alert-breakout-long",
        level: "warning",
        title: "Breakout de Alta",
        message: "BTC em continuação de tendência com breakout válido.",
        persistent: true,
      });
    }

    /* ---------- BREAKDOWN SHORT ---------- */

    const bearBreakdown =
      strongDownTrend &&
      !lowVol &&
      riskScore > 60 &&
      !oversold;

    if (bearBreakdown && price > 0) {
      setups.push({
        id: "breakout-short",
        type: "breakout",
        title: "Breakdown de Baixa",
        thesis:
          "Perda de suporte relevante com pressão vendedora dominante. Continuação de movimento descendente provável.",
        direction: "short",
        entryZone: `${(price * 0.998).toFixed(0)} – ${(price * 0.994).toFixed(0)} USDT`,
        invalidation: `${(price * 1.01).toFixed(0)} USDT`,
        targetZone: `${(price * 0.96).toFixed(0)} – ${(price * 0.92).toFixed(0)} USDT`,
        leverage: "3x–6x",
        confidence: 82,
        conditions: [
          "Fecho abaixo do suporte recente",
          "Volume vendedor forte",
          "Sem recuperação rápida para dentro da zona perdida",
        ],
        riskNote: "Movimentos de capitulação podem ser violentos. Evitar alavancagem excessiva.",
      });

      alerts.push({
        id: "alert-breakout-short",
        level: "critical",
        title: "Breakdown de Baixa",
        message: "BTC perdeu suporte relevante com pressão vendedora forte.",
        persistent: true,
      });
    }

    /* ---------- TREND FOLLOW LONG ---------- */

    const trendFollowLong =
      strongUpTrend &&
      !highRisk &&
      decentLiquidity &&
      !overbought &&
      opportunityScore > 55;

    if (trendFollowLong && price > 0) {
      setups.push({
        id: "trend-follow-long",
        type: "trend-follow",
        title: "Seguir Tendência de Alta",
        thesis:
          "Correções moderadas dentro de tendência saudável. Entrada em pullbacks controlados.",
        direction: "long",
        entryZone: `${(price * 0.992).toFixed(0)} – ${(price * 0.998).toFixed(0)} USDT`,
        invalidation: `${(price * 0.975).toFixed(0)} USDT`,
        targetZone: `${(price * 1.03).toFixed(0)} – ${(price * 1.05).toFixed(0)} USDT`,
        leverage: "2x–4x",
        confidence: 78,
        conditions: [
          "Correção suave dentro da tendência",
          "Sem quebra de estrutura de alta",
        ],
        riskNote: "Evitar entrar em topo local após vela de expansão forte.",
      });
    }

    /* ---------- MEAN REVERSION LONG ---------- */

    const meanReversionLong =
      oversold &&
      !strongDownTrend &&
      riskScore < 75 &&
      volatility24h > 4;

    if (meanReversionLong && price > 0) {
      setups.push({
        id: "mean-reversion-long",
        type: "mean-reversion",
        title: "Reversão Após Queda Agressiva",
        thesis:
          "Queda forte sem quebra estrutural clara. Possível recuperação para zona média.",
        direction: "long",
        entryZone: `${(price * 0.97).toFixed(0)} – ${(price * 0.985).toFixed(0)} USDT`,
        invalidation: `${(price * 0.94).toFixed(0)} USDT`,
        targetZone: `${(price * 1.02).toFixed(0)} – ${(price * 1.035).toFixed(0)} USDT`,
        leverage: "1x–3x",
        confidence: 64,
        conditions: [
          "Volume vendedor a diminuir",
          "Sem novas mínimas agressivas",
        ],
        riskNote: "Contra a direção dominante. Risco elevado se a tendência de baixa continuar.",
      });
    }

    /* ---------- MODO DEFENSIVO ---------- */

    const defensiveMode =
      highRisk ||
      (highVol && marketState === "Risco Extremo") ||
      (liquidityScore < 40 && volatility7d > 9);

    if (defensiveMode) {
      setups.push({
        id: "defensive-mode",
        type: "defensive",
        title: "Modo Defensivo",
        thesis:
          "Ambiente de risco elevado. O foco passa a ser preservação de capital, não otimização de retorno.",
        direction: "long",
        entryZone: "Evitar novas entradas agressivas",
        invalidation: "Normalização da volatilidade e do risco",
        targetZone: "Preservar capital e reduzir exposição",
        leverage: "0x",
        confidence: 92,
        conditions: [
          "Reduzir alavancagem",
          "Evitar entradas especulativas",
          "Monitorizar apenas níveis macro",
        ],
        riskNote: "O objetivo é sobreviver ao regime de risco, não maximizar lucro.",
      });

      alerts.push({
        id: "alert-defensive",
        level: "warning",
        title: "Modo Defensivo Ativo",
        message: "Ambiente de risco elevado. Exposição agressiva não recomendada.",
        persistent: true,
      });
    }

    /* ---------- SEM SETUPS ---------- */

    if (setups.length === 0) {
      alerts.push({
        id: "alert-neutral",
        level: "info",
        title: "Sem setups claros",
        message:
          "O Capsule Trade Engine não encontra edge suficiente neste momento. Aguardar melhor contexto.",
        persistent: false,
      });
    }

    return { setups, alerts };
  }, [market, intel]);
};
