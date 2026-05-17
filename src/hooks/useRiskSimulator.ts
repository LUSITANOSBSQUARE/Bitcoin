import { useMemo } from "react";
import type { TradeSetup } from "../hooks/useTradeCopilot";

export type RiskResult = {
  positionSize: number;
  riskAmount: number;
  riskPercent: number;
  liquidationPrice: number | null;
  marginRequired: number;
  exposureAfter: number;
};

type Params = {
  setup: TradeSetup;
  capital: number;       // capital total do utilizador
  maxRiskPercent: number; // risco máximo permitido por trade (ex: 1%)
  price: number;         // preço atual do BTC
};

export const useRiskSimulator = ({
  setup,
  capital,
  maxRiskPercent,
  price,
}: Params): RiskResult => {
  return useMemo(() => {
    const invalidation = parseFloat(setup.invalidation);
    const leverage = parseFloat(setup.leverage);

    const riskAmount = (capital * maxRiskPercent) / 100;

    const distance = Math.abs(price - invalidation);
    const positionSize = distance > 0 ? riskAmount / distance : 0;

    const marginRequired = positionSize / leverage;

    const liquidationPrice =
      setup.direction === "long"
        ? price - price / leverage
        : price + price / leverage;

    const exposureAfter = marginRequired / capital * 100;

    return {
      positionSize,
      riskAmount,
      riskPercent: maxRiskPercent,
      liquidationPrice,
      marginRequired,
      exposureAfter,
    };
  }, [setup, capital, maxRiskPercent, price]);
};
