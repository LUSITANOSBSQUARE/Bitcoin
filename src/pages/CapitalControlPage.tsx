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

export const CapitalControlPage: React.FC = () => {
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
  const athEUR = (market as any)?.athEUR ?? null;
  const halvingCycle = (market as any)?.halvingCycle ?? null;

  const totalBTC = portfolio.totalBTC ?? 0;
  const currentValue = totalBTC * btcPrice;
  const totalInvested = portfolio.totalInvested ?? 0;

  const pnl = currentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const realizedProfit = portfolio.realizedProfit ?? 0;

  const marketIntel = {
    macroScore: marketIntelRaw?.macroScore ?? 0,
    technicalScore: marketIntelRaw?.technicalScore ?? 0,
    onChainScore: marketIntelRaw?.onChainScore ?? 0,
    liquidityScore: marketIntelRaw?.liquidityScore ?? 0,
    riskScore: marketIntelRaw?.riskScore ?? 50,
    opportunityScore: marketIntelRaw?.opportunityScore ?? 50,
    marketState: marketIntelRaw?.marketState ?? "Neutro",
    alerts: marketIntelRaw?.alerts ?? [],
    narrative: marketIntelRaw?.narrative ?? "",
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

  // ATH / regime
  let athContext = "Sem dados de ATH disponíveis.";
  let athDistancePct: number | null = null;
  let regimeLabel = "Regime neutro";

  if (athEUR && athEUR > 0 && btcPrice > 0) {
    athDistancePct = ((btcPrice - athEUR) / athEUR) * 100;
    const abs = Math.abs(athDistancePct);

    if (athDistancePct <= -60) {
      athContext = `Preço cerca de ${abs.toFixed(
        1
      )}% abaixo do ATH — fase de desconto profundo, acumulação agressiva faz sentido se a liquidez estiver confortável.`;
      regimeLabel = "Acumulação agressiva";
    } else if (athDistancePct <= -30) {
      athContext = `Preço ${abs.toFixed(
        1
      )}% abaixo do ATH — boa fase de acumulação consistente e disciplinada.`;
      regimeLabel = "Acumulação forte";
    } else if (athDistancePct < 0) {
      athContext = `Preço ${abs.toFixed(
        1
      )}% abaixo do ATH — acumulação moderada, sem euforia.`;
      regimeLabel = "Acumulação moderada";
    } else if (athDistancePct >= 0 && athDistancePct <= 10) {
      athContext =
        "Estamos muito perto ou ligeiramente acima do ATH — zona clássica para realização parcial e gestão de risco.";
      regimeLabel = "Realização parcial";
    } else {
      athContext = `Preço ${athDistancePct.toFixed(
        1
      )}% acima do ATH — fase de euforia, foco em proteção de capital e realização faseada.`;
      regimeLabel = "Euforia / proteção";
    }
  }

  // Ciclo / halving
  let cycleContext = "Sem dados de ciclo de halving disponíveis.";
  if (halvingCycle && typeof halvingCycle === "object") {
    const phase = halvingCycle.phase ?? "desconhecida";
    const daysToHalving = halvingCycle.daysToHalving ?? null;
    const daysFromHalving = halvingCycle.daysFromHalving ?? null;

    if (daysToHalving != null && daysToHalving > 0) {
      cycleContext = `Estamos a ${daysToHalving} dias do próximo halving — historicamente fase de acumulação estratégica. Fase atual: ${phase}.`;
    } else if (daysFromHalving != null && daysFromHalving >= 0) {
      cycleContext = `Estamos a ${daysFromHalving} dias após o halving — historicamente fase de construção de tendência. Fase atual: ${phase}.`;
    } else {
      cycleContext = `Fase de ciclo: ${phase}.`;
    }
  }

  // Runway / DCA
  const baseDailyDCA = 1;
  const runwayDays =
    availableFunds > 0 ? Math.floor(availableFunds / baseDailyDCA) : 0;

  let dcaIntensityLabel = "Normal";
  let dcaMultiplier = 1;

  if (
    marketIntel.opportunityScore > 75 &&
    athDistancePct != null &&
    athDistancePct < -30
  ) {
    dcaIntensityLabel = "Reforçar";
    dcaMultiplier = 2;
  } else if (
    marketIntel.riskScore > 75 &&
    athDistancePct != null &&
    athDistancePct > 0
  ) {
    dcaIntensityLabel = "Reduzir";
    dcaMultiplier = 0.5;
  } else if (marketIntel.riskScore > 80) {
    dcaIntensityLabel = "Defensivo";
    dcaMultiplier = 0.5;
  } else if (marketIntel.opportunityScore < 40 && marketIntel.riskScore < 40) {
    dcaIntensityLabel = "Manter";
    dcaMultiplier = 1;
  }

  const effectiveDailyDCA = baseDailyDCA * dcaMultiplier;

  // Header conversacional
  const exposureCurrent = capitalIntel.exposureCurrent ?? 0;
  const exposureIdeal = capitalIntel.exposureIdeal ?? 0;

  const headerLine1 = `Olá BSquare. O mercado está em regime de ${regimeLabel.toLowerCase()}.`;
  const headerLine2 = `Exposição atual: ${exposureCurrent.toFixed(
    1
  )}% · Exposição ideal: ${exposureIdeal.toFixed(1)}% · Runway: ${
    runwayDays > 0 ? `${runwayDays} dias` : "sem runway"
  }.`;
  const headerLine3 = `Recomendação atual do assistente: ${capitalIntel.action} (${capitalIntel.intensity}).`;

  const [modalType, setModalType] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [fundMenuOpen, setFundMenuOpen] = useState(false);

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
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

      {/* ASSISTENTE CONVERSACIONAL */}
      <div style={styles.assistantCard}>
        <div style={styles.assistantTitle}>Assistente Financeiro Pessoal</div>
        <div style={styles.assistantLine}>{headerLine1}</div>
        <div style={styles.assistantLine}>{headerLine2}</div>
        <div style={styles.assistantLineHighlight}>{headerLine3}</div>
      </div>

      {/* RESUMO RÁPIDO */}
      <div style={styles.quickGrid}>
        <div style={styles.quickCard}>
          <div style={styles.quickLabel}>Exposição Atual</div>
          <div style={styles.quickValue}>
            {exposureCurrent.toFixed(1)}%
          </div>
        </div>
        <div style={styles.quickCard}>
          <div style={styles.quickLabel}>Exposição Ideal</div>
          <div style={styles.quickValue}>
            {exposureIdeal.toFixed(1)}%
          </div>
        </div>
        <div style={styles.quickCard}>
          <div style={styles.quickLabel}>Runway DCA</div>
          <div style={styles.quickValue}>
            {runwayDays > 0 ? `${runwayDays} dias` : "Sem runway"}
          </div>
        </div>
        <div style={styles.quickCard}>
          <div style={styles.quickLabel}>Regime</div>
          <div style={styles.quickValue}>{regimeLabel}</div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* NARRATIVA E RECOMENDAÇÃO */}
      <h2 style={styles.sectionTitle}>Leitura do Assistente</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Narrativa Estratégica</div>
          <div style={styles.subLabel}>ATH & Ciclo</div>
          <div style={styles.summary}>{athContext}</div>
          <div style={styles.summary}>{cycleContext}</div>

          <div style={styles.subLabel}>Narrativa de Mercado</div>
          <div style={styles.summary}>{marketIntel.narrative}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Recomendação Atual</div>

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
            <span>Modo DCA</span>
            <span style={styles.value}>{dcaIntensityLabel}</span>
          </div>

          <div style={styles.row}>
            <span>DCA base</span>
            <span style={styles.value}>1 € / dia</span>
          </div>

          <div style={styles.row}>
            <span>DCA sugerido</span>
            <span style={styles.value}>
              {effectiveDailyDCA.toFixed(2)} € / dia
            </span>
          </div>

          {capitalIntel.suggestedBuy > 0 && (
            <div style={styles.row}>
              <span>Compra sugerida</span>
              <span style={styles.value}>
                {capitalIntel.suggestedBuy.toFixed(2)} €
              </span>
            </div>
          )}

          {capitalIntel.suggestedSell > 0 && (
            <div style={styles.row}>
              <span>Venda sugerida</span>
              <span style={styles.value}>
                {capitalIntel.suggestedSell.toFixed(2)} €
              </span>
            </div>
          )}

          <div style={styles.subLabel}>Resumo do Assistente</div>
          <div style={styles.summary}>{capitalIntel.narrative}</div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ESTADO DO CAPITAL */}
      <h2 style={styles.sectionTitle}>Estado do Capital</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Liquidez</div>

          <div style={styles.row}>
            <span>Disponível</span>
            <span style={styles.value}>{availableFunds.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Usado</span>
            <span style={styles.value}>{usedFunds.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Total Depositado</span>
            <span style={styles.value}>{totalDeposited.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>Runway DCA base</span>
            <span style={styles.value}>
              {runwayDays > 0 ? `${runwayDays} dias` : "Sem runway"}
            </span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Portfolio</div>

          <div style={styles.row}>
            <span>Total BTC</span>
            <span style={styles.value}>{totalBTC.toFixed(6)} BTC</span>
          </div>

          <div style={styles.row}>
            <span>Valor Atual</span>
            <span style={styles.value}>{currentValue.toFixed(2)} €</span>
          </div>

          <div style={styles.row}>
            <span>PnL não realizado</span>
            <span
              style={{
                ...styles.value,
                color: pnl >= 0 ? "#22c55e" : "#f43f5e",
              }}
            >
              {pnl.toFixed(2)} € ({pnlPercent.toFixed(2)}%)
            </span>
          </div>

          <div style={styles.row}>
            <span>Lucro Realizado</span>
            <span style={styles.value}>{realizedProfit.toFixed(2)} €</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Scores de Mercado</div>

          <div style={styles.row}>
            <span>Macro</span>
            <span style={styles.value}>
              {marketIntel.macroScore.toFixed(1)} / 100
            </span>
          </div>

          <div style={styles.row}>
            <span>Técnico</span>
            <span style={styles.value}>
              {marketIntel.technicalScore.toFixed(1)} / 100
            </span>
          </div>

          <div style={styles.row}>
            <span>On‑Chain</span>
            <span style={styles.value}>
              {marketIntel.onChainScore.toFixed(1)} / 100
            </span>
          </div>

          <div style={styles.row}>
            <span>Liquidez</span>
            <span style={styles.value}>
              {marketIntel.liquidityScore.toFixed(1)} / 100
            </span>
          </div>

          <div style={styles.row}>
            <span>Risco</span>
            <span style={styles.value}>
              {marketIntel.riskScore.toFixed(1)} / 100
            </span>
          </div>

          <div style={styles.row}>
            <span>Oportunidade</span>
            <span style={styles.value}>
              {marketIntel.opportunityScore.toFixed(1)} / 100
            </span>
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* AÇÕES RÁPIDAS */}
      <h2 style={styles.sectionTitle}>Ações Rápidas</h2>
      <div style={styles.card}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button style={styles.actionButton}>
            Reforçar acumulação (simulado)
          </button>
          <button style={styles.actionButtonSecondary}>
            Reduzir intensidade
          </button>
          <button style={styles.actionButtonSecondary}>
            Reservar liquidez
          </button>
          <button style={styles.actionButtonSecondary}>
            Realizar parcial
          </button>
          <button style={styles.actionButtonSecondary}>
            Pausar novas compras
          </button>
        </div>
        <div style={styles.subLabel}>Nota</div>
        <div style={styles.summary}>
          Estas ações representam decisões de gestão de capital dentro do teu
          sistema. No futuro podem ser ligadas ao Ledger e a execução real.
        </div>
      </div>

      <div style={styles.separator} />

      {/* ALERTAS */}
      <h2 style={styles.sectionTitle}>Alertas</h2>
      <div style={styles.card}>
        <div style={styles.label}>Estado</div>

        {marketIntel.alerts.length === 0 && (
          <div style={styles.empty}>Sem alertas no momento.</div>
        )}

        {marketIntel.alerts.map((a, i) => (
          <div key={i} style={styles.alert}>
            {a}
          </div>
        ))}
      </div>

      <div style={styles.separator} />

      {/* MOVIMENTOS DE FUNDOS */}
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

      {modalType && (
        <FundMovementModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={(amount, date) => {
            if (modalType === "deposit") {
              registerDeposit(amount, date);
            } else {
              registerWithdrawal(amount, date);
              portfolio.realizedProfit += amount;
            }
            // FUTURO: aqui é o ponto ideal para também escrever no Ledger
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
  assistantCard: {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  assistantTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#f7931a",
    marginBottom: 8,
  },
  assistantLine: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 4,
  },
  assistantLineHighlight: {
    fontSize: 14,
    color: "#f7931a",
    fontWeight: 600,
    marginTop: 4,
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    background: "#0b0b0b",
    border: "1px solid #1f1f1f",
    padding: 14,
    borderRadius: 10,
  },
  quickLabel: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  quickValue: {
    fontSize: 18,
    fontWeight: 600,
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
  actionButton: {
    padding: "10px 14px",
    background: "#f7931a",
    borderRadius: 8,
    border: "none",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  actionButtonSecondary: {
    padding: "9px 14px",
    background: "#111",
    borderRadius: 8,
    border: "1px solid #333",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
  },
};
