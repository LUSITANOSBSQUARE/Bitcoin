import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

export const PortfolioPage = () => {
  const { transactions, addTransaction, editTransaction, removeTransaction } =
    usePortfolio();
  const data = useBitcoinData();

  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalBTC = transactions.reduce((s, t) => s + t.amountBTC, 0);
  const totalInvested = transactions.reduce(
    (s, t) => s + t.amountBTC * t.priceUSD,
    0
  );

  const avgPrice = totalBTC > 0 ? totalInvested / totalBTC : 0;
  const currentValue = data ? totalBTC * data.priceEUR : 0;

  const pnl = currentValue - totalInvested;
  const roi = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return (
    <>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Portfolio</h1>

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
        + Adicionar Transação
      </button>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Card label="Total BTC" value={totalBTC.toFixed(8)} />
        <Card label="Total Investido" value={`$${totalInvested.toLocaleString()}`} />
        <Card label="Preço Médio" value={`$${avgPrice.toLocaleString()}`} />
        <Card label="Valor Atual" value={`$${currentValue.toLocaleString()}`} />
        <Card label="P&L" value={`$${pnl.toLocaleString()}`} />
        <Card label="ROI" value={`${roi.toFixed(2)}%`} />
      </div>

      <h2 style={{ marginTop: 40 }}>Transações</h2>

      {transactions.length === 0 ? (
        <p style={{ color: "#aaa" }}>Nenhuma transação registada.</p>
      ) : (
        <table style={{ marginTop: 20, width: "100%", color: "#fff" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#aaa" }}>
              <th>Data</th>
              <th>BTC</th>
              <th>Preço USD</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.amountBTC}</td>
                <td>${t.priceUSD.toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => setEditTx(t)}
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
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <TransactionFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={(tx) => {
            addTransaction({
              id: crypto.randomUUID(),
              ...tx,
            });
            setShowAdd(false);
          }}
        />
      )}

      {editTx && (
        <TransactionFormModal
          initial={editTx}
          onClose={() => setEditTx(null)}
          onSubmit={(tx) => {
            editTransaction({
              id: editTx.id,
              ...tx,
            });
            setEditTx(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            removeTransaction(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
};

const editBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#444",
  border: "1px solid #555",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  marginRight: 10,
};

const deleteBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#d9534f",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
};

const Card = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      background: "#111",
      padding: 20,
      borderRadius: 12,
      border: "1px solid #222",
      width: 220,
    }}
  >
    <p style={{ color: "#aaa", marginBottom: 8 }}>{label}</p>
    <h2 style={{ fontSize: 26, fontWeight: "bold", color: "#f7931a" }}>{value}</h2>
  </div>
);
