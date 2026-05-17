import React from "react";
import type { TimeframeSet } from "../hooks/useTimeframeAnalysis";

const orange = "#f7931a";

export const TimeframePanel = ({ tf }: { tf: TimeframeSet }) => {
  const renderRow = (label: string, data: any) => (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{data.trend}</div>
      <div style={styles.value}>{data.momentum}</div>
      <div style={styles.value}>{data.volatility}</div>
      <div style={styles.value}>{data.condition}</div>
    </div>
  );

  return (
    <div style={styles.box}>
      <div style={styles.header}>Multi‑Timeframe</div>

      <div style={styles.rowHeader}>
        <div style={styles.label}></div>
        <div style={styles.col}>Trend</div>
        <div style={styles.col}>Momentum</div>
        <div style={styles.col}>Vol</div>
        <div style={styles.col}>Cond.</div>
      </div>

      {renderRow("5m", tf["5m"])}
      {renderRow("1H", tf["1H"])}
      {renderRow("4H", tf["4H"])}
      {renderRow("1D", tf["1D"])}
      {renderRow("1W", tf["1W"])}
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
  rowHeader: {
    display: "grid",
    gridTemplateColumns: "60px 1fr 1fr 1fr 1fr",
    marginBottom: 6,
    opacity: 0.7,
    fontSize: 12,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "60px 1fr 1fr 1fr 1fr",
    padding: "4px 0",
    fontSize: 13,
  },
  label: {
    opacity: 0.8,
  },
  col: {
    opacity: 0.8,
  },
  value: {
    fontWeight: 600,
    textTransform: "capitalize",
  },
};
