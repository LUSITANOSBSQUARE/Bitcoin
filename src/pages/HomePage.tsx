import { useNavigation } from "../context/NavigationContext";

export const HomePage = () => {
  const { navigate } = useNavigation();

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Bem‑vindo ao BTC Engine</h1>

      <p style={{ color: "#aaa", marginBottom: 30 }}>
        A tua plataforma premium para análise Bitcoin.
      </p>

      <button
        onClick={() => navigate("dashboard")}
        style={{
          padding: "12px 20px",
          background: "#f7931a",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        Ir para Dashboard
      </button>
    </div>
  );
};
