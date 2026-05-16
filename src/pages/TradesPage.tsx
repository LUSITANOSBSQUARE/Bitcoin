import React, { useState } from "react";
import type { Trade } from "../context/TradesContext";
import { useTrades } from "../context/TradesContext";
import { TradeFormModal } from "../components/TradeFormModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { useBitcoinData } from "../hooks/useBitcoinData";

export const TradesPage = () => {
  const { trades, addTrade, editTrade, removeTrade } = useTrades();
  const market = useBitcoinData();

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Trade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const computePnl = (t: Trade) => {
    const priceOut = t.exitPrice ?? market?.price;
    if (!priceOut) return { pnl: 0, pnlPercent: 0, status: "open" };

    const diff =
      t.type === "long"
        ? priceOut - t.entryPrice
        : t.entryPrice - priceOut;

    const pnl = diff * t.amount;
    const pnlPercent = (diff / t.entryPrice) * 100;

    return {
      pnl,
      pnlPercent,
      status: t.exitPrice ? "closed" : "open",
    };
  };

  return (
    <>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Diário de Trades</h1>

      <button
        onClick={() => setShowAdd(true)}
        style={{
          padding: "12px 20px",
          background: "#f7931a",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
          color: "#000",
          marginBottom: 30,
        }}
      >
        + Adicionar Trade
      </button>

      <table style={{ width: "100%", color: "#fff", fontSize: 14 }}>
        <thead>
          <tr style={{ color: "#aaa" }}>
            <th>Tipo</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Preço entrada</th>
            <th>Preço saída</th>
            <th>Qtd</th>
            <th>Status</th>
            <th>P&L</th>
            <th>%</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const { pnl, pnlPercent, status } = computePnl(t);
            const color =
              status === "open"
                ? "#f7931a"
                : pnl > 0
                ? "#4caf50"
                : pnl < 0
                ? "#f44336"
                : "#fff";

            return (
              <tr key={t.id}>
                <td>{t.type}</td>
                <td>{t.entryDate}</td>
                <td>{t.exitDate || "-"}</td>
                <td>{t.entryPrice}</td>
                <td>{t.exitPrice ?? "-"}</td>
                <td>{t.amount}</td>
                <td style={{ color }}>{status}</td>
                <td style={{ color }}>{pnl.toFixed(2)}</td>
                <td style={{ color }}>{pnlPercent.toFixed(2)}%</td>
                <td>
                  <button
                    onClick={() => setEditItem(t)}
                    style={editBtn}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    style={deleteBtn}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAdd && (
        <TradeFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={(t) => {
            addTrade({ id: crypto.randomUUID(), ...t });
            setShowAdd(false);
          }}
        />
      )}

      {editItem && (
        <TradeFormModal
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={(t) => {
            editTrade({ id: editItem.id, ...t });
            setEditItem(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            removeTrade(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
};

const editBtn: React.CSSProperties = {
  padding: "4px 10px",
  background: "#444",
  border: "1px solid #555",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  marginRight: 8,
};

const deleteBtn: React.CSSProperties = {
  padding: "4px 10px",
  background: "#d9534f",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
};
