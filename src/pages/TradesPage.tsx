import React, { useMemo, useState } from "react";
import { useTrades } from "../context/TradesContext";
import type { Trade } from "../context/TradesContext";
import { TradeFormModal } from "../components/TradeFormModal";
import { TradeTable } from "../components/TradeTable";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useTradeCapital } from "../context/TradeCapitalContext";
import { useNavigation } from "../context/NavigationContext";

export const TradesPage = () => {
  const { trades, addTrade, editTrade, removeTrade } = useTrades();
  const market = useBitcoinData();
  const { registerClosedTrade } = useTradeCapital();
  const { navigate } = useNavigation();

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Trade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* -----------------------------------------------------
     CÁLCULO INSTITUCIONAL DE PNL (baseado em valueUSDT)
  ----------------------------------------------------- */
  const computePnl = (t: Trade) => {
    const priceOut = t.exitPrice ?? market?.priceUSD;

    if (!priceOut) {
      return { pnl: 0, pnlPercent: 0, status: "open" as const };
    }

    const priceDiffPercent =
      t.type === "long"
        ? (priceOut - t.entryPrice) / t.entryPrice
        : (t.entryPrice - priceOut) / t.entryPrice;

    const pnlPercent = priceDiffPercent * 100 * t.leverage;
    const pnl = t.valueUSDT * priceDiffPercent * t.leverage;

    return {
      pnl,
      pnlPercent,
      status: t.exitPrice ? ("closed" as const) : ("open" as const),
    };
  };

  /* -----------------------------------------------------
     RESUMO MENSAL (apenas para exibição)
  ----------------------------------------------------- */
  const summary = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalPnl: 0,
        avgPnl: 0,
        winrate: 0,
      };
    }

    const results = trades
      .filter((t) => t.exitPrice)
      .map((t) => computePnl(t).pnl);

    if (results.length === 0) {
      return {
        totalTrades: 0,
        totalPnl: 0,
        avgPnl: 0,
        winrate: 0,
      };
    }

    const wins = results.filter((x) => x > 0).length;

    return {
      totalTrades: results.length,
      totalPnl: results.reduce((a, b) => a + b, 0),
      avgPnl: results.reduce((a, b) => a + b, 0) / results.length,
      winrate: (wins / results.length) * 100,
    };
  }, [trades, market]);

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Diário de Trades</h1>

      {/* BOTÃO PARA TRADE CONTROL */}
      <button
        style={styles.controlButton}
        onClick={() => navigate("tradecontrol")}
      >
        ⚡ Gestão de Capital de Trading
      </button>

      {/* RESUMO MENSAL */}
      <div style={styles.summaryBox}>
        <div>
          <strong>Trades:</strong> {summary.totalTrades}
        </div>
        <div>
          <strong>Resultado Total:</strong>{" "}
          <span style={{ color: summary.totalPnl >= 0 ? "#4caf50" : "#f44336" }}>
            {summary.totalPnl.toFixed(2)} USDT
          </span>
        </div>
        <div>
          <strong>Média por Trade:</strong> {summary.avgPnl.toFixed(2)} USDT
        </div>
        <div>
          <strong>Winrate:</strong> {summary.winrate.toFixed(2)}%
        </div>
      </div>

      <button style={styles.addButton} onClick={() => setShowAdd(true)}>
        + Adicionar Trade
      </button>

      <TradeTable
        trades={trades}
        computePnl={computePnl}
        onEdit={(t) => setEditItem(t)}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* ADICIONAR */}
      {showAdd && (
        <TradeFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={(t) => {
            addTrade({ id: crypto.randomUUID(), ...t });
            setShowAdd(false);
          }}
        />
      )}

      {/* EDITAR */}
      {editItem && (
        <TradeFormModal
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={(t) => {
            const updated = { id: editItem.id, ...t };
            editTrade(updated);

            if (updated.exitPrice) {
              const pnl = computePnl(updated);
              registerClosedTrade(updated, pnl.pnl);
            }

            setEditItem(null);
          }}
        />
      )}

      {/* REMOVER */}
      {deleteId && (
        <ConfirmDeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            removeTrade(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

/* -----------------------------------------------------
   STYLES
----------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },

  controlButton: {
    padding: "12px 20px",
    background: "#222",
    border: "1px solid #333",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    color: "#f7931a",
    marginBottom: 20,
  },

  summaryBox: {
    background: "#111",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #222",
    marginBottom: 30,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 16,
  },

  addButton: {
    padding: "12px 20px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
};
