import React, { useMemo, useState } from "react";
import { useLedger } from "../context/LedgerContext";
import type { LedgerEntry } from "../context/LedgerContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { TransactionFormModal } from "../components/TransactionFormModal";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export const PortfolioPage = () => {
  const { entries, addEntry } = useLedger();
  const { totalBTC, totalInvested, averagePrice } = usePortfolio();
  const market = useBitcoinData();

  const [showModal, setShowModal] = useState(false);

  const currentPrice = market?.priceEUR ?? 0;
  const currentValue = totalBTC * currentPrice;
  const pnl = currentValue - totalInvested;
  const roi = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  /* ---------------- FILTRAR APENAS BUY/SELL ---------------- */
  const tx = useMemo(
    () =>
      entries
        .filter((e) => e.type === "BUY" || e.type === "SELL")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );

  const labels = tx.map((t) => t.date);

  /* ---------------- RECONSTRUIR HISTÓRICO ---------------- */

  const seriesBTC: number[] = [];
  const seriesInvested: number[] = [];
  const seriesAvgPrice: number[] = [];
  const seriesValueNow: number[] = [];
  const seriesPnL: number[] = [];
  const seriesROI: number[] = [];
  const seriesDrawdown: number[] = [];

  let accBTC = 0;
  let accInvested = 0;
  let peakValue = 0;

  tx.forEach((t) => {
    const btc = t.amountBTC ?? 0;
    const eur = t.amountEUR;

    if (t.type === "BUY") {
      accBTC += btc;
      accInvested += eur;
    }

    if (t.type === "SELL") {
      accBTC -= btc;
    }

    const avg = accBTC > 0 ? accInvested / accBTC : 0;
    const valueNow = accBTC * currentPrice;
    const pnlNow = valueNow - accInvested;
    const roiNow = accInvested > 0 ? (pnlNow / accInvested) * 100 : 0;

    peakValue = Math.max(peakValue, valueNow);
    const dd = peakValue > 0 ? ((valueNow - peakValue) / peakValue) * 100 : 0;

    seriesBTC.push(accBTC);
    seriesInvested.push(accInvested);
    seriesAvgPrice.push(avg);
    seriesValueNow.push(valueNow);
    seriesPnL.push(pnlNow);
    seriesROI.push(roiNow);
    seriesDrawdown.push(dd);
  });

  /* ---------------- CHARTS ---------------- */

  const mainChartData = {
    labels,
    datasets: [
      {
        label: "BTC acumulado",
        data: seriesBTC,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Capital Investido (€)",
        data: seriesInvested,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Preço Médio (€)",
        data: seriesAvgPrice,
        borderColor: "#a855f7",
        backgroundColor: "rgba(168,85,247,0.15)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Valor Atual (€)",
        data: seriesValueNow,
        borderColor: "#f7931a",
        backgroundColor: "rgba(247,147,26,0.15)",
        tension: 0.3,
        yAxisID: "y",
      },
    ],
  };

  const mainChartOptions = {
    plugins: {
      legend: { labels: { color: "#fff" } },
    },
    scales: {
      x: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y1: { ticks: { color: "#22c55e" }, grid: { display: false } },
    },
  };

  const riskChartData = {
    labels,
    datasets: [
      {
        label: "P&L não realizado (€)",
        data: seriesPnL,
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.15)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "ROI não realizado (%)",
        data: seriesROI,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Drawdown (%)",
        data: seriesDrawdown,
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244,63,94,0.15)",
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  const riskChartOptions = {
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y1: { ticks: { color: "#f97316" }, grid: { display: false } },
    },
  };

  /* ---------------- INSIGHTS ---------------- */

  const insights = [
    {
      label: "Posição vs preço atual",
      text:
        totalBTC === 0
          ? "Ainda não tens BTC registado no portfolio."
          : currentPrice > averagePrice
          ? "O preço atual está acima do teu custo médio — posição confortável."
          : "O preço atual está abaixo do teu custo médio — acumulação em desconto.",
    },
    {
      label: "Lucro / Prejuízo não realizado",
      text:
        pnl >= 0
          ? `Estás com um lucro não realizado de ${pnl.toFixed(2)} € (${roi.toFixed(2)}%).`
          : `Estás com um prejuízo não realizado de ${pnl.toFixed(2)} € (${roi.toFixed(2)}%).`,
    },
    {
      label: "Exposição",
      text:
        totalBTC > 0
          ? `Tens ${totalBTC.toFixed(8)} BTC acumulados.`
          : "Ainda não tens exposição registada.",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Portfolio</h1>

        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          + Adicionar
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
  <TransactionFormModal
    onClose={() => setShowModal(false)}
    onSubmit={async (tx) => {
      await addEntry({
        id: crypto.randomUUID(),
        type: tx.type,
        date: tx.date, // já vem YYYY-MM-DD
        amountBTC: tx.amountBTC,
        amountEUR: tx.amountEUR,
        priceEUR: tx.priceEUR,
        meta: {
          source: "manual",
        },
      });

      setShowModal(false);
    }}
  />
)}


      <div style={styles.cardGrid}>
        <Card label="Total BTC" value={`${totalBTC.toFixed(8)} BTC`} />
        <Card label="Total Investido" value={`${totalInvested.toFixed(2)} €`} />
        <Card label="Preço Médio" value={`${averagePrice.toFixed(2)} €`} />
        <Card label="Valor Atual" value={`${currentValue.toFixed(2)} €`} />
        <Card
          label="P&L Não Realizado"
          value={`${pnl.toFixed(2)} €`}
          color={pnl >= 0 ? "#22c55e" : "#f43f5e"}
        />
        <Card
          label="ROI Não Realizado"
          value={`${roi.toFixed(2)} %`}
          color={roi >= 0 ? "#22c55e" : "#f43f5e"}
        />
      </div>

      {tx.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>Evolução do Portfolio</h2>
          <div style={styles.chartCard}>
            <Line data={mainChartData} options={mainChartOptions as any} />
          </div>

          <h2 style={styles.sectionTitle}>Risco, P&L e Drawdown</h2>
          <div style={styles.chartCard}>
            <Line data={riskChartData} options={riskChartOptions as any} />
          </div>
        </>
      )}

      <h2 style={styles.sectionTitle}>Insights</h2>
      <div style={styles.insightsGrid}>
        {insights.map((i) => (
          <div key={i.label} style={styles.insightCard}>
            <h3 style={styles.insightTitle}>{i.label}</h3>
            <p style={styles.insightText}>{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- COMPONENTE CARD ---------------- */

const Card = ({
  label,
  value,
  color = "#f7931a",
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div style={styles.card}>
    <p style={styles.cardLabel}>{label}</p>
    <h2 style={{ ...styles.cardValue, color }}>{value}</h2>
  </div>
);

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    padding: 32,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 600,
  },

  addButton: {
    padding: "10px 18px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    color: "#000",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },

  card: {
    background: "#0b0b0b",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #1f1f1f",
  },

  cardLabel: {
    color: "#aaa",
    marginBottom: 6,
  },

  cardValue: {
    fontSize: 26,
    fontWeight: 600,
  },

  sectionTitle: {
    marginTop: 40,
    fontSize: 22,
    fontWeight: 600,
    color: "#f7931a",
  },

  chartCard: {
    marginTop: 18,
    background: "#050505",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #151515",
  },

  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    marginTop: 20,
  },

  insightCard: {
    background: "#050505",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #151515",
  },

  insightTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#f7931a",
  },

  insightText: {
    color: "#ccc",
    lineHeight: 1.6,
  },
};
