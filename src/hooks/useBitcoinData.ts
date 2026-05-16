import { useEffect, useState } from "react";

interface BitcoinData {
  price: number;
  marketCap: number;
  volume24h: number;
  dominance: number;
  supply: number;
}

export const useBitcoinData = () => {
  const [data, setData] = useState<BitcoinData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&market_data=true"
      );
      const json = await res.json();

      setData({
        price: json.market_data.current_price.usd,
        marketCap: json.market_data.market_cap.usd,
        volume24h: json.market_data.total_volume.usd,
        dominance: json.market_data.market_cap_change_percentage_24h,
        supply: json.market_data.circulating_supply,
      });
    } catch (err) {
      console.error("Erro ao buscar dados do Bitcoin:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return data;
};
