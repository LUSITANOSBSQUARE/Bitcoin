import { useBitcoinData } from "../hooks/useBitcoinData";
import { TradingViewChart } from "../components/TradingViewChart";
import { MetricCard } from "../components/MetricCard";
import React, { useEffect, useState } from "react";

/* ---------------- FEAR & GREED HOOK ---------------- */

const useFearGreed = () => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchFG = async () => {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const json = await res.json();
        setValue(Number(json.data[0].value));
      } catch (e) {
        console.error("Erro Fear & Greed:", e);
      }
    };

    fetchFG();
  }, []);

  return value;
};

/* ---------------- DOMINÂNCIA CORRETA ---------------- */

const useBTCDominance = () => {
  const [dom, setDom] = useState<number | null>(null);

  useEffect(() => {
    const fetchDom = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const json = await res.json();
        setDom(json.data.market_cap_percentage.btc);
      } catch (e) {
        console.error("Erro dominância:", e);
      }
    };

    fetchDom();
  }, []);

  return dom;
};

/* ---------------- DASHBOARD PAGE ---------------- */

export const DashboardPage = () => {
  const data = useBitcoinData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();

  useEffect(() => {
    document.body.style.background =
      "radial-gradient(circle at top, #181818 0%, #0a0a0a 45%, #000 100%)";

    return () => {
      document.body.style.background = "#000";
    };
  }, []);

  if (!data) {
    return <div style={styles.loading}>Carregando dados...</div>;
  }

  /* CORES PROFISSIONAIS */
  const green = "rgba(0, 200, 140, 0.95)";
  const red = "rgba(255, 80, 80, 0.95)";
  const blue = "rgba(80, 150, 255, 0.95)";
  const orange = "rgba(247,147,26,0.95)";

  const pctColor = (v: number) => (v >= 0 ? green : red);
  const formatPct = (v: number) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

  const altIndex = dominance != null ? 100 - dominance : null;

  const altColor =
    altIndex == null
      ? "rgba(255,255,255,0.2)"
      : altIndex > 60
      ? green
      : altIndex < 40
      ? blue
      : orange;

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.grid} />
      <div style={styles.noise} />

      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <p style={styles.eyebrow}>BTC ENGINE</p>
          <h1 style={styles.title}>Dashboard</h1>
        </header>

        {/* TOP GRID */}
        <section style={styles.topGrid}>
          {/* PREÇO */}
          <Card highlight>
            <p style={styles.labelStrong}>Preço atual</p>
            <h2 style={styles.price}>€{data.priceEUR.toLocaleString()}</h2>

            <span
              style={{
                ...styles.pillBig,
                borderColor: pctColor(data.change24h),
                color: pctColor(data.change24h),
              }}
            >
              {formatPct(data.change24h)}
            </span>
          </Card>

          {/* VARIAÇÃO */}
          <Card highlight>
            <p style={styles.labelStrong}>Variação</p>
            <div style={styles.variationColumn}>
              <VariationRow label="1h" value={data.change1h} color={pctColor(data.change1h)} />
              <VariationRow label="24h" value={data.change24h} color={pctColor(data.change24h)} />
              <VariationRow label="7d" value={data.change7d} color={pctColor(data.change7d)} />
            </div>
          </Card>

          {/* FEAR & GREED */}
          <Card highlight>
            <p style={styles.labelStrong}>Fear & Greed</p>
            <h2 style={styles.priceSmall}>
              {fearGreed !== null ? fearGreed : "--"}
            </h2>

            <div style={styles.fgBar}>
              <div
                style={{
                  ...styles.fgFill,
                  width: fearGreed ? `${fearGreed}%` : "0%",
                  background: fearGreed && fearGreed > 50 ? green : red,
                }}
              />
            </div>
          </Card>

          {/* ALTCOIN INDEX COM BARRA COLORIDA */}
          <Card highlight>
            <p style={styles.labelStrong}>Altcoin Index</p>

            <div style={styles.altBar}>
              <div
                style={{
                  ...styles.altFill,
                  width: altIndex ? `${altIndex}%` : "0%",
                  background: altColor,
                }}
              />
            </div>

            <p style={styles.muted}>
              {altIndex !== null
                ? altIndex > 60
                  ? "Altcoin Season"
                  : altIndex < 40
                  ? "Bitcoin Season"
                  : "Neutral"
                : ""}
            </p>
          </Card>
        </section>

        <Divider />

        {/* METRICS */}
        <section style={styles.metrics}>
          <MetricCard label="Market Cap" value={`€${data.marketCap.toLocaleString()}`} />
          <MetricCard label="Volume 24h" value={`€${data.volume24h.toLocaleString()}`} />
          <MetricCard label="Dominância BTC" value={dominance ? `${dominance.toFixed(2)}%` : "--"} />
        </section>

        <Divider />

        {/* CHART */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.labelStrong}>Gráfico</span>
            <span style={styles.muted}>BTC / EUR · TradingView</span>
          </div>
          <TradingViewChart />
        </section>
      </div>
    </div>
  );
};

/* ---------------- VARIATION ROW ---------------- */

const VariationRow = ({ label, value, color }: any) => (
  <div style={styles.variationRow}>
    <span style={styles.variationLabel}>{label}</span>
    <span style={{ ...styles.variationValue, color }}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  </div>
);

/* ---------------- UI PRIMITIVES ---------------- */

const Card = ({ children, highlight = false }: any) => (
  <div
    style={{
      ...styles.card,
      border: highlight
        ? "1px solid rgba(247,147,26,0.35)"
        : "1px solid rgba(255,255,255,0.06)",
    }}
  >
    {children}
  </div>
);

const Divider = () => <div style={styles.divider} />;

/* ---------------- STYLES ---------------- */

const baseCard: React.CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(18px)",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "50px 26px",
    position: "relative",
    zIndex: 5,
  },

  loading: {
    padding: 40,
    color: "#fff",
  },

  header: {
    marginBottom: 30,
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#f7931a",
    fontWeight: 600,
  },

  title: {
    fontSize: 32,
    margin: 0,
    fontWeight: 600,
  },

  labelStrong: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 10,
  },

  muted: {
    fontSize: 12,
    opacity: 0.4,
  },

  price: {
    fontSize: 42,
    fontWeight: 700,
    margin: 0,
    color: "#fff",
  },

  priceSmall: {
    fontSize: 34,
    fontWeight: 700,
    margin: 0,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
  },

  variationColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  variationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  variationLabel: {
    opacity: 0.75,
    fontSize: 15,
  },

  variationValue: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.3,
  },

  card: {
    ...baseCard,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  pillBig: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 15,
    marginTop: 12,
    fontWeight: 600,
  },

  fgBar: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },

  fgFill: {
    height: "100%",
    borderRadius: 8,
    transition: "width 0.4s ease",
  },

  altBar: {
    width: "100%",
    height: 10,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },

  altFill: {
    height: "100%",
    borderRadius: 8,
    transition: "width 0.4s ease",
  },

  divider: {
    height: 1,
    margin: "32px 0",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
  },

  glow: {
    position: "fixed",
    top: -260,
    left: "50%",
    transform: "translateX(-50%)",
    width: 900,
    height: 900,
    borderRadius: "50%",
    background: "rgba(247,147,26,0.08)",
    filter: "blur(140px)",
  },

  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },

  noise: {
    position: "fixed",
    inset: 0,
    opacity: 0.15,
    background:
      "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "4px 4px",
  },
};
