import React from "react";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";

export const MarketPage = () => {
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();
  const intel = useMarketIntelligence(market, onchain, fearGreed, dominance);

  const loading =
    !market || !onchain || fearGreed == null || dominance == null || !intel;

  if (loading) {
    return (
      <div style={{ padding: 32, color: "#fff" }}>A analisar mercado…</div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Market Intelligence</h1>

      {/* SCORE GLOBAL */}
      <div style={styles.card}>
        <div style={styles.label}>Score Global</div>
        <div style={styles.score}>{Math.round(intel.macroScore)}</div>
        <div style={styles.sub}>{intel.marketState}</div>
      </div>

      <div style={styles.separator} />

      {/* DECISÃO */}
      <div style={styles.card}>
        <div style={styles.label}>Decisão da IA</div>

        <div
          style={{
            ...styles.action,
            color:
              intel.recommendation.includes("acumulação")
                ? "#22c55e"
                : intel.recommendation.includes("defensiva")
                ? "#f43f5e"
                : "#eab308",
          }}
        >
          {intel.recommendation}
        </div>

        <div style={styles.sub}>
          Risco {intel.riskScore.toFixed(0)} · Oportunidade{" "}
          {intel.opportunityScore.toFixed(0)}
        </div>
      </div>

      <div style={styles.separator} />

      {/* SINAIS FORTES */}
      <div style={styles.card}>
        <div style={styles.label}>Sinais fortes</div>

        {intel.alerts.length === 0 && (
          <div style={{ color: "#666" }}>Nenhum sinal forte</div>
        )}

        <div style={styles.cleanList}>
          {intel.alerts.slice(0, 3).map((s, i) => (
            <div key={i} style={styles.strong}>{s}</div>
          ))}
        </div>
      </div>

      <div style={styles.separator} />

      {/* MERCADO */}
      <div style={styles.card}>
        <div style={styles.label}>Mercado</div>

        <div style={styles.cleanList}>
          <div style={styles.item}>
            Sentimento:{" "}
            {fearGreed < 30
              ? "Medo"
              : fearGreed < 70
              ? "Neutro"
              : "Ganância"}
          </div>

          <div style={styles.item}>
            Dominância:{" "}
            {dominance! > 55
              ? "BTC a liderar"
              : dominance! < 40
              ? "Altcoins a liderar"
              : "Equilíbrio"}
          </div>

          <div style={styles.item}>
            Volatilidade:{" "}
            {market!.volatility24h > 8
              ? "Alta"
              : market!.volatility24h > 4
              ? "Média"
              : "Baixa"}
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ON-CHAIN */}
      <div style={styles.card}>
        <div style={styles.label}>On‑Chain</div>

        <div style={styles.cleanList}>
          <div style={styles.item}>
            Rede: {onchain!.hashrate ? "Hashrate forte" : "Hashrate normal"}
          </div>

          <div style={styles.item}>
            Mempool:{" "}
            {onchain!.mempoolTxCount! > 200000
              ? "Congestionado"
              : "Fluido"}
          </div>

          <div style={styles.item}>
            Fees:{" "}
            {onchain!.feeHigh! > 50
              ? "Altas"
              : onchain!.feeHigh! > 15
              ? "Médias"
              : "Baixas"}
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* RESUMO FINAL */}
      <div style={styles.card}>
        <div style={styles.label}>Resumo final</div>
        <div style={styles.summary}>
          {intel.narrative.split(".")[0]}
        </div>
      </div>
    </div>
  );
};

/* --- STYLES --- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 600,
  },
  card: {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 8,
  },
  score: {
    fontSize: 40,
    fontWeight: 700,
  },
  sub: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  action: {
    fontSize: 28,
    fontWeight: 700,
    marginTop: 6,
  },
  separator: {
    borderTop: "1px solid #f7931a55",
    margin: "16px 0",
  },
  cleanList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  item: {
    color: "#ddd",
    fontSize: 14,
  },
  strong: {
    color: "#22c55e",
    fontSize: 14,
  },
  summary: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 1.5,
  },
};
