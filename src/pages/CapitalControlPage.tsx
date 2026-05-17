import React, { useState } from "react";
import { useCapital } from "../context/CapitalContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";
import { useCapitalEngine } from "../engine/useCapitalEngine";
import { useCapitalPortfolioSync } from "../hooks/useCapitalPortfolioSync";
import { FundMovementModal } from "../components/FundMovementModal";

export const CapitalControlPage = () => {
  useCapitalPortfolioSync();

  const {
    totalDeposited,
    availableFunds,
    usedFunds,
    deposits,
    withdrawals,
    registerDeposit,
    registerWithdrawal,
  } = useCapital();

  const portfolio = usePortfolio();
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();

  const marketIntelRaw = useMarketIntelligence(
    market,
    onchain,
    fearGreed,
    dominance
  );

  const btcPrice = market?.priceEUR ?? 0;
  const totalBTC = portfolio.totalBTC ?? 0;
  const currentValue = totalBTC * btcPrice;

  const totalInvested = portfolio.totalInvested ?? 0;
  const pnl = currentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const realizedProfit = portfolio.realizedProfit ?? 0;

  const marketIntel = {
    riskScore: marketIntelRaw?.riskScore ?? 50,
    opportunityScore: marketIntelRaw?.opportunityScore ?? 50,
    marketState: marketIntelRaw?.marketState ?? "neutro",
    recommendation: marketIntelRaw?.recommendation ?? "neutral",
  };

  const capitalIntel = useCapitalEngine(
    {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
      unrealizedProfit: pnl,
    },
    marketIntel
  );

  const [modalType, setModalType] = useState<"deposit" | "withdraw" | null>(null);
  const [fundMenuOpen, setFundMenuOpen] = useState(false);

  return (
    <div style={styles.page}>
      {/* BOTÃO FUNDO NO TOPO */}
      <div style={styles.topBar}>
        <div style={{ position: "relative" }}>
          <button
            style={styles.walletButton}
            onClick={() => setFundMenuOpen((v) => !v)}
          >
            Fundos
          </button>

          {fundMenuOpen && (
            <div style={styles.fundMenu}>
              <div
                style={styles.fundMenuItem}
                onClick={() => {
                  setModalType("deposit");
                  setFundMenuOpen(false);
                }}
              >
                ➕ Entrada de Fundos
              </div>

              <div
                style={styles.fundMenuItem}
                onClick={() => {
                  setModalType("withdraw");
                  setFundMenuOpen(false);
                }}
              >
                ➖ Saída de Fundos
              </div>
            </div>
          )}
        </div>
      </div>

      <h1 style={styles.title}>Centro de Controlo do Capital</h1>

      {/* GRID PRINCIPAL */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Resumo do Capital</div>

          <div style={styles.row}>
            <span>Disponível</span>
            <span style={styles.value}>{availableFunds.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Investido (Capital)</span>
            <span style={styles.value}>{usedFunds.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Total Investido (Portfolio)</span>
            <span style={styles.value}>{totalInvested.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Total BTC</span>
            <span style={styles.value}>{totalBTC.toFixed(6)} BTC</span>
          </div>

          <div style={styles.row}>
            <span>Valor Atual</span>
            <span style={styles.value}>{currentValue.toFixed(2)} €</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Performance</div>

          <div style={styles.row}>
            <span>PnL</span>
            <span
              style={{
                ...styles.value,
                color: pnl >= 0 ? "#22c55e" : "#f43f5e",
              }}
            >
              {pnl.toFixed(2)} €
            </span>
          </div>

          <div style={styles.row}>
            <span>PnL %</span>
            <span
              style={{
                ...styles.value,
                color: pnlPercent >= 0 ? "#22c55e" : "#f43f5e",
              }}
            >
              {pnlPercent.toFixed(2)}%
            </span>
          </div>

          <div style={styles.row}>
            <span>Lucro Realizado</span>
            <span style={styles.value}>{realizedProfit.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ANALISTA */}
      <div style={styles.card}>
        <div style={styles.label}>Analista Inteligente</div>

        <div style={styles.row}>
          <span>Ação</span>
          <span style={{ ...styles.value, color: "#f7931a" }}>
            {capitalIntel.action}
          </span>
        </div>

        <div style={styles.row}>
          <span>Intensidade</span>
          <span style={styles.value}>{capitalIntel.intensity}</span>
        </div>

        <div style={styles.row}>
          <span>Exposição Atual</span>
          <span style={styles.value}>
            {capitalIntel.exposureCurrent.toFixed(1)}%
          </span>
        </div>

        <div style={styles.row}>
          <span>Exposição Ideal</span>
          <span style={styles.value}>
            {capitalIntel.exposureIdeal.toFixed(1)}%
          </span>
        </div>

        {capitalIntel.suggestedBuy > 0 && (
          <div style={styles.row}>
            <span>Comprar</span>
            <span style={styles.value}>
              {capitalIntel.suggestedBuy.toFixed(2)} €
            </span>
          </div>
        )}

        {capitalIntel.suggestedSell > 0 && (
          <div style={styles.row}>
            <span>Vender</span>
            <span style={styles.value}>
              {capitalIntel.suggestedSell.toFixed(2)} €
            </span>
          </div>
        )}

        <div style={styles.subLabel}>Resumo</div>
        <div style={styles.summary}>{capitalIntel.narrative}</div>
      </div>

      <div style={styles.separator} />

      {/* ALERTAS */}
      <div style={styles.card}>
        <div style={styles.label}>Alertas</div>

        {capitalIntel.alerts.length === 0 && (
          <div style={styles.empty}>Sem alertas.</div>
        )}

        {capitalIntel.alerts.map((a, i) => (
          <div key={i} style={styles.alert}>
            {a}
          </div>
        ))}
      </div>

      <div style={styles.separator} />

      {/* LISTA DE MOVIMENTOS */}
      <h2 style={styles.sectionTitle}>Movimentos de Fundos</h2>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Entradas</div>

          {deposits.length === 0 && (
            <div style={styles.empty}>Sem entradas registadas</div>
          )}

          {deposits.map((d, i) => (
            <div key={i} style={styles.rowSmall}>
              <span>{new Date(d.date).toLocaleDateString()}</span>
              <span style={styles.value}>{d.amount.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Saídas</div>

          {withdrawals.length === 0 && (
            <div style={styles.empty}>Sem saídas registadas</div>
          )}

          {withdrawals.map((w, i) => (
            <div key={i} style={styles.rowSmall}>
              <span>{new Date(w.date).toLocaleDateString()}</span>
              <span style={styles.value}>{w.amount.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalType && (
        <FundMovementModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={(amount, date) => {
            if (modalType === "deposit") {
              registerDeposit(amount, date);
            } else {
              registerWithdrawal(amount, date);

              // SAÍDA DE FUNDOS = LUCRO REALIZADO
              portfolio.realizedProfit += amount;
            }
          }}
        />
      )}
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 1100,
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  walletButton: {
    padding: "10px 16px",
    background: "#000",
    border: "1px solid #f7931a",
    borderRadius: 8,
    color: "#f7931a",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
  },
  fundMenu: {
    position: "absolute",
    top: "110%",
    right: 0,
    background: "#000",
    border: "1px solid #f7931a",
    borderRadius: 8,
    padding: 6,
    width: 180,
    zIndex: 10,
  },
  fundMenuItem: {
    padding: "10px 12px",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 6,
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 600,
    color: "#f7931a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    color: "#f7931a",
    marginBottom: 12,
    fontWeight: 600,
  },
  subLabel: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 15,
  },
  rowSmall: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 14,
    opacity: 0.85,
  },
  value: {
    fontWeight: 600,
  },
  empty: {
    fontSize: 13,
    color: "#666",
  },
  separator: {
    borderTop: "1px solid #f7931a33",
    margin: "24px 0",
  },
  summary: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 1.5,
  },
  alert: {
    background: "#1a1205",
    border: "1px solid #f7931a55",
    padding: "8px 12px",
    borderRadius: 8,
    marginBottom: 6,
    fontSize: 14,
  },
};
                          