import React from "react";
import type { RiskResult } from "../hooks/useRiskSimulator";

const orange = "#f7931a";

export const RiskPanel = ({ risk }: { risk: RiskResult }) => {
  return (
    <div style={styles.box}>
      <div style={styles.header}>Simulação de Risco</div>

      <div style={styles.row}>
        <span>Tamanho da posição</span>
        <strong>{risk.positionSize.toFixed(4)} BTC</strong>
      </div>

      <div style={styles.row}>
        <span>Risco por trade</span>
        <strong>{risk.riskAmount.toFixed(2)} USDT</strong>
      </div>

      <div style={styles.row}>
        <span>Margem necessária</span>
        <strong>{risk.marginRequired.toFixed(2)} USDT</strong>
      </div>

      <div style={styles.row}>
        <span>Exposição após entrada</span>
        <strong>{risk.exposureAfter.toFixed(1)}%</strong>
      </div>

      <div style={styles.row}>
        <span>Liquidação estimada</span>
        <strong>{risk.liquidationPrice?.toFixed(0)} USDT</strong>
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
    marginTop: 16,
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
};
