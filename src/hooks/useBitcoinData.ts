import { useEffect, useState } from "react";

interface BitcoinData {
  priceEUR: number;
  priceUSD: number;

  change1h: number;
  change24h: number;
  change7d: number;

  high24h: number;
  low24h: number;

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
      const m = json.market_data;

      setData({
        priceEUR: m.current_price.eur,
        priceUSD: m.current_price.usd,

        change1h: m.price_change_percentage_1h_in_currency.eur,
        change24h: m.price_change_percentage_24h_in_currency.eur,
        change7d: m.price_change_percentage_7d_in_currency.eur,

        high24h: m.high_24h.eur,
        low24h: m.low_24h.eur,

        marketCap: m.market_cap.eur,
        volume24h: m.total_volume.eur,
        dominance: json.market_data.market_cap_percentage?.btc ?? 0,
        supply: m.circulating_supply,
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
