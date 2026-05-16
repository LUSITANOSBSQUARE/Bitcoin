export const usePortfolio = () => {
  const stored = JSON.parse(localStorage.getItem("portfolio") || "{}");

  return {
    totalBTC: stored.totalBTC ?? 0,
    realizedProfit: stored.realizedProfit ?? 0,
  };
};
