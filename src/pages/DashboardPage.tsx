import { useState, useEffect } from "react";
import { useNavigation } from "../context/NavigationContext";

export const DashboardPage = () => {
  const { navigate } = useNavigation();
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
        const data = await res.json();
        setPrice(data.bpi.USD.rate_float);
      } catch (err) {
        console.error("Erro ao buscar preço:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: 40,
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <button
        onClick={() => navigate("home")}
        style={{
          marginBottom: 20,
          padding: "10px 16px",
          background: "#222",
          border: "1px solid #333",
          borderRadius: 8,
          cursor: "pointer",
          color: "#fff",
        }}
      >
        Voltar à Home
      </button>

      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Dashboard Bitcoin</h1>

      <p style={{ color: "#aaa", marginBottom: 40 }}>
        Dados em tempo real do mercado Bitcoin.
      </p>

      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          width: "fit-content",
          border: "1px solid #222",
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 10 }}>Preço Atual</h2>

        <p style={{ fontSize: 40, fontWeight: "bold", color: "#f7931a" }}>
          {price ? `$${price.toLocaleString()}` : "Carregando..."}
        </p>
      </div>
    </div>
  );
};
