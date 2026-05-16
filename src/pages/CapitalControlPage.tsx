import React from "react";
import { useCapital } from "../context/CapitalContext";
import { usePortfolio } from "../hooks/usePortfolio";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";
import { useCapitalAnalyst } from "../hooks/useCapitalAnalyst";

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

  const capitalIntel = useCapitalAnalyst(
    {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
    },
    marketIntel
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Centro de Controlo do Capital</h1>

      {/* RESUMO DO CAPITAL */}
      <div style={styles.card}>
        <div style={styles.label}>Resumo do Capital</div>

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

      <div style={styles.separator} />

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

      <div style={styles.separator} />

      {/* EXPOSIÇÃO AO RISCO */}
      <div style={styles.card}>
        <div style={styles.label}>Exposição ao Risco</div>

        <div style={styles.row}>
          <span>Exposição</span>
          <span style={styles.value}>{exposure.toFixed(2)}%</span>
        </div>

        <div style={styles.row}>
          <span>Liquidez</span>
          <span style={styles.value}>
            {(100 - exposure).toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ANALISTA INTELIGENTE */}
      <div style={styles.card}>
        <div style={styles.label}>Analista Inteligente</div>

        <div style={styles.row}>
          <span>Ação sugerida</span>
          <span style={{ ...styles.value, color: "#f7931a" }}>
            {capitalIntel.action}
          </span>
        </div>

        <div style={styles.row}>
          <span>Intensidade</span>
          <span style={styles.value}>{capitalIntel.intensity}</span>
        </div>

        <div style={styles.row}>
          <span>Exposição atual</span>
          <span style={styles.value}>
            {capitalIntel.exposure.toFixed(1)}%
          </span>
        </div>

        <div style={styles.subLabel}>Resumo</div>
        <div style={styles.summary}>{capitalIntel.narrative}</div>
      </div>

      <div style={styles.separator} />

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

      <div style={styles.separator} />

      {/* AÇÕES RÁPIDAS */}
      <div style={styles.card}>
        <div style={styles.label}>Ações Rápidas</div>

        <button
          style={styles.button}
          onClick={() => addFunds(100)}
        >
          Adicionar 100 €
        </button>

        <button
          style={styles.button}
          onClick={() => withdrawFunds(50)}
        >
          Levantar 50 €
        </button>
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
    fontSize: 16,
    color: "#f7931a",
    marginBottom: 12,
    fontWeight: 600,
  },
  subLabel: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 15,
  },
  rowSmall: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 14,
    opacity: 0.85,
  },
  value: {
    fontWeight: 600,
  },
  empty: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  separator: {
    borderTop: "1px solid #f7931a55",
    margin: "16px 0",
  },
  summary: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 1.5,
  },
  button: {
    padding: "10px 16px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
    marginRight: 10,
    marginTop: 10,
  },
};
                                                                                  