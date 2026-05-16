import { useEffect, useState } from "react";

export interface OnChainData {
  hashrate: number | null;
  difficulty: number | null;
  mempoolTxCount: number | null;
  mempoolVSize: number | null;

  feeLow: number | null;
  feeMedium: number | null;
  feeHigh: number | null;

  txPerDay: number | null;
  blockTime: number | null;
  blockSize: number | null;

  minerRevenueUSD: number | null;
  supply: number | null;
}

const timeout = (ms: number) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

const safeFetch = async (url: string, ms = 3000) => {
  try {
    const result = await Promise.race([fetch(url), timeout(ms)]);

    // garantir que é um Response
    if (!(result instanceof Response)) {
      return null;
    }

    return await result.json();
  } catch {
    return null;
  }
};


export const useOnChainData = () => {
  const [data, setData] = useState<OnChainData | null>(null);

  const fetchData = async () => {
    try {
      const [
        hashrateJson,
        diffJson,
        mempoolJson,
        feesJson,
        txJson,
        blockTimeJson,
        blockSizeJson,
        minerJson,
        supplyRaw,
      ] = await Promise.all([
        safeFetch("https://api.blockchain.info/charts/hash-rate?timespan=1days&format=json"),
        safeFetch("https://api.blockchain.info/charts/difficulty?timespan=1days&format=json"),
        safeFetch("https://mempool.space/api/mempool"),
        safeFetch("https://mempool.space/api/v1/fees/recommended"),
        safeFetch("https://api.blockchain.info/charts/n-transactions?timespan=1days&format=json"),
        safeFetch("https://api.blockchain.info/charts/avg-block-time?timespan=1days&format=json"),
        safeFetch("https://api.blockchain.info/charts/avg-block-size?timespan=1days&format=json"),
        safeFetch("https://api.blockchain.info/charts/miners-revenue?timespan=1days&format=json"),
        fetch("https://api.blockchain.info/q/totalbc").then(r => r.text()).catch(() => null),
      ]);

      const last = (obj: any) =>
        obj?.values?.[obj.values.length - 1]?.y ?? null;

      setData({
        hashrate: last(hashrateJson),
        difficulty: last(diffJson),

        mempoolTxCount: mempoolJson?.count ?? null,
        mempoolVSize: mempoolJson?.vsize ?? null,

        feeLow: feesJson?.hourFee ?? null,
        feeMedium: feesJson?.halfHourFee ?? null,
        feeHigh: feesJson?.fastestFee ?? null,

        txPerDay: last(txJson),
        blockTime: last(blockTimeJson),
        blockSize: last(blockSizeJson),

        minerRevenueUSD: last(minerJson),

        supply: supplyRaw ? Number(supplyRaw) / 1e8 : null,
      });
    } catch (err) {
      console.error("Erro ao buscar dados on-chain:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return data;
};
