import React, { useState } from "react";

export const FundMovementModal = ({
  type,
  onClose,
  onSubmit,
}: {
  type: "deposit" | "withdraw";
  onClose: () => void;
  onSubmit: (amount: number, date: number) => void;
}) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!isNaN(value) && value > 0) {
      onSubmit(value, new Date(date).getTime());
      onClose();
    }
  };

  return (
    <div style={modal.backdrop}>
      <div style={modal.box}>
        <h2 style={modal.title}>
          {type === "deposit" ? "Entrada de Fundos" : "Saída de Fundos"}
        </h2>

        <label style={modal.label}>Valor (€)</label>
        <input
          style={modal.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <label style={modal.label}>Data</label>
        <input
          type="date"
          style={modal.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div style={modal.actions}>
          <button style={modal.cancel} onClick={onClose}>
            Cancelar
          </button>
          <button style={modal.confirm} onClick={handleSubmit}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const modal: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  box: {
    background: "#0b0b0b",
    padding: 24,
    borderRadius: 12,
    width: 320,
    border: "1px solid #f7931a",
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    color: "#f7931a",
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    marginTop: 4,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  cancel: {
    padding: "8px 14px",
    background: "#333",
    borderRadius: 8,
    border: "1px solid #444",
    color: "#fff",
    cursor: "pointer",
  },
  confirm: {
    padding: "8px 14px",
    background: "#f7931a",
    borderRadius: 8,
    border: "none",
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
  },
};
