import React, { useMemo, useState } from "react";
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
    currentYear,
    addAporte,
    removeCapital,
    buyBTC,
    setProfitReservePercent,
    updateMonth,
  } = useTradeCapital();

  const market = useBitcoinData();
  const { navigate } = useNavigation();

  const [aporteValue, setAporteValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [btcBuyValue, setBtcBuyValue] = useState("");
  const [editingMonthIndex, setEditingMonthIndex] = useState<number | null>(
    null
  );

  const btcPrice = market?.priceUSD ?? 0;

  const editingMonth = useMemo(
    () =>
      editingMonthIndex !== null
        ? months.find((m) => m.monthIndex === editingMonthIndex) ?? null
        : null,
    [editingMonthIndex, months]
  );

  const yearNumber = currentYear?.year ?? new Date().getFullYear();

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
        <h2>Resumo Mensal {`(${yearNumber})`}</h2>

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
              <th></th>
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

                <td>
                  <button
                    style={styles.smallButton}
                    onClick={() => setEditingMonthIndex(m.monthIndex)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAINEL DE EDIÇÃO AVANÇADA (C) */}
      {editingMonth && (
        <MonthDetailEditor
          year={yearNumber}
          month={editingMonth}
          onClose={() => setEditingMonthIndex(null)}
          onSave={(patch, msg) => {
            updateMonth(yearNumber, editingMonth.monthIndex, patch, msg);
          }}
        />
      )}
    </div>
  );
};

/* ---------------------------------------------
   EDITOR AVANÇADO DO MÊS
--------------------------------------------- */

import type { TradeCapitalMonth } from "../context/TradeCapitalContext";

type MonthDetailEditorProps = {
  year: number;
  month: TradeCapitalMonth;
  onClose: () => void;
  onSave: (patch: Partial<TradeCapitalMonth>, auditMessage?: string) => void;
};


const MonthDetailEditor: React.FC<MonthDetailEditorProps> = ({
  year,
  month,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    bancaInicial: month.bancaInicial,
    bancaFinal: month.bancaFinal,
    pnlUSDT: month.pnlUSDT,
    targetPercent: month.targetPercent,
    aporte: month.aporte,
    withdraw: month.withdraw,
    fees: month.fees,
    trades: month.trades,
    winrate: month.winrate,
    reserve: month.reserve,
    btc: month.btc,
    notes: month.notes ?? "",
    auditMessage: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({
      ...f,
      [field]:
        field === "notes" || field === "auditMessage"
          ? value
          : Number(value),
    }));
  };

  const handleSave = () => {
    const {
      bancaInicial,
      bancaFinal,
      pnlUSDT,
      targetPercent,
      aporte,
      withdraw,
      fees,
      trades,
      winrate,
      reserve,
      btc,
      notes,
      auditMessage,
    } = form;

    onSave(
      {
        bancaInicial,
        bancaFinal,
        pnlUSDT,
        targetPercent,
        aporte,
        withdraw,
        fees,
        trades,
        winrate,
        reserve,
        btc,
        notes,
      },
      auditMessage || `Edição manual do mês ${month.monthName}/${year}`
    );
    onClose();
  };

  return (
    <div style={styles.editorOverlay}>
      <div style={styles.editorPanel}>
        <div style={styles.editorHeader}>
          <h2>
            Editar {month.monthName} / {year}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.editorGrid}>
          <label style={styles.editorField}>
            <span>Banca Inicial</span>
            <input
              type="number"
              value={form.bancaInicial}
              onChange={(e) => handleChange("bancaInicial", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Banca Final</span>
            <input
              type="number"
              value={form.bancaFinal}
              onChange={(e) => handleChange("bancaFinal", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>PnL USDT</span>
            <input
              type="number"
              value={form.pnlUSDT}
              onChange={(e) => handleChange("pnlUSDT", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Alvo %</span>
            <input
              type="number"
              value={form.targetPercent}
              onChange={(e) => handleChange("targetPercent", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Aporte</span>
            <input
              type="number"
              value={form.aporte}
              onChange={(e) => handleChange("aporte", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Saída</span>
            <input
              type="number"
              value={form.withdraw}
              onChange={(e) => handleChange("withdraw", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Taxas</span>
            <input
              type="number"
              value={form.fees}
              onChange={(e) => handleChange("fees", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Nº Trades</span>
            <input
              type="number"
              value={form.trades}
              onChange={(e) => handleChange("trades", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Winrate %</span>
            <input
              type="number"
              value={form.winrate}
              onChange={(e) => handleChange("winrate", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>Reserva</span>
            <input
              type="number"
              value={form.reserve}
              onChange={(e) => handleChange("reserve", e.target.value)}
            />
          </label>

          <label style={styles.editorField}>
            <span>BTC</span>
            <input
              type="number"
              value={form.btc}
              onChange={(e) => handleChange("btc", e.target.value)}
            />
          </label>
        </div>

        <div style={styles.editorNotes}>
          <label>
            <span>Notas do mês</span>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </label>

          <label>
            <span>Mensagem de auditoria</span>
            <input
              type="text"
              value={form.auditMessage}
              onChange={(e) => handleChange("auditMessage", e.target.value)}
              placeholder="Ex: Corrigido PnL após erro de lançamento"
            />
          </label>
        </div>

        <div style={styles.editorFooter}>
          <button style={styles.buttonSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button style={styles.buttonPrimary} onClick={handleSave}>
            Guardar Alterações
          </button>
        </div>

        {month.auditLog && month.auditLog.length > 0 && (
          <div style={styles.auditBox}>
            <h3>Histórico de alterações</h3>
            <ul>
              {month.auditLog.map((log) => (
                <li key={log.id}>
                  <strong>{new Date(log.date).toLocaleString("pt-PT")}</strong>{" "}
                  — {log.message}
                </li>
              ))}
            </ul>
          </div>
        )}
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
  smallButton: {
    padding: "6px 10px",
    background: "#333",
    border: "1px solid #555",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },

  /* EDITOR */

  editorOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  editorPanel: {
    width: "90%",
    maxWidth: 900,
    maxHeight: "90vh",
    background: "#050505",
    borderRadius: 16,
    border: "1px solid #333",
    padding: 20,
    overflow: "auto",
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: 20,
    cursor: "pointer",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  editorField: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14,
  },
  editorNotes: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  editorFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 20,
  },
  buttonSecondary: {
    padding: "10px 18px",
    background: "#222",
    border: "1px solid #444",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
  buttonPrimary: {
    padding: "10px 18px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  auditBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #333",
    fontSize: 13,
    color: "#aaa",
  },
};
