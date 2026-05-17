import React from "react";
import type { MarketStrength } from "../hooks/useMarketStrength";

const orange = "#f7931a";

export const MarketStrengthPanel = ({ ms }: { ms: MarketStrength }) => {
  return (
    <div style={styles.box}>
      <div style={styles.header}>Força do Mercado</div>

      <div style={styles.row}>
        <span>Market Strength</span>
        <strong>{ms.marketStrength}</strong>
      </div>

      <div style={styles.row}>
        <span>Trend Strength</span>
        <strong>{ms.trendStrength}</strong>
      </div>

      <div style={styles.row}>
        <span>Liquidity</span>
        <strong>{ms.liquidityStrength}</strong>
      </div>

      <div style={styles.row}>
        <span>Volatility</span>
        <strong style={styles.tag}>{ms.volatilityRegime}</strong>
      </div>

      <div style={styles.row}>
        <span>Risk</span>
        <strong style={styles.tag}>{ms.riskRegime}</strong>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  box: {
    background: "#111",
    border: "1px solid #222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 700,
    color: orange,
    marginBottom: 12,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: 14,
  },
  tag: {
    textTransform: "capitalize",
  },
};
