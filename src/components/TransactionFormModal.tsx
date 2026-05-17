import React, { useState, useMemo } from "react";

type Props = {
  onClose: () => void;
  onSubmit: (tx: {
    date: string;
    amountBTC: number;
    totalEUR: number;
    priceEUR: number;
  }) => void;
  initial?: {
    date: string;
    amountBTC: number;
    totalEUR: number;
    priceEUR: number;
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
  const [totalEUR, setTotalEUR] = useState(
    initial?.totalEUR?.toString() || ""
  );

  // 🔥 Preço calculado automaticamente
  const priceEUR = useMemo(() => {
    const btc = Number(amountBTC);
    const eur = Number(totalEUR);
    if (!btc || !eur) return 0;
    return eur / btc;
  }, [amountBTC, totalEUR]);

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

        {/* DATA */}
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

        {/* TOTAL EUR */}
        <label style={labelStyle}>Valor total pago (€)</label>
        <input
          type="number"
          value={totalEUR}
          onChange={(e) => setTotalEUR(e.target.value)}
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
                date,
                amountBTC: Number(amountBTC),
                totalEUR: Number(totalEUR),
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
