import React, { useEffect, useState } from "react";
import type { TradeType } from "../context/TradesContext";

type TradeFormData = {
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  type: TradeType;
  notes?: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (trade: TradeFormData) => void;
  initial?: Partial<TradeFormData>;
};

export const TradeFormModal = ({ onClose, onSubmit, initial }: Props) => {
  const isEditing = Boolean(initial);

  const [entryDate, setEntryDate] = useState(initial?.entryDate || "");
  const [exitDate, setExitDate] = useState(initial?.exitDate || "");
  const [entryPrice, setEntryPrice] = useState(initial?.entryPrice?.toString() || "");
  const [exitPrice, setExitPrice] = useState(initial?.exitPrice?.toString() || "");
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [type, setType] = useState<TradeType>(initial?.type || "long");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");

  // ESC fecha modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const save = () => {
    setError("");

    if (!entryDate || !entryPrice || !amount) {
      setError("Preenche os campos obrigatórios.");
      return;
    }

    onSubmit({
      entryDate,
      exitDate: isEditing ? exitDate || undefined : undefined,
      entryPrice: Number(entryPrice),
      exitPrice: isEditing && exitPrice ? Number(exitPrice) : undefined,
      amount: Number(amount),
      type,
      notes,
    });

    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div style={header}>
          <h2 style={title}>{isEditing ? "Editar Trade" : "Nova Trade"}</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* ERROR */}
        {error && <div style={errorBox}>{error}</div>}

        {/* TIPO */}
        <label style={label}>Tipo</label>
        <select value={type} onChange={(e) => setType(e.target.value as TradeType)} style={input}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>

        {/* DATA ENTRADA */}
        <label style={label}>Data Entrada</label>
        <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={input} />

        {/* CAMPOS DE FECHO — APENAS NO MODO EDITAR */}
        {isEditing && (
          <>
            <label style={label}>Data Saída</label>
            <input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} style={input} />

            <label style={label}>Preço Saída</label>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              style={input}
            />
          </>
        )}

        {/* PREÇO ENTRADA */}
        <label style={label}>Preço Entrada</label>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          style={input}
        />

        {/* QUANTIDADE */}
        <label style={label}>Quantidade</label>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={input}
        />

        {/* NOTAS */}
        <label style={label}>Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea} />

        {/* BOTÕES */}
        <div style={footer}>
          <button onClick={onClose} style={cancelBtn}>Cancelar</button>
          <button onClick={save} style={saveBtn}>{isEditing ? "Guardar Alterações" : "Registar Trade"}</button>
        </div>
      </div>
    </div>
  );
};

/* STYLES */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
  padding: 20,
  zIndex: 9999,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 450,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#111",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #222",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const title: React.CSSProperties = {
  color: "#fff",
  margin: 0,
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
};

const label: React.CSSProperties = {
  color: "#aaa",
  marginBottom: 6,
  display: "block",
  fontSize: 14,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 16,
  background: "#000",
  border: "1px solid #333",
  borderRadius: 10,
  color: "#fff",
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 100,
  resize: "vertical",
};

const footer: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  background: "#222",
  border: "1px solid #333",
  borderRadius: 10,
  color: "#fff",
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  background: "#f7931a",
  border: "none",
  borderRadius: 10,
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  background: "rgba(255,0,0,0.1)",
  border: "1px solid rgba(255,0,0,0.2)",
  color: "#ff6b6b",
  padding: 10,
  borderRadius: 10,
  marginBottom: 16,
};
                                                                               