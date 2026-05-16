import { useEffect, useState } from "react";

export const useFearGreed = () => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchFG = async () => {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const json = await res.json();
        setValue(Number(json.data[0].value));
      } catch (e) {
        console.error("Erro Fear & Greed:", e);
      }
    };

    fetchFG();
  }, []);

  return value;
};
