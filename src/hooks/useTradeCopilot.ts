import { useMemo } from "react";
import type { BitcoinData } from "../hooks/useBitcoinData";

export type MarketIntel = {
  riskScore: number;
  opportunityScore: number;
  marketState: string;
};

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
  intel: MarketIntel | null;
};

export const useTradeCopilot = ({ market, intel }: Params) => {
  return useMemo<{ setups: TradeSetup[]; alerts: TradeAlert[] }>(() => {
    const setups: TradeSetup[] = [];
    const alerts: TradeAlert[] = [];

    if (!market || !intel) return { setups, alerts };

    const priceUSDT = market.priceUSD; // ⭐ Agora setups em USDT
    const { volatility24h, change24h, change7d } = market;
    const { riskScore, opportunityScore, marketState } = intel;

    const isTrendingUp = change7d > 6 && change24h > 1;
    const isTrendingDown = change7d < -6 && change24h < -1;
    const highVol = volatility24h > 9;
    const lowVol = volatility24h < 3;
    const midVol = !highVol && !lowVol;

    /* ---------------- BREAKOUT REAL ---------------- */
    const bullBreakout =
      isTrendingUp && change24h > 3 && midVol && opportunityScore > 65;

    if (bullBreakout) {
      setups.push({
        id: "breakout-long",
        type: "breakout",
        title: "Breakout de Alta Confirmado",
        thesis:
          "BTC rompeu resistência com força, volume crescente e tendência semanal alinhada.",
        direction: "long",
        entryZone: `${(priceUSDT * 1.002).toFixed(0)} – ${(priceUSDT * 1.006).toFixed(0)} USDT`,
        invalidation: `${(priceUSDT * 0.985).toFixed(0)} USDT`,
        targetZone: `${(priceUSDT * 1.04).toFixed(0)} – ${(priceUSDT * 1.07).toFixed(0)} USDT`,
        leverage: "2x–5x (seguro) / 8x (agressivo)",
        confidence: 88,
        conditions: [
          "Volume acima da média",
          "Fecho acima da resistência",
          "Sem divergências negativas fortes",
        ],
        riskNote: "Breakouts falhados podem reverter violentamente.",
      });

      alerts.push({
        id: "alert-breakout-long",
        level: "warning",
        title: "Breakout de Alta",
        message: "BTC está a romper resistência com força.",
        persistent: true,
      });
    }

    /* ---------------- BREAKDOWN REAL ---------------- */
    const bearBreakdown =
      isTrendingDown && change24h < -3 && midVol && riskScore > 65;

    if (bearBreakdown) {
      setups.push({
        id: "breakout-short",
        type: "breakout",
        title: "Breakdown de Baixa Confirmado",
        thesis:
          "BTC perdeu suporte crítico com volume vendedor forte.",
        direction: "short",
        entryZone: `${(priceUSDT * 0.998).toFixed(0)} – ${(priceUSDT * 0.994).toFixed(0)} USDT`,
        invalidation: `${(priceUSDT * 1.01).toFixed(0)} USDT`,
        targetZone: `${(priceUSDT * 0.96).toFixed(0)} – ${(priceUSDT * 0.92).toFixed(0)} USDT`,
        leverage: "3x–6x (seguro) / 10x (agressivo)",
        confidence: 82,
        conditions: [
          "Volume vendedor forte",
          "Fecho abaixo do suporte",
          "Sem recuperação imediata",
        ],
        riskNote: "Breakdowns podem gerar capitulação.",
      });

      alerts.push({
        id: "alert-breakout-short",
        level: "critical",
        title: "Breakdown de Baixa",
        message: "BTC perdeu suporte importante.",
        persistent: true,
      });
    }

    /* ---------------- TREND FOLLOW ---------------- */
    if (isTrendingUp && opportunityScore > 60 && riskScore < 70) {
      setups.push({
        id: "trend-follow",
        type: "trend-follow",
        title: "Seguir Tendência de Alta",
        thesis: "Correções moderadas dentro de tendência forte.",
        direction: "long",
        entryZone: `${(priceUSDT * 0.992).toFixed(0)} – ${(priceUSDT * 0.998).toFixed(0)} USDT`,
        invalidation: `${(priceUSDT * 0.975).toFixed(0)} USDT`,
        targetZone: `${(priceUSDT * 1.03).toFixed(0)} – ${(priceUSDT * 1.05).toFixed(0)} USDT`,
        leverage: "2x–4x",
        confidence: 78,
        conditions: ["Correções controladas", "Sem divergências negativas"],
        riskNote: "Evitar entrar em topo local.",
      });
    }

    /* ---------------- MEAN REVERSION ---------------- */
    if (change24h < -5 && riskScore < 70) {
      setups.push({
        id: "mean-reversion",
        type: "mean-reversion",
        title: "Reversão Após Queda Agressiva",
        thesis: "Queda forte mas sem quebra estrutural.",
        direction: "long",
        entryZone: `${(priceUSDT * 0.97).toFixed(0)} – ${(priceUSDT * 0.985).toFixed(0)} USDT`,
        invalidation: `${(priceUSDT * 0.94).toFixed(0)} USDT`,
        targetZone: `${(priceUSDT * 1.02).toFixed(0)} – ${(priceUSDT * 1.035).toFixed(0)} USDT`,
        leverage: "1x–3x",
        confidence: 62,
        conditions: ["Volume vendedor a diminuir"],
        riskNote: "Contra-tendência — risco elevado.",
      });
    }

    /* ---------------- DEFENSIVE ---------------- */
    if (riskScore > 80 || (highVol && marketState === "turbulento")) {
      setups.push({
        id: "defensive",
        type: "defensive",
        title: "Modo Defensivo",
        thesis: "Risco estrutural elevado.",
        direction: "long",
        entryZone: "Evitar novas entradas",
        invalidation: "Normalização da volatilidade",
        targetZone: "Preservar capital",
        leverage: "0x",
        confidence: 90,
        conditions: ["Reduzir exposição", "Evitar alavancagem"],
        riskNote: "Objetivo é sobreviver ao regime de risco.",
      });

      alerts.push({
        id: "alert-defensive",
        level: "warning",
        title: "Modo Defensivo",
        message: "Volatilidade extrema — preservar capital.",
        persistent: true,
      });
    }

    /* ---------------- SEM SETUPS ---------------- */
    if (setups.length === 0) {
      alerts.push({
        id: "alert-neutral",
        level: "info",
        title: "Sem setups claros",
        message:
          "O Copilot não encontra oportunidades com edge suficiente.",
        persistent: false,
      });
    }

    return { setups, alerts };
  }, [market, intel]);
};
