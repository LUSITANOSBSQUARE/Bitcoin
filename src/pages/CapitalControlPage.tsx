// src/pages/CapitalControlPage.tsx
import React, { useState, useMemo } from "react";
import { useNavigation } from "../context/NavigationContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";
import { useCapitalEngine } from "../engine/useCapitalEngine";
import { useCapitalPortfolioSync } from "../hooks/useCapitalPortfolioSync";
import { useLedger } from "../context/LedgerContext";

export const CapitalControlPage: React.FC = () => {
  useCapitalPortfolioSync();

  const { navigate } = useNavigation();
  const portfolio = usePortfolio();
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();
  const { entries, addEntry } = useLedger();

  // LIQUIDEZ REAL A PARTIR DO LEDGER
  const {
    totalDeposited,
    availableFunds,
    usedFunds,
  } = useMemo(() => {
    let deposits = 0;
    let withdraws = 0;
    let buys = 0;
    let sells = 0;

    for (const e of entries) {
      if (e.type === "DEPOSIT") deposits += e.amountEUR ?? 0;
      if (e.type === "WITHDRAW") withdraws += e.amountEUR ?? 0;
      if (e.type === "BUY" || e.type === "ENGINE_BUY") buys += e.amountEUR ?? 0;
      if (e.type === "SELL" || e.type === "ENGINE_SELL") sells += e.amountEUR ?? 0;
      // ENGINE_REBALANCE ignorado (A3)
    }

    const totalDep = deposits - withdraws;
    const avail = totalDep - buys + sells;
    const used = totalDep - avail;

    return {
      totalDeposited: totalDep,
      availableFunds: Math.max(avail, 0),
      usedFunds: Math.max(used, 0),
    };
  }, [entries]);

  // DADOS DE MERCADO / PORTFOLIO
  const btcPrice = market?.priceEUR ?? 0;
  const athEUR = (market as any)?.athEUR ?? null;
  const halvingCycle = (market as any)?.halvingCycle ?? null;

  const totalBTC = portfolio.totalBTC ?? 0;
  const currentValue = totalBTC * btcPrice;
  const totalInvested = portfolio.totalInvested ?? 0;

  const pnl = currentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const realizedProfit = portfolio.realizedProfit ?? 0;

  const marketIntelRaw = useMarketIntelligence(
    market,
    onchain,
    fearGreed,
    dominance
  );

  const marketIntel = {
    macroScore: marketIntelRaw?.macroScore ?? 0,
    technicalScore: marketIntelRaw?.technicalScore ?? 0,
    onChainScore: marketIntelRaw?.onChainScore ?? 0,
    liquidityScore: marketIntelRaw?.liquidityScore ?? 0,
    riskScore: marketIntelRaw?.riskScore ?? 0,
    opportunityScore: marketIntelRaw?.opportunityScore ?? 0,
    marketState: marketIntelRaw?.marketState ?? "Neutro",
    alerts: marketIntelRaw?.alerts ?? [],
    narrative: marketIntelRaw?.narrative ?? "",
    recommendation: marketIntelRaw?.recommendation ?? "neutral",
  };

  // ATH / REGIME
  let athContext = "Sem dados de ATH disponíveis.";
  let athDistancePct: number | null = null;
  let regimeLabel = "Regime neutro";

  if (athEUR && athEUR > 0 && btcPrice > 0) {
    athDistancePct = ((btcPrice - athEUR) / athEUR) * 100;
    const abs = Math.abs(athDistancePct);

    if (athDistancePct <= -60) {
      athContext = `Preço cerca de ${abs.toFixed(1)}% abaixo do ATH — desconto profundo.`;
      regimeLabel = "Acumulação agressiva";
    } else if (athDistancePct <= -30) {
      athContext = `Preço ${abs.toFixed(1)}% abaixo do ATH — acumulação forte.`;
      regimeLabel = "Acumulação forte";
    } else if (athDistancePct < 0) {
      athContext = `Preço ${abs.toFixed(1)}% abaixo do ATH — acumulação moderada.`;
      regimeLabel = "Acumulação moderada";
    } else if (athDistancePct >= 0 && athDistancePct <= 10) {
      athContext = "Perto do ATH — zona de realização parcial.";
      regimeLabel = "Realização parcial";
    } else {
      athContext = `Preço ${athDistancePct.toFixed(1)}% acima do ATH — euforia.`;
      regimeLabel = "Euforia / proteção";
    }
  }

  // CICLO / HALVING
  let cycleContext = "Sem dados de ciclo disponíveis.";
  if (halvingCycle) {
    const phase = halvingCycle.phase ?? "desconhecida";
    const daysToHalving = halvingCycle.daysToHalving;
    const daysFromHalving = halvingCycle.daysFromHalving;

    if (daysToHalving > 0) {
      cycleContext = `A ${daysToHalving} dias do halving — fase de acumulação.`;
    } else if (daysFromHalving >= 0) {
      cycleContext = `A ${daysFromHalving} dias após o halving — tendência de construção.`;
    } else {
      cycleContext = `Fase de ciclo: ${phase}.`;
    }
  }

  // DCA CONFIG
  const [dcaTarget, setDcaTarget] = useState<number>(1);

  const runwayDays =
    availableFunds > 0 && dcaTarget > 0
      ? Math.floor(availableFunds / dcaTarget)
      : 0;

  let dcaMultiplier = 1;
  let dcaIntensityLabel = "Normal";

  if (
    marketIntel.opportunityScore > 75 &&
    athDistancePct != null &&
    athDistancePct < -30
  ) {
    dcaMultiplier = 2.5;
    dcaIntensityLabel = "Reforçar";
  } else if (marketIntel.riskScore > 75) {
    dcaMultiplier = 0.5;
    dcaIntensityLabel = "Defensivo";
  }

  const effectiveDailyDCA = dcaTarget * dcaMultiplier;

  // CAPITAL ENGINE
  const capitalIntel = useCapitalEngine(
    {
      availableFunds,
      usedFunds,
      totalDeposited,
      totalBTC,
      realizedProfit,
      unrealizedProfit: pnl,
    },
    {
      riskScore: marketIntel.riskScore,
      opportunityScore: marketIntel.opportunityScore,
      marketState: marketIntel.marketState,
      recommendation: marketIntel.recommendation,
      athDistancePct: athDistancePct ?? undefined,
      cyclePhase: halvingCycle?.phase,
      volatilityScore: market?.volatility30d,
      dominance: dominance ?? undefined,
      momentumScore: market?.momentumScore,
      trendStrength: market?.trendStrength,
      liquidityScore: marketIntel.liquidityScore,
    }
  );

  const exposureCurrent = capitalIntel.exposureCurrent ?? 0;
  const exposureIdeal = capitalIntel.exposureIdeal ?? 0;

  // ALERTAS
  const uiAlerts = useMemo(() => {
    const list: string[] = [];

    if (
      marketIntel.macroScore === 0 &&
      marketIntel.technicalScore === 0 &&
      marketIntel.onChainScore === 0
    ) {
      list.push("Sem dados de mercado — verifica os hooks.");
    }

    if (availableFunds > 0 && totalBTC === 0) {
      list.push("Tens liquidez e 0 BTC — cenário clássico para acumulação.");
    }

    if (
      marketIntel.opportunityScore > 70 &&
      athDistancePct != null &&
      athDistancePct < -30
    ) {
      list.push("Oportunidade forte — preço bem abaixo do ATH.");
    }

    if (marketIntel.riskScore > 75) {
      list.push("Risco elevado — cautela recomendada.");
    }

    if (marketIntel.alerts.length > 0) {
      list.push(...marketIntel.alerts);
    }

    return list;
  }, [marketIntel, availableFunds, totalBTC, athDistancePct]);

  // REGISTAR DCA
  const handleRegisterDCA = () => {
    if (!btcPrice || btcPrice <= 0) return;
    if (effectiveDailyDCA <= 0) return;
    if (availableFunds <= 0) return;

    const amountEUR = Math.min(effectiveDailyDCA, availableFunds);
    const amountBTC = amountEUR / btcPrice;
    const nowIso = new Date().toISOString();

    addEntry({
      id: crypto.randomUUID(),
      type: "BUY",
      amountEUR,
      amountBTC,
      date: nowIso,
      meta: { kind: "DCA_BUY" },
    });

    addEntry({
      id: crypto.randomUUID(),
      type: "ENGINE_BUY",
      amountEUR: 0,
      amountBTC: 0,
      date: nowIso,
      meta: { kind: "DCA_DAILY_MARK", dcaEffectiveEUR: amountEUR },
    });
  };

  // MUDAR MODO
  const handleStrategyModeChange = (
    mode: "AGGRESSIVE" | "NORMAL" | "DEFENSIVE"
  ) => {
    addEntry({
      id: crypto.randomUUID(),
      type: "ENGINE_BUY",
      amountEUR: 0,
      amountBTC: 0,
      date: new Date().toISOString(),
      meta: { kind: "STRATEGY_MODE_CHANGE", mode },
    });
  };

  const currentModeLabel =
    dcaMultiplier > 1 ? "AGGRESSIVE" : dcaMultiplier < 1 ? "DEFENSIVE" : "NORMAL";

  // RENDER
  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button style={styles.ledgerButton} onClick={() => navigate("ledger")}>
          Capital & Exposição (Ledger)
        </button>
      </div>

      {/* ALERTAS */}
      {uiAlerts.length > 0 && (
        <div style={styles.alertBar}>
          {uiAlerts.map((a, i) => (
            <div key={i} style={styles.alertPill}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* ASSISTENTE */}
      <div style={styles.assistantCard}>
        <div style={styles.assistantTitle}>Assistente Financeiro Pessoal</div>
        <div style={styles.assistantLine}>
          Olá BSquare. O mercado está em regime de {regimeLabel.toLowerCase()}.
        </div>
        <div style={styles.assistantLine}>
          Exposição atual: {exposureCurrent.toFixed(1)}% · ideal:{" "}
          {exposureIdeal.toFixed(1)}% · runway:{" "}
          {runwayDays > 0 ? `${runwayDays} dias` : "sem runway"}.
        </div>
        <div style={styles.assistantLineHighlight}>
          Recomendação: {capitalIntel.action} ({capitalIntel.intensity})
        </div>
      </div>

      {/* QUICK GRID */}
      <div style={styles.quickGrid}>
        <QuickCard label="Exposição Atual" value={`${exposureCurrent.toFixed(1)}%`} />
        <QuickCard label="Exposição Ideal" value={`${exposureIdeal.toFixed(1)}%`} />
        <QuickCard
          label="Runway DCA"
          value={runwayDays > 0 ? `${runwayDays} dias` : "Sem runway"}
        />
        <QuickCard label="Regime" value={regimeLabel} />
      </div>

      <div style={styles.separator} />

      {/* DCA CONFIG */}
      <h2 style={styles.sectionTitle}>Configuração de DCA</h2>
      <div style={styles.card}>
        <Row label="DCA diário alvo">
          <input
            type="number"
            min={0}
            step={0.5}
            value={dcaTarget}
            onChange={(e) => setDcaTarget(Number(e.target.value) || 0)}
            style={styles.dcaInput}
          />{" "}
          €
        </Row>

        <Row label="Multiplicador efetivo" value={`${dcaMultiplier.toFixed(2)}x`} />
        <Row label="DCA efetivo" value={`${effectiveDailyDCA.toFixed(2)} € / dia`} />
        <Row label="Modo atual" value={currentModeLabel} />

        <button style={styles.actionButton} onClick={handleRegisterDCA}>
          Registar DCA de hoje (Ledger)
        </button>
      </div>

      <div style={styles.separator} />

      {/* LEITURA DO ASSISTENTE */}
      <h2 style={styles.sectionTitle}>Leitura do Assistente</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Narrativa Estratégica</div>
          <div style={styles.subLabel}>ATH & Ciclo</div>
          <div style={styles.summary}>{athContext}</div>
          <div style={styles.summary}>{cycleContext}</div>

          <div style={styles.subLabel}>Narrativa de Mercado</div>
          <div style={styles.summary}>
            {marketIntel.narrative || "Sem narrativa disponível."}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Recomendação Atual</div>
          <Row label="Ação" value={capitalIntel.action} />
          <Row label="Intensidade" value={capitalIntel.intensity} />
          <Row label="Modo DCA" value={dcaIntensityLabel} />
          <Row label="DCA base" value={`${dcaTarget.toFixed(2)} € / dia`} />
          <Row
            label="DCA efetivo"
            value={`${effectiveDailyDCA.toFixed(2)} € / dia`}
          />

          {capitalIntel.suggestedBuy > 0 && (
            <Row
              label="Compra sugerida"
              value={`${capitalIntel.suggestedBuy.toFixed(2)} €`}
            />
          )}

          {capitalIntel.suggestedSell > 0 && (
            <Row
              label="Venda sugerida"
              value={`${capitalIntel.suggestedSell.toFixed(2)} €`}
            />
          )}

          <div style={styles.subLabel}>Resumo do Assistente</div>
          <div style={styles.summary}>
            Exposição atual: {exposureCurrent.toFixed(1)}% (ideal:{" "}
            {exposureIdeal.toFixed(1)}%). Liquidez disponível:{" "}
            {availableFunds.toFixed(2)} €. O assistente ajusta a intensidade de
            acumulação em função do regime de mercado, risco e oportunidade.
          </div>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ESTADO DO CAPITAL */}
      <h2 style={styles.sectionTitle}>Estado do Capital</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Liquidez</div>

          <Row label="Disponível" value={`${availableFunds.toFixed(2)} €`} />
          <Row label="Usado" value={`${usedFunds.toFixed(2)} €`} />
          <Row label="Total Depositado" value={`${totalDeposited.toFixed(2)} €`} />
          <Row
            label="Runway DCA efetivo"
            value={runwayDays > 0 ? `${runwayDays} dias` : "Sem runway"}
          />

          {totalDeposited === 0 && (
            <div style={{ ...styles.summary, marginTop: 8 }}>
              Ainda não há capital registado no Ledger. Regista DEPOSIT/WITHDRAW
              na Ledger para o assistente gerir liquidez real.
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Portfolio</div>

          <Row label="Total BTC" value={`${totalBTC.toFixed(6)} BTC`} />
          <Row label="Valor Atual" value={`${currentValue.toFixed(2)} €`} />
          <Row
            label="PnL não realizado"
            value={`${pnl.toFixed(2)} € (${pnlPercent.toFixed(2)}%)`}
          />
          <Row
            label="Lucro Realizado"
            value={`${realizedProfit.toFixed(2)} €`}
          />

          {totalBTC === 0 && availableFunds > 0 && (
            <div style={{ ...styles.summary, marginTop: 8 }}>
              Tens capital mas ainda não tens BTC — o sistema interpreta isto
              como liquidez à espera de ser alocada.
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Scores de Mercado</div>

          <Row
            label="Macro"
            value={`${marketIntel.macroScore.toFixed(1)} / 100`}
          />
          <Row
            label="Técnico"
            value={`${marketIntel.technicalScore.toFixed(1)} / 100`}
          />
          <Row
            label="On‑Chain"
            value={`${marketIntel.onChainScore.toFixed(1)} / 100`}
          />
          <Row
            label="Liquidez"
            value={`${marketIntel.liquidityScore.toFixed(1)} / 100`}
          />
          <Row
            label="Risco"
            value={`${marketIntel.riskScore.toFixed(1)} / 100`}
          />
          <Row
            label="Oportunidade"
            value={`${marketIntel.opportunityScore.toFixed(1)} / 100`}
          />
        </div>
      </div>

      <div style={styles.separator} />

      {/* AÇÕES RÁPIDAS */}
      <h2 style={styles.sectionTitle}>Ações Rápidas</h2>
      <div style={styles.card}>
        <div style={styles.subLabel}>Modo atual: {currentModeLabel}</div>
        <div style={styles.subLabel}>Impacto dos modos</div>
        <div style={styles.summary}>
          Os modos ajustam o multiplicador de DCA (agressivo, normal, defensivo)
          e são registados no Ledger como eventos de motor.
        </div>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}
        >
          <button
            style={styles.actionButton}
            onClick={() => handleStrategyModeChange("AGGRESSIVE")}
          >
            Reforçar acumulação
          </button>
          <button
            style={styles.actionButtonSecondary}
            onClick={() => handleStrategyModeChange("DEFENSIVE")}
          >
            Reservar liquidez
          </button>
          <button
            style={styles.actionButtonSecondary}
            onClick={() => handleStrategyModeChange("DEFENSIVE")}
          >
            Focar em realização
          </button>
          <button
            style={styles.actionButtonSecondary}
            onClick={() => handleStrategyModeChange("NORMAL")}
          >
            Voltar a normal
          </button>
        </div>
      </div>

      <div style={styles.separator} />

      {/* ALERTAS DETALHADOS */}
      <h2 style={styles.sectionTitle}>Alertas</h2>
      <div style={styles.card}>
        <div style={styles.label}>Estado</div>

        {uiAlerts.length === 0 && (
          <div style={styles.empty}>Sem alertas no momento.</div>
        )}

        {uiAlerts.map((a, i) => (
          <div key={i} style={styles.alert}>
            {a}
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPONENTES AUXILIARES

interface RowProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ label, value, children }) => (
  <div style={styles.row}>
    <span>{label}</span>
    <span style={styles.value}>{value ?? children}</span>
  </div>
);

interface QuickCardProps {
  label: string;
  value: string;
}

const QuickCard: React.FC<QuickCardProps> = ({ label, value }) => (
  <div style={styles.quickCard}>
    <div style={styles.quickLabel}>{label}</div>
    <div style={styles.quickValue}>{value}</div>
  </div>
);

// STYLES

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
    marginBottom: 12,
  },
  ledgerButton: {
    padding: "8px 14px",
    background: "#000",
    border: "1px solid #f7931a",
    borderRadius: 8,
    color: "#f7931a",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  alertBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  alertPill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #f97316",
    background: "#1a1205",
    fontSize: 12,
    color: "#fbbf24",
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
    marginTop: 10,
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
  dcaInput: {
    width: 80,
    padding: "4px 6px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "#000",
    color: "#fff",
    fontSize: 14,
  },
};
