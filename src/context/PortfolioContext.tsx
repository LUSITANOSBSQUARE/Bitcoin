import React, { createContext, useContext, useMemo } from "react";
import { useLedger } from "./LedgerContext";

export interface PortfolioContextType {
  totalBTC: number;
  totalInvested: number;
  realizedProfit: number;
  averagePrice: number;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { entries } = useLedger();

  const portfolio = useMemo(() => {
    let totalBTC = 0;
    let totalInvested = 0;
    let realizedProfit = 0;

    const buyLots: { btc: number; eur: number }[] = [];

    for (const e of entries) {
      if (e.type === "BUY") {
        totalBTC += e.amountBTC ?? 0;
        totalInvested += e.amountEUR;
        buyLots.push({ btc: e.amountBTC ?? 0, eur: e.amountEUR });
      }

      if (e.type === "SELL") {
        let btcToSell = e.amountBTC ?? 0;
        let costBasis = 0;

        while (btcToSell > 0 && buyLots.length > 0) {
          const lot = buyLots[0];

          if (lot.btc <= btcToSell) {
            costBasis += lot.eur;
            btcToSell -= lot.btc;
            buyLots.shift();
          } else {
            const ratio = btcToSell / lot.btc;
            costBasis += lot.eur * ratio;
            lot.eur -= lot.eur * ratio;
            lot.btc -= btcToSell;
            btcToSell = 0;
          }
        }

        realizedProfit += e.amountEUR - costBasis;
        totalBTC -= e.amountBTC ?? 0;
      }
    }

    const averagePrice = totalBTC > 0 ? totalInvested / totalBTC : 0;

    return {
      totalBTC,
      totalInvested,
      realizedProfit,
      averagePrice,
    };
  }, [entries]);

  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be inside PortfolioProvider");
  return ctx;
};
