import React from "react";
import { useCapital } from "../context/CapitalContext";
import { usePortfolio } from "../hooks/usePortfolio";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";
import { useCapitalEngine } from "../engine/useCapitalEngine";

export const CapitalControlPage = () => {
  const {
    totalDeposited,
    availableFunds,
    usedFunds,
    deposits,
    withdrawals,
    addFunds,
    withdrawFunds,
  } = useCapital();

  const portfolio = usePortfolio();
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();

  const marketIntelRaw = useMarketIntelligence(
    market,
    onchain,
    fearGreed,
    dominance
  );

  // FALLBACKS SEGUROS
  const btcPrice = market?.priceEUR ?? 0;
  const totalBTC = portfolio.totalBTC ?? 0;
  const currentValue = totalBTC * btcPrice;

  const pnl = currentValue - usedFunds;
  const pnlPercent = usedFunds > 0 ? (pnl / usedFunds) * 100 : 0;

  const realizedProfit = portfolio.realizedProfit ?? 0;

  const exposure =
    totalDeposited > 0 ? (usedFunds / totalDeposited) * 100 : 0;

  const marketIntel =
    marketIntelRaw ?? {
      riskScore: 50,
      opportunityScore: 50,
      marketState: "neutro",
      recommendation: "neutral",
    };

  const capitalIntel = useCapitalEngine(
    {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
      unrealizedProfit: pnl,
    },
    {
      riskScore: marketIntel.riskScore ?? 50,
      opportunityScore: marketIntel.opportunityScore ?? 50,
      marketState: marketIntel.marketState ?? "neutro",
      recommendation: marketIntel.recommendation,
    }
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Centro de Controlo do Capital</h1>
          <p style={styles.subtitle}>
            O teu assistente financeiro para gerir exposição, liquidez e acumulação em Bitcoin.
          </p>
        </div>

        <div style={styles.headerBadge}>
          <span style={styles.headerBadgeLabel}>Modo</span>
          <span style={styles.headerBadgeValue}>
            {capitalIntel.action} · {capitalIntel.intensity.toUpperCase()}
          </span>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <div style={styles.grid}>
        {/* COLUNA ESQUERDA */}
        <div style={styles.colLeft}>
          {/* RESUMO DO CAPITAL */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div style={styles.label}>Resumo do Capital</div>
              <div style={styles.chip}>
                Exposição: {exposure.toFixed(1)}%
              </div>
            </div>

            <div style={styles.row}>
              <span>Dinheiro disponível</span>
              <span style={styles.value}>{availableFunds.toFixed(2)} €</span>
            </div>

            <div style={styles.row}>
              <span>Dinheiro investido</span>
              <span style={styles.value}>{usedFunds.toFixed(2)} €</span>
            </div>

            <div style={styles.row}>
              <span>Bitcoin comprado</span>
              <span style={styles.value}>{totalBTC.toFixed(6)} BTC</span>
            </div>

            <div style={styles.row}>
              <span>Valor atual da carteira</span>
              <span style={styles.value}>{currentValue.toFixed(2)} €</span>
            </div>
          </div>

          {/* PERFORMANCE REAL */}
          <div style={styles.card}>
            <div style={styles.label}>Performance Real</div>

            <div style={styles.row}>
              <span>PnL total</span>
              <span
                style={{
                  ...styles.value,
                  color: pnl >= 0 ? "#22c55e" : "#f43f5e",
                }}
              >
                {pnl.toFixed(2)} €
              </span>
            </div>

            <div style={styles.row}>
              <span>PnL %</span>
              <span
                style={{
                  ...styles.value,
                  color: pnlPercent >= 0 ? "#22c55e" : "#f43f5e",
                }}
              >
                {pnlPercent.toFixed(2)}%
              </span>
            </div>

            <div style={styles.row}>
              <span>Lucros realizados</span>
              <span style={styles.value}>{realizedProfit.toFixed(2)} €</span>
            </div>
          </div>

          {/* ENTRADAS E SAÍDAS */}
          <div style={styles.card}>
            <div style={styles.label}>Entradas e Saídas</div>

            <div style={styles.subLabel}>Entradas</div>
            {deposits.length === 0 && (
              <div style={styles.empty}>Sem entradas registadas</div>
            )}
            {deposits.map((d, i) => (
              <div key={i} style={styles.rowSmall}>
                <span>{new Date(d.date).toLocaleDateString()}</span>
                <span style={styles.value}>{d.amount.toFixed(2)} €</span>
              </div>
            ))}

            <div style={styles.subLabel}>Saídas</div>
            {withdrawals.length === 0 && (
              <div style={styles.empty}>Sem saídas registadas</div>
            )}
            {withdrawals.map((w, i) => (
              <div key={i} style={styles.rowSmall}>
                <span>{new Date(w.date).toLocaleDateString()}</span>
                <span style={styles.value}>{w.amount.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div style={styles.colRight}>
          {/* ANALISTA INTELIGENTE */}
          <div style={styles.card}>
            <div style={styles.label}>Analista Inteligente</div>

            <div style={styles.row}>
              <span>Ação sugerida</span>
              <span style={{ ...styles.value, color: "#f7931a" }}>
                {capitalIntel.action} ({capitalIntel.intensity})
              </span>
            </div>

            <div style={styles.row}>
              <span>Exposição atual</span>
              <span style={styles.value}>
                {capitalIntel.exposureCurrent.toFixed(1)}%
              </span>
            </div>

            <div style={styles.row}>
              <span>Exposição ideal</span>
              <span style={styles.value}>
                {capitalIntel.exposureIdeal.toFixed(1)}%
              </span>
            </div>

            <div style={styles.row}>
              <span>Gap de exposição</span>
              <span style={styles.value}>
                {capitalIntel.exposureGap.toFixed(1)}%
              </span>
            </div>

            <div style={styles.row}>
              <span>Sugestão de compra</span>
              <span style={styles.value}>
                {capitalIntel.suggestedBuy.toFixed(2)} €
              </span>
            </div>

            <div style={styles.row}>
              <span>Sugestão de realização</span>
              <span style={styles.value}>
                {capitalIntel.suggestedSell.toFixed(2)} €
              </span>
            </div>

            <div style={styles.subLabel}>Resumo</div>
            <div style={styles.summary}>{capitalIntel.narrative}</div>
          </div>

          {/* PAINEL DE RISCO / OPORTUNIDADE / LIQUIDEZ */}
          <div style={styles.card}>
            <div style={styles.label}>Contexto de Mercado</div>

            <div style={styles.badgeRow}>
              <div style={styles.badgeBlock}>
                <div style={styles.badgeLabel}>Risco</div>
                <div style={styles.badgeValue}>{capitalIntel.riskLevel}</div>
              </div>
              <div style={styles.badgeBlock}>
                <div style={styles.badgeLabel}>Oportunidade</div>
                <div style={styles.badgeValue}>
                  {capitalIntel.opportunityLevel}
                </div>
              </div>
              <div style={styles.badgeBlock}>
                <div style={styles.badgeLabel}>Liquidez</div>
                <div style={styles.badgeValue}>
                  {capitalIntel.liquidityLevel}
                </div>
              </div>
            </div>

            <div style={styles.subLabel}>Estado do mercado</div>
            <div style={styles.summary}>
              {marketIntel.marketState} ·{" "}
              {marketIntel.recommendation ?? "neutral"}
            </div>
          </div>

          {/* ALERTAS FINANCEIROS */}
          <div style={styles.card}>
            <div style={styles.label}>Alertas Financeiros</div>

            {capitalIntel.alerts.length === 0 && (
              <div style={styles.empty}>Sem alertas críticos neste momento.</div>
            )}

            {capitalIntel.alerts.length > 0 && (
              <ul style={styles.alertList}>
                {capitalIntel.alerts.map((a, i) => (
                  <li key={i} style={styles.alertItem}>
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div style={styles.card}>
            <div style={styles.label}>Ações Rápidas</div>

            <div style={styles.actionsRow}>
              <button
                style={styles.buttonPrimary}
                onClick={() => addFunds(100)}
              >
                + Adicionar 100 €
              </button>

              <button
                style={styles.buttonSecondary}
                onClick={() => withdrawFunds(50)}
              >
                Levantar 50 €
              </button>
            </div>

            <p style={styles.actionsHint}>
              Usa estas ações para ajustar liquidez e deixar o Capital Engine
              recalibrar a tua exposição.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 6,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    maxWidth: 520,
  },
  headerBadge: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #f7931a55",
    background: "#0b0b0b",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  headerBadgeLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#aaa",
  },
  headerBadgeValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f7931a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.1fr)",
    gap: 20,
    alignItems: "flex-start",
  },
  colLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  colRight: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    color: "#f7931a",
    marginBottom: 12,
    fontWeight: 600,
  },
  subLabel: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 14,
  },
  rowSmall: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 13,
    opacity: 0.9,
  },
  value: {
    fontWeight: 600,
  },
  empty: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  summary: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 1.5,
  },
  separator: {
    borderTop: "1px solid #f7931a55",
    margin: "16px 0",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chip: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #333",
    color: "#ddd",
    background: "#111",
  },
  badgeRow: {
    display: "flex",
    gap: 10,
    marginBottom: 8,
  },
  badgeBlock: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    background: "#111",
    border: "1px solid #222",
  },
  badgeLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#888",
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  alertList: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  alertItem: {
    fontSize: 13,
    color: "#f97316",
    background: "#1a1205",
    borderRadius: 8,
    padding: "6px 10px",
    border: "1px solid #f9731633",
  },
  actionsRow: {
    display: "flex",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  buttonPrimary: {
    padding: "10px 16px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  buttonSecondary: {
    padding: "10px 16px",
    background: "#111",
    borderRadius: 8,
    border: "1px solid #333",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  actionsHint: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
};
                                                                          