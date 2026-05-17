import { usePortfolio } from "../context/PortfolioContext";
import { useBitcoinData } from "../hooks/useBitcoinData";

export const usePortfolioSnapshot = () => {
  const { transactions, totalBTC, realizedProfit } = usePortfolio();
  const market = useBitcoinData();

  const price = market?.priceEUR ?? 0;

  const totalInvested = transactions.reduce(
    (s, t) => s + t.amountBTC * t.priceUSD,
    0
  );

  const currentValue = totalBTC * price;
  const unrealizedProfit = currentValue - totalInvested;

  const avgPrice = totalBTC > 0 ? totalInvested / totalBTC : 0;

  return {
    transactions,
    totalBTC,
    totalInvested,
    avgPrice,
    currentValue,
    realizedProfit,
    unrealizedProfit,
  };
};
