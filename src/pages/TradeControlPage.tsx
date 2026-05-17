import React, { useState } from "react";
import { useTradeCapital } from "../context/TradeCapitalContext";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useNavigation } from "../context/NavigationContext";

export const TradeControlPage = () => {
  const {
    capital,
    reserve,
    btcAccumulated,
    profitReservePercent,
    months,
    addAporte,
    removeCapital,
    buyBTC,
    setProfitReservePercent,
  } = useTradeCapital();

  const market = useBitcoinData();
  const { navigate } = useNavigation();

  const [aporteValue, setAporteValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [btcBuyValue, setBtcBuyValue] = useState("");

  const btcPrice = market?.priceUSD ?? 0;

  return (
    <div style={styles.container}>

      {/* BOTÃO VOLTAR */}
      <button style={styles.backButton} onClick={() => navigate("trades")}>
        ← Voltar ao Diário de Trades
      </button>

      <h1 style={styles.title}>Gestão de Capital de Trading</h1>

      {/* KPI CARDS */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Banca Atual</h3>
          <p style={styles.value}>{capital.toFixed(2)} USDT</p>
        </div>

        <div style={styles.card}>
          <h3>Reserva de Oportunidade</h3>
          <p style={styles.value}>{reserve.toFixed(2)} USDT</p>
        </div>

        <div style={styles.card}>
          <h3>BTC Acumulado</h3>
          <p style={styles.value}>{btcAccumulated.toFixed(8)} BTC</p>
        </div>

        <div style={styles.card}>
          <h3>% Lucro → Reserva</h3>
          <input
            type="number"
            min="0"
            max="100"
            value={profitReservePercent}
            onChange={(e) => setProfitReservePercent(Number(e.target.value))}
            style={styles.input}
          />
        </div>
      </div>

      {/* APORTES */}
      <div style={styles.section}>
        <h2>Aportes</h2>
        <div style={styles.row}>
          <input
            type="number"
            placeholder="Valor do aporte"
            value={aporteValue}
            onChange={(e) => setAporteValue(e.target.value)}
            style={styles.input}
          />
          <button
            style={styles.button}
            onClick={() => {
              if (!aporteValue) return;
              addAporte(Number(aporteValue));
              setAporteValue("");
            }}
          >
            Adicionar Aporte
          </button>
        </div>
      </div>

      {/* RETIRAR FUNDOS */}
      <div style={styles.section}>
        <h2>Retirar Fundos</h2>
        <div style={styles.row}>
          <input
            type="number"
            placeholder="Valor a retirar"
            value={withdrawValue}
            onChange={(e) => setWithdrawValue(e.target.value)}
            style={styles.input}
          />
          <button
            style={{ ...styles.button, background: "#ff4444", color: "#fff" }}
            onClick={() => {
              if (!withdrawValue) return;
              removeCapital(Number(withdrawValue));
              setWithdrawValue("");
            }}
          >
            Retirar
          </button>
        </div>
      </div>

      {/* COMPRA DE BTC */}
      <div style={styles.section}>
        <h2>Comprar BTC com Reserva</h2>
        <div style={styles.row}>
          <input
            type="number"
            placeholder="USDT para comprar BTC"
            value={btcBuyValue}
            onChange={(e) => setBtcBuyValue(e.target.value)}
            style={styles.input}
          />
          <button
            style={styles.button}
            onClick={() => {
              if (!btcBuyValue || btcPrice === 0) return;
              buyBTC(Number(btcBuyValue), btcPrice);
              setBtcBuyValue("");
            }}
          >
            Comprar BTC
          </button>
        </div>
        <p style={{ color: "#888", marginTop: 6 }}>
          Preço atual BTC: {btcPrice ? btcPrice.toFixed(2) : "—"} USDT
        </p>
      </div>

      {/* TABELA MENSAL COMPLETA */}
      <div style={styles.section}>
        <h2>Resumo Mensal</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Mês</th>
              <th>%</th>
              <th>Alvo %</th>
              <th>Alvo USDT</th>
              <th>PnL USDT</th>
              <th>Banca Inicial</th>
              <th>Banca Final</th>
              <th>Reserva</th>
              <th>BTC</th>
              <th>Taxas</th>
              <th>Aporte</th>
              <th>Saída</th>
              <th>Nº Trades</th>
              <th>Winrate</th>
            </tr>
          </thead>

          <tbody>
            {months.map((m) => (
              <tr key={m.monthIndex}>
                <td>{m.monthName}</td>

                <td style={{ color: m.pnlPercent >= 0 ? "#4caf50" : "#f44336" }}>
                  {m.pnlPercent.toFixed(2)}%
                </td>

                <td>{m.targetPercent.toFixed(2)}%</td>
                <td>{m.targetUSDT.toFixed(2)}</td>

                <td style={{ color: m.pnlUSDT >= 0 ? "#4caf50" : "#f44336" }}>
                  {m.pnlUSDT.toFixed(2)}
                </td>

                <td>{m.bancaInicial.toFixed(2)}</td>
                <td>{m.bancaFinal.toFixed(2)}</td>

                <td>{m.reserve.toFixed(2)}</td>
                <td>{m.btc.toFixed(8)}</td>
                <td>{m.fees.toFixed(2)}</td>

                <td>{m.aporte.toFixed(2)}</td>
                <td>{m.withdraw.toFixed(2)}</td>

                <td>{m.trades}</td>
                <td>{m.winrate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------------------------------------
   STYLES
--------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  backButton: {
    padding: "10px 16px",
    background: "#222",
    border: "1px solid #333",
    borderRadius: 8,
    cursor: "pointer",
    color: "#f7931a",
    fontWeight: "bold",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    marginBottom: 30,
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },

  card: {
    background: "#111",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #222",
  },

  value: {
    fontSize: 22,
    marginTop: 10,
    color: "#f7931a",
    fontWeight: "bold",
  },

  section: {
    marginBottom: 40,
  },

  row: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  input: {
    flex: 1,
    padding: 12,
    background: "#000",
    border: "1px solid #333",
    borderRadius: 10,
    color: "#fff",
  },

  button: {
    padding: "12px 20px",
    background: "#f7931a",
    border: "none",
    borderRadius: 10,
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },
};
