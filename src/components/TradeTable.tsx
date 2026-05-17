import React from "react";
import type { Trade } from "../context/TradesContext";

type Props = {
  trades: Trade[];
  computePnl: (t: Trade) => {
    pnl: number;
    pnlPercent: number;
    status: "open" | "closed";
  };
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
};

export const TradeTable = ({ trades, computePnl, onEdit, onDelete }: Props) => {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>Ativo</th>
          <th>USDT</th>
          <th>Abertura</th>
          <th>Direção</th>
          <th>Fecho</th>
          <th>Resultado</th>
          <th>%</th>
          <th>Lev</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        {trades.map((t) => {
          const pnl = computePnl(t);
          const color =
            pnl.pnl > 0 ? "#4caf50" : pnl.pnl < 0 ? "#f44336" : "#fff";

          return (
            <tr key={t.id}>
              <td>{t.asset}</td>
              <td>{t.valueUSDT.toFixed(2)}</td>
              <td>{t.entryDate}</td>
              <td>{t.type.toUpperCase()}</td>
              <td>{t.exitDate || "-"}</td>
              <td style={{ color }}>{pnl.pnl.toFixed(2)}</td>
              <td style={{ color }}>{pnl.pnlPercent.toFixed(2)}%</td>
              <td>{t.leverage}×</td>
              <td>
                <button style={styles.edit} onClick={() => onEdit(t)}>
                  Editar
                </button>
                <button style={styles.delete} onClick={() => onDelete(t.id)}>
                  Remover
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#111",
    color: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  edit: {
    padding: "4px 10px",
    background: "#444",
    border: "1px solid #555",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    marginRight: 8,
  },
  delete: {
    padding: "4px 10px",
    background: "#d9534f",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
  },
};
