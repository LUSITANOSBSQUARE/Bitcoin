import React, { useState } from "react";
import type { TradeType } from "../context/TradesContext";

export const TradeFormModal = ({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (t: {
    entryDate: string;
    exitDate?: string;
    entryPrice: number;
    exitPrice?: number;
    amount: number;
    type: TradeType;
    notes?: string;
  }) => void;
  initial?: any;
}) => {
  const [entryDate, setEntryDate] = useState(initial?.entryDate || "");
  const [exitDate, setExitDate] = useState(initial?.exitDate || "");
  const [entryPrice, setEntryPrice] = useState(initial?.entryPrice || "");
  const [exitPrice, setExitPrice] = useState(initial?.exitPrice || "");
  const [amount, setAmount] = useState(initial?.amount || "");
  const [type, setType] = useState<TradeType>(initial?.type || "long");
  const [notes, setNotes] = useState(initial?.notes || "");

  const save = () => {
    if (!entryDate || !entryPrice || !amount) return;
    onSubmit({
      entryDate,
      exitDate: exitDate || undefined,
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice ? Number(exitPrice) : undefined,
      amount: Number(amount),
      type,
      notes,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
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
        <h2 style={{ color: "#fff", marginBottom: 20 }}>
          {initial ? "Editar Trade" : "Adicionar Trade"}
        </h2>

        <label style={label}>Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TradeType)}
          style={input}
        >
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>

        <label style={label}>Data entrada</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          style={input}
        />

        <label style={label}>Data saída (opcional)</label>
        <input
          type="date"
          value={exitDate}
          onChange={(e) => setExitDate(e.target.value)}
          style={input}
        />

        <label style={label}>Preço entrada</label>
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          style={input}
        />

        <label style={label}>Preço saída (opcional)</label>
        <input
          type="number"
          value={exitPrice}
          onChange={(e) => setExitPrice(e.target.value)}
          style={input}
        />

        <label style={label}>Quantidade</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={input}
        />

        <label style={label}>Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...input, height: 80 }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancelar
          </button>
          <button onClick={save} style={saveBtn}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const label: React.CSSProperties = {
  color: "#aaa",
  marginBottom: 4,
  display: "block",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: 15,
  background: "#000",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  background: "#222",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
};

const saveBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  background: "#f7931a",
  border: "none",
  borderRadius: 8,
  color: "#000",
  fontWeight: "bold",
};
