import React, { useState, useMemo } from "react";
import { useCapital } from "../context/CapitalContext";
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

  const {
    totalDeposited,
    availableFunds,
    usedFunds,
  } = useCapital();

  const portfolio = usePortfolio();
  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();
  const { addEntry } = useLedger();

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
    riskScore: marketIntelRaw?.riskScore ?? 0,
    opportunityScore: marketIntelRaw?.opportunityScore ?? 0,
    marketState: marketIntelRaw?.marketState ?? "Neutro",
    alerts: marketIntelRaw?.alerts ?? [],
    narrative: marketIntelRaw?.narrative ?? "",
    recommendation: marketIntelRaw?.recommendation ?? "neutral",
  };

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

  // DCA config (manual)
  const [dcaTarget, setDcaTarget] = useState<number>(1); // € / dia alvo

  const runwayDays =
    availableFunds > 0 && dcaTarget > 0
      ? Math.floor(availableFunds / dcaTarget)
      : 0;

  let dcaIntensityLabel = "Normal";
  let dcaMultiplier = 1;

  if (
    marketIntel.opportunityScore > 75 &&
    athDistancePct != null &&
    athDistancePct < -30
  ) {
    dcaIntensityLabel = "Reforçar";
    dcaMultiplier = 2.5;
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

  const effectiveDailyDCA = dcaTarget * dcaMultiplier;

  // Market intel para o motor
  const marketIntelForEngine = {
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
    marketIntelForEngine
  );

  const exposureCurrent = capitalIntel.exposureCurrent ?? 0;
  const exposureIdeal = capitalIntel.exposureIdeal ?? 0;

  const headerLine1 = `Olá BSquare. O mercado está em regime de ${regimeLabel.toLowerCase()}.`;
  const headerLine2 = `Exposição atual: ${exposureCurrent.toFixed(
    1
  )}% · Exposição ideal: ${exposureIdeal.toFixed(1)}% · Runway: ${
    runwayDays > 0 ? `${runwayDays} dias` : "sem runway"
  }.`;
  const headerLine3 = `Recomendação atual do assistente: ${capitalIntel.action} (${capitalIntel.intensity}).`;

  // ALERTAS (UI)
  const uiAlerts = useMemo(() => {
    const list: string[] = [];

    if (
      marketIntel.macroScore === 0 &&
      marketIntel.technicalScore === 0 &&
      marketIntel.onChainScore === 0
    ) {
      list.push(
        "Sem scores de mercado — verifica se os hooks de dados estão a devolver valores reais ou se estás em modo mock."
      );
    }

    if (availableFunds > 0 && totalBTC === 0) {
      list.push(
        "Tens capital disponível e 0 BTC — cenário clássico para definir plano de entrada faseado."
      );
    }

    if (marketIntel.opportunityScore > 70 && athDistancePct != null && athDistancePct < -30) {
      list.push(
        "Oportunidade forte: preço bem abaixo do ATH com score de oportunidade elevado — considera alocar parte da liquidez."
      );
    }

    if (marketIntel.riskScore > 75) {
      list.push(
        "Risco elevado — evita alocações agressivas, foca-te em gestão de liquidez e proteção de capital."
      );
    }

    if (marketIntel.alerts.length > 0) {
      list.push(...marketIntel.alerts);
    }

    return list;
  }, [
    marketIntel.macroScore,
    marketIntel.technicalScore,
    marketIntel.onChainScore,
    marketIntel.opportunityScore,
    marketIntel.riskScore,
    marketIntel.alerts,
    availableFunds,
    totalBTC,
    athDistancePct,
  ]);

  // Registar DCA de hoje (Ledger + Portfolio via Ledger)
  const handleRegisterDCA = () => {
    if (!btcPrice || btcPrice <= 0) return;
    if (effectiveDailyDCA <= 0) return;
    if (availableFunds <= 0) return;

    const amountEUR = Math.min(effectiveDailyDCA, availableFunds);
    const amountBTC = amountEUR / btcPrice;
    const nowIso = new Date().toISOString();

    // Compra real de BTC via Ledger
    addEntry({
      id: crypto.randomUUID(),
      type: "BUY",
      amountEUR,
      amountBTC,
      date: nowIso,
      meta: {
        kind: "DCA_BUY",
        source: "capital-engine",
        dcaDailyTarget: dcaTarget,
        dcaMultiplier,
      },
    });

    // Evento de motor para histórico de estratégia
    addEntry({
      id: crypto.randomUUID(),
      type: "ENGINE_BUY",
      amountEUR: 0,
      amountBTC: 0,
      date: nowIso,
      meta: {
        kind: "DCA_DAILY_MARK",
        note: "Registo de DCA diário a partir do CapitalControl",
        dcaEffectiveEUR: amountEUR,
      },
    });
  };

  // Ações rápidas — mudança de modo de estratégia (apenas histórico por agora)
  const handleStrategyModeChange = (mode: "AGGRESSIVE" | "NORMAL" | "DEFENSIVE") => {
    const nowIso = new Date().toISOString();
    addEntry({
      id: crypto.randomUUID(),
      type: "ENGINE_BUY",
      amountEUR: 0,
      amountBTC: 0,
      date: nowIso,
      meta: {
        kind: "STRATEGY_MODE_CHANGE",
        mode,
      },
    });
  };

  const currentModeLabel =
  dcaMultiplier > 1
    ? "AGGRESSIVE"
    : dcaMultiplier < 1
    ? "DEFENSIVE"
    : "NORMAL";

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.topRightGroup}>
          <button
            style={styles.ledgerButton}
            onClick={() => {
              // aqui assumes que tens routing tipo react-router
              // se não tiveres, podes trocar por link normal
              window.location.href = "/ledger";
            }}
          >
            Capital &amp; Exposição (Ledger)
          </button>
        </div>
      </div>

      {/* ALERTAS NO TOPO */}
      {uiAlerts.length > 0 && (
        <div style={styles.alertBar}>
          {uiAlerts.map((a, i) => (
            <div key={i} style={styles.alertPill}>
              {a}
            </div>
          ))}
        </div>
      )}

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
          <div style={styles.quickValue}>{exposureCurrent.toFixed(1)}%</div>
        </div>
        <div style={styles.quickCard}>
          <div style={styles.quickLabel}>Exposição Ideal</div>
          <div style={styles.quickValue}>{exposureIdeal.toFixed(1)}%</div>
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

      {/* CONFIGURAÇÃO DE DCA */}
      <h2 style={styles.sectionTitle}>Configuração de DCA</h2>
      <div style={styles.card}>
        <div style={styles.row}>
          <span>DCA diário alvo</span>
          <span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={dcaTarget}
              onChange={(e) => setDcaTarget(Number(e.target.value) || 0)}
              style={styles.dcaInput}
            />{" "}
            €
          </span>
        </div>

        <div style={styles.row}>
          <span>Multiplicador efetivo</span>
          <span style={styles.value}>{dcaMultiplier.toFixed(2)}x</span>
        </div>

        <div style={styles.row}>
          <span>DCA efetivo sugerido</span>
          <span style={styles.value}>
            {effectiveDailyDCA.toFixed(2)} € / dia
          </span>
        </div>

        <div style={styles.row}>
          <span>Modo atual</span>
          <span style={styles.value}>{currentModeLabel}</span>
        </div>

        <button style={styles.actionButton} onClick={handleRegisterDCA}>
          Registar DCA de hoje (Ledger)
        </button>

        <div style={styles.subLabel}>Nota</div>
        <div style={styles.summary}>
          Quando clicas em &quot;Registar DCA de hoje&quot;, o sistema calcula
          quantos BTC corresponderam ao DCA efetivo ao preço atual e grava um
          BUY no Ledger com esse valor de BTC. Em paralelo, grava também um
          evento de motor com meta de DCA. O Portfolio e o Estado do Capital
          passam a refletir esta acumulação real.
        </div>
      </div>

      <div style={styles.separator} />

      {/* LEITURA DO ASSISTENTE */}
      <h2 style={styles.sectionTitle}>Leitura do Assistente</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Narrativa Estratégica</div>
          <div style={styles.subLabel}>ATH &amp; Ciclo</div>
          <div style={styles.summary}>{athContext}</div>
          <div style={styles.summary}>{cycleContext}</div>

          <div style={styles.subLabel}>Narrativa de Mercado</div>
          <div style={styles.summary}>
            {marketIntel.narrative || "Sem narrativa detalhada disponível."}
          </div>
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
            <span style={styles.value}>{dcaTarget.toFixed(2)} € / dia</span>
          </div>

          <div style={styles.row}>
            <span>DCA efetivo</span>
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
          <div style={styles.summary}>
            {capitalIntel.narrative ||
              `Exposição atual: ${exposureCurrent.toFixed(
                1
              )}% (ideal: ${exposureIdeal.toFixed(
                1
              )}%). Liquidez disponível: ${availableFunds.toFixed(
                2
              )} €. O assistente ajusta a intensidade de acumulação em função do regime de mercado, risco e oportunidade.`}
          </div>
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
            <span>Runway DCA efetivo</span>
            <span style={styles.value}>
              {runwayDays > 0 ? `${runwayDays} dias` : "Sem runway"}
            </span>
          </div>

          {totalDeposited === 0 && (
            <div style={{ ...styles.summary, marginTop: 8 }}>
              Ainda não há capital registado no Ledger. Regista DEPOSIT/WITHDRAW
              na Ledger para o assistente gerir liquidez real.
            </div>
          )}
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

          {totalBTC === 0 && availableFunds > 0 && (
            <div style={{ ...styles.summary, marginTop: 8 }}>
              Tens capital mas ainda não tens BTC — o sistema interpreta isto
              como liquidez à espera de ser alocada. O DCA e as sugestões de
              compra ajudam a transformar esta liquidez em exposição gradual.
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Scores de Mercado</div>

          {marketIntel.macroScore === 0 &&
          marketIntel.technicalScore === 0 &&
          marketIntel.onChainScore === 0 ? (
            <div style={styles.summary}>
              Sem scores de mercado disponíveis. Garante que os hooks de dados
              (`useBitcoinData`, `useOnChainData`, etc.) estão a devolver
              valores reais.
            </div>
          ) : (
            <>
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
            </>
          )}
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
          e são registados no Ledger como eventos de motor. No futuro, o motor
          pode usar estes eventos para ajustar regras de risco e execução real.
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
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
    marginBottom: 12,
  },
  topRightGroup: {
    display: "flex",
    gap: 8,
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
