import React from "react";

export const ConfirmDeleteModal = ({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) => {
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
          width: 360,
          background: "#111",
          padding: 30,
          borderRadius: 12,
          border: "1px solid #222",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: 20 }}>Remover Transação</h2>
        <p style={{ color: "#aaa", marginBottom: 25 }}>
          Tens a certeza que queres remover esta transação?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "#222",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "#d9534f",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};
