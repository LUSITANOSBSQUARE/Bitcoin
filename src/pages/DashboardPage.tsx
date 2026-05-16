import { useBitcoinData } from "../hooks/useBitcoinData";
import { MetricCard } from "../components/MetricCard";

export const DashboardPage = () => {
  const data = useBitcoinData();

  return (
    <div style={{ padding: 40, color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Dashboard Bitcoin</h1>

      <p style={{ color: "#aaa", marginBottom: 40 }}>
        Dados em tempo real do mercado Bitcoin.
      </p>

      {!data ? (
        <p>Carregando...</p>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <MetricCard label="Preço Atual" value={`$${data.price.toLocaleString()}`} />
          <MetricCard label="Market Cap" value={`$${data.marketCap.toLocaleString()}`} />
          <MetricCard label="Volume 24h" value={`$${data.volume24h.toLocaleString()}`} />
          <MetricCard label="Dominance 24h" value={`${data.dominance.toFixed(2)}%`} />
          <MetricCard label="Supply" value={data.supply.toLocaleString()} />
        </div>
      )}
    </div>
  );
};
