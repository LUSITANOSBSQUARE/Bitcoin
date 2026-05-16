import { useEffect, useState } from "react";

export const useBitcoinHistory = () => {
  const [history, setHistory] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
      );
      const json = await res.json();

      const prices = json.prices.map((p: [number, number]) => p[1]);
      const labels = json.prices.map((p: [number, number]) =>
        new Date(p[0]).toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "2-digit",
        })
      );

      setHistory(prices);
      setTimestamps(labels);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, timestamps };
};
