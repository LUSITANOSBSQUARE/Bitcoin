import React, { useEffect } from "react";
import type { CSSProperties } from "react";

import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";

import { useMarketIntelligence } from "../engine/useMarketIntelligence";
import { useTimeframeAnalysis } from "../hooks/useTimeframeAnalysis";
import { useMarketStrength } from "../hooks/useMarketStrength";

import { useTradeCopilot } from "../hooks/useTradeCopilot";
import type { TradeAlert, TradeSetup } from "../hooks/useTradeCopilot";

import { useAlerts } from "../context/AlertsContext";
import { TimeframePanel } from "../components/TimeframePanel";
import { MarketStrengthPanel } from "../components/MarketStrengthPanel";

const orange = "#f7931a";
const dark = "#0b0b0b";

/* ---------- RISK SIMULATION (FUNÇÃO PURA) ---------- */

type RiskResult = {
  positionSize: number;
  riskAmount: number;
  riskPercent: number;
  liquidationPrice: number | null;
  marginRequired: number;
  exposureAfter: number;
};

const simulateRisk = (
  setup: TradeSetup,
  capital: number,
  maxRiskPercent: number,
  price: number
): RiskResult => {
  const invalidation = parseFloat(setup.invalidation);
  const levMatch = setup.leverage.match(/(\d+(\.\d+)?)/);
  const leverage = levMatch ? parseFloat(levMatch[1]) : 1;

  const riskAmount = (capital * maxRiskPercent) / 100;
  const distance = Math.abs(price - invalidation);
  const positionSize = distance > 0 ? riskAmount / distance : 0;
  const marginRequired = leverage > 0 ? positionSize * price / leverage : 0;

  const liquidationPrice =
    leverage > 0
      ? setup.direction === "long"
        ? price - price / leverage
        : price + price / leverage
      : null;

  const exposureAfter = capital > 0 ? (marginRequired / capital) * 100 : 0;

  return {
    positionSize,
    riskAmount,
    riskPercent: maxRiskPercent,
    liquidationPrice,
    marginRequired,
    exposureAfter,
  };
};

/* ---------- RISK PANEL (INLINE COMPONENT) ---------- */

const RiskPanel = ({ risk }: { risk: RiskResult }) => (
  <div style={styles.riskBox}>
    <div style={styles.riskHeader}>Simulação de risco</div>

    <div style={styles.riskRow}>
      <span>Tamanho da posição</span>
      <strong>{risk.positionSize.toFixed(4)} BTC</strong>
    </div>

    <div style={styles.riskRow}>
      <span>Risco por trade</span>
      <strong>{risk.riskAmount.toFixed(2)} USDT</strong>
    </div>

    <div style={styles.riskRow}>
      <span>Margem necessária</span>
      <strong>{risk.marginRequired.toFixed(2)} USDT</strong>
    </div>

    <div style={styles.riskRow}>
      <span>Exposição após entrada</span>
      <strong>{risk.exposureAfter.toFixed(1)}%</strong>
    </div>

    <div style={styles.riskRow}>
      <span>Liquidação estimada</span>
      <strong>
        {risk.liquidationPrice ? `${risk.liquidationPrice.toFixed(0)} USDT` : "—"}
      </strong>
    </div>
  </div>
);

/* ---------- PAGE ---------- */

