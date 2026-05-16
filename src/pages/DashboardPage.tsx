import { useBitcoinData } from "../hooks/useBitcoinData";
import { useBitcoinHistory } from "../hooks/useBitcoinHistory";
import { MetricCard } from "../components/MetricCard";
import { BitcoinChart } from "../components/BitcoinChart";

export const DashboardPage = () => {
  const data = useBitcoinData();
  const { history, timestamps } = useBitcoinHistory();

  return (
    <>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Dashboard Bitcoin</h1>

      <p style={{ color: "#aaa", marginBottom: 40 }}>
        Dados em tempo real do mercado Bitcoin.
      </p>

      {!data ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <MetricCard label="Preço Atual" value={`$${data.price.toLocaleString()}`} />
            <MetricCard label="Market Cap" value={`$${data.marketCap.toLocaleString()}`} />
            <MetricCard label="Volume 24h" value={`$${data.volume24h.toLocaleString()}`} />
            <MetricCard label="Dominance 24h" value={`${data.dominance.toFixed(2)}%`} />
            <MetricCard label="Supply" value={data.supply.toLocaleString()} />
          </div>

          <BitcoinChart labels={timestamps} data={history} />
        </>
      )}
    </>
  );
};
