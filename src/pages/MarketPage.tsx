import React from "react";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";

/* ---------------------------------------------------------
   SAFE HELPER — protege contra null, undefined, NaN
--------------------------------------------------------- */
const safe = (v: any, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/* ---------------------------------------------------------
   SCORE BAR (visual premium)
--------------------------------------------------------- */
const ScoreBar = ({ value }: { value: number }) => {
  const v = Math.max(0, Math.min(100, value));
  const color =
    v > 70 ? "#22c55e" : v > 40 ? "#eab308" : "#ef4444";

  return (
    <div style={{ width: "100%", background: "#111", borderRadius: 6, height: 8 }}>
      <div
        style={{
          width: `${v}%`,
          height: "100%",
          borderRadius: 6,
          background: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
};

/* ---------------------------------------------------------
   MARKET PAGE
--------------------------------------------------------- */
export const MarketPage = () => {
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();
  const intel = useMarketIntelligence(market, onchain, fearGreed, dominance);

  const loading =
    !market || !onchain || fearGreed == null || dominance == null || !intel;

  /* ---------------- LOADING STATE (PREMIUM) ---------------- */
  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <div style={styles.loadingText}>A analisar o mercado em tempo real…</div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     ÍNDICES INSTITUCIONAIS (com safe())
  --------------------------------------------------------- */

  const mempool = safe(onchain?.mempoolTxCount);
  const feeHigh = safe(onchain?.feeHigh);
  const hashrate = safe(onchain?.hashrate);
  const vol = safe(market?.volatility24h);
  const fg = safe(fearGreed);
  const dom = safe(dominance);

  const marketRegime =
    intel.riskScore > 70
      ? "Bearish (Risco Elevado)"
      : intel.opportunityScore > 70
      ? "Bullish (Oportunidade Forte)"
      : intel.macroScore > 60
      ? "Tendência Positiva"
      : "Neutro";

  const volatilityRegime =
    vol > 8
      ? "Alta Volatilidade (Risco)"
      : vol > 4
      ? "Volatilidade Moderada"
      : "Volatilidade Baixa (Acumulação)";

  const liquidityStress =
    mempool > 250000 || feeHigh > 40
      ? "Stress Elevado"
      : mempool > 150000
      ? "Stress Moderado"
      : "Normal";

  const onchainHealth = hashrate > 0 ? "Rede Saudável" : "Rede Estável";

  const trendStrength =
    intel.macroScore > 70
      ? "Tendência Forte"
      : intel.macroScore > 50
      ? "Tendência Moderada"
      : "Sem Tendência";

  /* ---------------------------------------------------------
     PAGE CONTENT
  --------------------------------------------------------- */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Market Intelligence</h1>

      {/* SCORE GLOBAL */}
      <div style={styles.card}>
        <div style={styles.label}>Score Global</div>
        <div style={styles.score}>{Math.round(intel.macroScore)}</div>
        <ScoreBar value={intel.macroScore} />
        <div style={styles.sub}>{intel.marketState}</div>
      </div>

      <div style={styles.separator} />

      {/* REGIMES */}
      <div style={styles.card}>
        <div style={styles.label}>Regime de Mercado</div>
        <div style={styles.item}>{marketRegime}</div>

        <div style={styles.label}>Volatilidade</div>
        <div style={styles.item}>{volatilityRegime}</div>

        <div style={styles.label}>Stress de Liquidez</div>
        <div style={styles.item}>{liquidityStress}</div>

        <div style={styles.label}>Saúde On‑Chain</div>
        <div style={styles.item}>{onchainHealth}</div>

        <div style={styles.label}>Força da Tendência</div>
        <div style={styles.item}>{trendStrength}</div>
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

        <div style={{ marginTop: 12 }}>
          <div style={styles.sub}>Risco</div>
          <ScoreBar value={intel.riskScore} />

          <div style={{ ...styles.sub, marginTop: 8 }}>Oportunidade</div>
          <ScoreBar value={intel.opportunityScore} />
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
            <div key={i} style={styles.strong}>• {s}</div>
          ))}
        </div>
      </div>

      <div style={styles.separator} />

      {/* RESUMO FINAL */}
      <div style={styles.card}>
        <div style={styles.label}>Resumo Institucional</div>
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
    marginBottom: 4,
    marginTop: 10,
  },

  score: {
    fontSize: 40,
    fontWeight: 700,
    marginBottom: 6,
  },

  sub: {
    fontSize: 13,
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
    marginBottom: 4,
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

  loadingWrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    color: "#fff",
  },

  spinner: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,0.1)",
    borderTopColor: "#f7931a",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
};