export const TradeCopilotPage = () => {
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();

  const intel = useMarketIntelligence(market, onchain, fearGreed, dominance);
  const tf = useTimeframeAnalysis(market, intel);
  const ms = useMarketStrength(intel);

  const { setups, alerts } = useTradeCopilot({ market, intel });
  const { alerts: persistentAlerts, pushAlert, dismissAlert } = useAlerts();

  const price = market?.priceUSD ?? market?.priceEUR ?? 0;
  const capital = 1000; // aqui podes ligar ao teu CapitalContext
  const maxRiskPercent = 1; // risco por trade

  useEffect(() => {
    alerts.forEach((a) => {
      if (a.persistent) pushAlert(a);
    });
  }, [alerts, pushAlert]);

  return (
    <div style={styles.page}>
      {/* HEADER PRINCIPAL */}
      <div style={styles.headerMain}>
        <h1 style={styles.engineTitle}>Capsule Trade Engine</h1>
        <div style={styles.engineSubtitle}>Copilot</div>
      </div>

      {/* ALERTAS PERSISTENTES */}
      {persistentAlerts.length > 0 && (
        <div style={styles.alertsPanel}>
          {persistentAlerts.map((a: TradeAlert) => (
            <div
              key={a.id}
              style={{
                ...styles.alertCard,
                ...(a.level === "info"
                  ? styles.alertInfo
                  : a.level === "warning"
                  ? styles.alertWarning
                  : styles.alertCritical),
              }}
            >
              <div style={styles.alertHeader}>
                <strong>{a.title}</strong>
                <button onClick={() => dismissAlert(a.id)} style={styles.closeBtn}>
                  ✕
                </button>
              </div>
              <div style={styles.alertMessage}>{a.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* INFO RÁPIDA */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.label}>BTC/USDT</div>
          <div style={styles.value}>
            {price ? `${price.toFixed(0)} USDT` : "A carregar..."}
          </div>
        </div>
        <div>
          <div style={styles.label}>Estado do mercado</div>
          <div style={styles.valueSmall}>
            {intel ? intel.marketState : "A analisar..."}
          </div>
        </div>
      </div>

      {/* PAINEL MULTI‑TIMEFRAME */}
      {tf && <TimeframePanel tf={tf} />}

      {/* PAINEL DE FORÇA DO MERCADO */}
      {ms && <MarketStrengthPanel ms={ms} />}

      <div style={styles.separator} />

      {/* SEM SETUPS */}
      {setups.length === 0 && (
        <div style={styles.noSetupsBox}>
          <h3 style={styles.noSetupsTitle}>Sem setups no momento</h3>
          <p style={styles.noSetupsText}>
            O Capsule Trade Engine não encontra edge suficiente neste contexto.
            Aguardar melhor alinhamento entre 1H, 4H e Diário.
          </p>
        </div>
      )}

      {/* SETUPS */}
      {setups.map((s: TradeSetup) => {
        const risk =
          price > 0
            ? simulateRisk(s, capital, maxRiskPercent, price)
            : null;

        return (
          <div key={s.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{s.title}</span>
              <span style={{ ...styles.badge, ...badgeColor[s.type] }}>
                {s.type}
              </span>
            </div>

            <div style={styles.thesis}>{s.thesis}</div>

            <div style={styles.confidenceBarWrapper}>
              <div
                style={{
                  ...styles.confidenceBarFill,
                  width: `${s.confidence}%`,
                }}
              />
            </div>
            <div style={styles.confidenceText}>
              Confiança: {s.confidence.toFixed(0)}%
            </div>

            <div style={styles.row}>
              <span>Direção</span>
              <span style={styles.value}>{s.direction.toUpperCase()}</span>
            </div>

            <div style={styles.row}>
              <span>Entrada</span>
              <span style={styles.value}>{s.entryZone}</span>
            </div>

            <div style={styles.row}>
              <span>Invalidation</span>
              <span style={styles.value}>{s.invalidation}</span>
            </div>

            <div style={styles.row}>
              <span>Alvo</span>
              <span style={styles.value}>{s.targetZone}</span>
            </div>

            <div style={styles.row}>
              <span>Alavancagem</span>
              <span style={styles.value}>{s.leverage}</span>
            </div>

            <div style={styles.subLabel}>Condições</div>
            <div style={styles.conditions}>{s.conditions.join(" · ")}</div>

            <div style={styles.riskNote}>{s.riskNote}</div>

            {risk && <RiskPanel risk={risk} />}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles: Record<string, CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 960,
    margin: "0 auto",
  },

  headerMain: {
    marginBottom: 24,
  },
  engineTitle: {
    fontSize: 40,
    fontWeight: 800,
    color: orange,
    letterSpacing: 1,
  },
  engineSubtitle: {
    fontSize: 15,
    opacity: 0.6,
    marginTop: -8,
    marginLeft: 4,
  },

  alertsPanel: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  alertCard: {
    padding: 14,
    borderRadius: 10,
    border: "1px solid #333",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  alertMessage: {
    opacity: 0.9,
    fontSize: 13,
  },
  alertInfo: {
    background: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.4)",
  },
  alertWarning: {
    background: "rgba(234,179,8,0.12)",
    borderColor: "rgba(234,179,8,0.4)",
  },
  alertCritical: {
    background: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.5)",
  },

  headerRow: {
    display: "flex",
    gap: 40,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: 700,
  },
  valueSmall: {
    fontSize: 16,
    fontWeight: 500,
  },
  separator: {
    borderTop: "1px solid #1f1f1f",
    margin: "18px 0",
  },

  noSetupsBox: {
    background: "#111",
    border: "1px solid #222",
    padding: 18,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  noSetupsTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: orange,
    marginBottom: 6,
  },
  noSetupsText: {
    opacity: 0.85,
    fontSize: 13,
  },

  card: {
    background: dark,
    border: "1px solid #1f1f1f",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0 0 20px rgba(247,147,26,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  badge: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 700,
  },
  thesis: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 12,
  },
  confidenceBarWrapper: {
    width: "100%",
    height: 6,
    background: "#222",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  confidenceBarFill: {
    height: "100%",
    background: orange,
    transition: "0.3s",
  },
  confidenceText: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 12,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 10,
    marginBottom: 4,
  },
  conditions: {
    fontSize: 13,
    color: "#ddd",
  },
  riskNote: {
    fontSize: 12,
    color: "#f97316",
    marginTop: 10,
  },

  riskBox: {
    background: "#111",
    border: "1px solid #222",
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
  },
  riskHeader: {
    fontSize: 14,
    fontWeight: 600,
    color: orange,
    marginBottom: 8,
  },
  riskRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    padding: "2px 0",
  },
};

const badgeColor: Record<string, CSSProperties> = {
  "trend-follow": { background: "rgba(255,165,0,0.15)", color: orange },
  "mean-reversion": { background: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  breakout: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
  defensive: { background: "rgba(234,179,8,0.15)", color: "#eab308" },
};
