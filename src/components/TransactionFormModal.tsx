import React, { useState } from "react";

type Props = {
  onClose: () => void;
  onSubmit: (tx: {
    date: string;
    amountBTC: number;
    priceUSD: number;
  }) => void;
  initial?: {
    date: string;
    amountBTC: number;
    priceUSD: number;
  };
};

export const TransactionFormModal: React.FC<Props> = ({
  onClose,
  onSubmit,
  initial,
}) => {
  const [date, setDate] = useState(initial?.date || "");
  const [amountBTC, setAmountBTC] = useState(
    initial?.amountBTC?.toString() || ""
  );
  const [priceUSD, setPriceUSD] = useState(
    initial?.priceUSD?.toString() || ""
  );

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
        <h2 style={{ color: "#fff", marginBottom: 20 }}>
          {initial ? "Editar Transação" : "Adicionar Transação"}
        </h2>

        <label style={{ color: "#aaa" }}>Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />

        <label style={{ color: "#aaa" }}>Quantidade BTC</label>
        <input
          type="number"
          step="0.00000001"
          value={amountBTC}
          onChange={(e) => setAmountBTC(e.target.value)}
          style={inputStyle}
        />

        <label style={{ color: "#aaa" }}>Preço USD</label>
        <input
          type="number"
          value={priceUSD}
          onChange={(e) => setPriceUSD(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 25 }}>
          <button
            onClick={onClose}
            style={cancelBtn}
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onSubmit({
                date,
                amountBTC: Number(amountBTC),
                priceUSD: Number(priceUSD),
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 18,
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
