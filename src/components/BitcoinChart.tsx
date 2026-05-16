import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export const BitcoinChart = ({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
}) => {
  return (
    <div
      style={{
        background: "#111",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #222",
        marginTop: 40,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: 20 }}>Preço — Últimos 7 dias</h2>

      {/* ⭐ ALTURA FIXA AQUI */}
      <div style={{ width: "100%", height: 350 }}>
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "BTC/USD",
                data,
                borderColor: "#f7931a",
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false, // ⭐ ESSENCIAL
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: "#aaa" } },
              y: { ticks: { color: "#aaa" } },
            },
          }}
        />
      </div>
    </div>
  );
};
