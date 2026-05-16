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
        background: "rgba(0,0,0,0.6)",
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
        <h2 style={{ color: "#fff", marginBottom: 20 }}>Confirmar remoção</h2>

        <p style={{ color: "#aaa", marginBottom: 30 }}>
          Tens a certeza que queres remover este item?
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
            }}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};
