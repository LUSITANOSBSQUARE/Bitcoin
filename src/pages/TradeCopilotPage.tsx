import React, { useEffect } from "react";
import type { CSSProperties } from "react";

import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";

import { useTradeCopilot } from "../hooks/useTradeCopilot";
import type { TradeAlert, TradeSetup } from "../hooks/useTradeCopilot";

import { useAlerts } from "../context/AlertsContext";

export const TradeCopilotPage = () => {
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();

  const intel = useMarketIntelligence(market, onchain, fearGreed, dominance);
  const { setups, alerts } = useTradeCopilot({ market, intel });

  const { alerts: persistentAlerts, pushAlert, dismissAlert } = useAlerts();

  const price = market?.priceUSD ?? market?.priceEUR ?? 0;

  useEffect(() => {
    alerts.forEach((a) => {
      if (a.persistent) pushAlert(a);
    });
  }, [alerts, pushAlert]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        Trade Copilot <span style={styles.v2}>v2.5</span>
      </h1>

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

      {/* HEADER */}
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
            {intel ? intel.marketState : "A analisar contexto..."}
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* SEM SETUPS */}
      {setups.length === 0 && (
        <div style={styles.empty}>
          Sem setups claros neste momento.  
          O Copilot está à espera de condições com melhor assimetria risco/retorno.
        </div>
      )}

      {/* SETUPS */}
      {setups.map((s: TradeSetup) => (
        <div key={s.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{s.title}</span>
            <span style={{ ...styles.badge, ...badgeColor[s.type] }}>{s.type}</span>
          </div>

          <div style={styles.thesis}>{s.thesis}</div>

          {/* Barra de confiança */}
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
            <span>Entrada (USDT)</span>
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
        </div>
      ))}
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const orange = "#f7931a";
const dark = "#0b0b0b";

const styles: Record<string, CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 960,
    margin: "0 auto",
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    fontWeight: 700,
    color: orange,
  },
  v2: {
    fontSize: 18,
    opacity: 0.7,
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
  empty: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
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
};

const badgeColor: Record<string, CSSProperties> = {
  "trend-follow": { background: "rgba(255,165,0,0.15)", color: orange },
  "mean-reversion": { background: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  breakout: { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
  defensive: { background: "rgba(234,179,8,0.15)", color: "#eab308" },
};
    