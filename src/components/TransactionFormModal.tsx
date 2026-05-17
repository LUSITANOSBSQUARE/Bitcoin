import React, { useState, useMemo } from "react";
import type { LedgerEntryType } from "../context/LedgerContext";

type Props = {
  onClose: () => void;
  onSubmit: (entry: {
    type: LedgerEntryType;
    date: string;
    amountBTC: number;
    amountEUR: number;
    priceEUR: number;
  }) => void;
};

export const TransactionFormModal: React.FC<Props> = ({
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<LedgerEntryType>("BUY");
  const [date, setDate] = useState("");
  const [amountBTC, setAmountBTC] = useState("");
  const [amountEUR, setAmountEUR] = useState("");

  // 🔥 Preço calculado automaticamente
  const priceEUR = useMemo(() => {
    const btc = Number(amountBTC);
    const eur = Number(amountEUR);
    if (!btc || !eur) return 0;
    return eur / btc;
  }, [amountBTC, amountEUR]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#111",
          padding: 30,
          borderRadius: 12,
          border: "1px solid #222",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: 20 }}>Adicionar Transação</h2>

        {/* TYPE */}
        <label style={labelStyle}>Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LedgerEntryType)}
          style={inputStyle}
        >
          <option value="BUY">Compra (BUY)</option>
          <option value="SELL">Venda (SELL)</option>
        </select>

        {/* DATE */}
        <label style={labelStyle}>Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />

        {/* BTC */}
        <label style={labelStyle}>Quantidade BTC</label>
        <input
          type="number"
          step="0.00000001"
          value={amountBTC}
          onChange={(e) => setAmountBTC(e.target.value)}
          style={inputStyle}
        />

        {/* EUR */}
        <label style={labelStyle}>Valor total (€)</label>
        <input
          type="number"
          value={amountEUR}
          onChange={(e) => setAmountEUR(e.target.value)}
          style={inputStyle}
        />

        {/* PREÇO CALCULADO */}
        <label style={labelStyle}>Preço por BTC (calculado)</label>
        <div style={calculatedBox}>
          {priceEUR > 0 ? `${priceEUR.toFixed(2)} €` : "—"}
        </div>

        {/* BOTÕES */}
        <div style={{ display: "flex", gap: 10, marginTop: 25 }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancelar
          </button>

          <button
            onClick={() =>
              onSubmit({
                type,
                date,
                amountBTC: Number(amountBTC),
                amountEUR: Number(amountEUR),
                priceEUR: Number(priceEUR),
              })
            }
            style={saveBtn}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const labelStyle: React.CSSProperties = {
  color: "#aaa",
  marginBottom: 6,
  marginTop: 10,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 14,
  background: "#000",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
};

const calculatedBox: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#000",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#f7931a",
  fontWeight: "bold",
  marginBottom: 18,
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  background: "#222",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  background: "#f7931a",
  border: "none",
  borderRadius: 8,
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};
