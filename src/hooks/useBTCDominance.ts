import { useEffect, useState } from "react";

export const useBTCDominance = () => {
  const [dom, setDom] = useState<number | null>(null);

  useEffect(() => {
    const fetchDom = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const json = await res.json();
        setDom(json.data.market_cap_percentage.btc);
      } catch (e) {
        console.error("Erro dominância:", e);
      }
    };

    fetchDom();
  }, []);

  return dom;
};
