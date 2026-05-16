import { useEffect, useState } from "react";

export interface BitcoinData {
  /* PREÇO & VARIAÇÕES */
  priceEUR: number;
  priceUSD: number;

  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  change1y: number;

  high24h: number;
  low24h: number;

  marketCap: number;
  marketCapRank: number | null;
  fullyDilutedValuation: number | null;

  volume24h: number;
  volumeToMarketCap: number;

  /* SUPPLY */
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;

  /* ATH / ATL */
  athEUR: number;
  athChangePercent: number;
  athDate: string;

  atlEUR: number;
  atlChangePercent: number;
  atlDate: string;

  /* SCORES COINGECKO */
  sentimentVotesUp: number;
  sentimentVotesDown: number;
  sentimentScore: number; // up / (up + down)
  communityScore: number;
  developerScore: number;
  liquidityScore: number;
  publicInterestScore: number;

  /* DEV DATA */
  forks: number;
  stars: number;
  subscribers: number;
  totalIssues: number;
  closedIssues: number;
  pullRequestsMerged: number;
  pullRequestContributors: number;
  commitCount4Weeks: number;

  /* COMMUNITY DATA */
  twitterFollowers: number | null;
  redditSubscribers: number | null;
  telegramChannelUserCount: number | null;

  /* MERCADO / LISTINGS */
  tickersCount: number;
  exchangesCount: number;

  /* MÉTRICAS AVANÇADAS (CALCULADAS) */
  amplitude24h: number;
  pricePosition24h: number;
  volatility24h: number;
  volatility7d: number;
  volatility30d: number;
  volatility1y: number;

  trendStrength: number;
  momentumScore: number;
  riskScore: number;

  zScore24h: number;
  sma24h: number;
  std24h: number;

  distanceFromATHPercent: number;
  distanceFromATLPercent: number;
}

export const useBitcoinData = () => {
  const [data, setData] = useState<BitcoinData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=false"
      );

      const json = await res.json();
      const m = json.market_data;
      const dev = json.developer_data || {};
      const comm = json.community_data || {};
      const sentimentUp = json.sentiment_votes_up_percentage ?? 0;
      const sentimentDown = json.sentiment_votes_down_percentage ?? 0;

      const price = m.current_price.eur;
      const high = m.high_24h.eur;
      const low = m.low_24h.eur;

      /* --- MÉTRICAS BÁSICAS --- */

      const marketCap = m.market_cap.eur;
      const volume24h = m.total_volume.eur;
      const volumeToMarketCap =
        marketCap > 0 ? volume24h / marketCap : 0;

      const amplitude24h = high - low;
      const pricePosition24h =
        amplitude24h > 0 ? (price - low) / amplitude24h : 0.5;

      /* --- VOLATILIDADE (ABSOLUTA) --- */

      const volatility24h = Math.abs(
        m.price_change_percentage_24h_in_currency.eur
      );
      const volatility7d = Math.abs(
        m.price_change_percentage_7d_in_currency.eur
      );
      const volatility30d = Math.abs(
        m.price_change_percentage_30d_in_currency.eur
      );
      const volatility1y = Math.abs(
        m.price_change_percentage_1y_in_currency.eur
      );

      /* --- TENDÊNCIA & MOMENTUM --- */

      const change1h = m.price_change_percentage_1h_in_currency.eur;
      const change24h = m.price_change_percentage_24h_in_currency.eur;
      const change7d = m.price_change_percentage_7d_in_currency.eur;
      const change30d = m.price_change_percentage_30d_in_currency.eur;
      const change1y = m.price_change_percentage_1y_in_currency.eur;

      const trendStrength =
        Math.abs(change1h) * 0.2 +
        Math.abs(change24h) * 0.3 +
        Math.abs(change7d) * 0.3 +
        Math.abs(change30d) * 0.2;

      const momentumScore =
        change1h * 0.15 +
        change24h * 0.25 +
        change7d * 0.3 +
        change30d * 0.3;

      /* --- RISCO COMPOSTO (SIMPLIFICADO) --- */

      const liquidityScore =
        volumeToMarketCap > 0.15
          ? 1
          : volumeToMarketCap > 0.08
          ? 0.8
          : volumeToMarketCap > 0.03
          ? 0.5
          : 0.2;

      const riskScore =
        volatility24h * 0.35 +
        volatility7d * 0.25 +
        volatility30d * 0.2 +
        (1 - liquidityScore) * 20 +
        Math.max(0, trendStrength - 20) * 0.3;

      /* --- ATH / ATL & DISTÂNCIAS --- */

      const athEUR = m.ath.eur;
      const athChangePercent = m.ath_change_percentage.eur;
      const athDate = m.ath_date.eur;

      const atlEUR = m.atl.eur;
      const atlChangePercent = m.atl_change_percentage.eur;
      const atlDate = m.atl_date.eur;

      const distanceFromATHPercent =
        athEUR > 0 ? ((price - athEUR) / athEUR) * 100 : 0;
      const distanceFromATLPercent =
        atlEUR > 0 ? ((price - atlEUR) / atlEUR) * 100 : 0;

      /* --- SMA / STD SIMPLES 24H --- */

      const sma24h = (high + low + price) / 3;
      const std24h =
        Math.sqrt(
          ((price - sma24h) ** 2 +
            (high - sma24h) ** 2 +
            (low - sma24h) ** 2) /
            3
        ) || 0;
      const zScore24h = std24h ? (price - sma24h) / std24h : 0;

      /* --- SENTIMENTO COINGECKO --- */

      const totalSentiment = sentimentUp + sentimentDown || 1;
      const sentimentScore = sentimentUp / totalSentiment;

      /* --- DEV DATA --- */

      const forks = dev.forks ?? 0;
      const stars = dev.stars ?? 0;
      const subscribers = dev.subscribers ?? 0;
      const totalIssues = dev.total_issues ?? 0;
      const closedIssues = dev.closed_issues ?? 0;
      const pullRequestsMerged = dev.pull_requests_merged ?? 0;
      const pullRequestContributors =
        dev.pull_request_contributors ?? 0;
      const commitCount4Weeks =
        dev.commit_count_4_weeks ?? 0;

      /* --- COMMUNITY DATA --- */

      const twitterFollowers = comm.twitter_followers ?? null;
      const redditSubscribers = comm.reddit_subscribers ?? null;
      const telegramChannelUserCount =
        comm.telegram_channel_user_count ?? null;

      /* --- TICKERS / EXCHANGES --- */

      const tickers = Array.isArray(json.tickers) ? json.tickers : [];
      const tickersCount = tickers.length;
      const exchangesSet = new Set<string>();
      tickers.forEach((t: any) => {
        if (t.market?.name) exchangesSet.add(t.market.name);
      });
      const exchangesCount = exchangesSet.size;

      /* --- FINAL --- */

      setData({
        priceEUR: price,
        priceUSD: m.current_price.usd,

        change1h,
        change24h,
        change7d,
        change30d,
        change1y,

        high24h: high,
        low24h: low,

        marketCap,
        marketCapRank: json.market_cap_rank ?? null,
        fullyDilutedValuation: m.fully_diluted_valuation?.eur ?? null,

        volume24h,
        volumeToMarketCap,

        circulatingSupply: m.circulating_supply,
        totalSupply: m.total_supply ?? null,
        maxSupply: m.max_supply ?? null,

        athEUR,
        athChangePercent,
        athDate,

        atlEUR,
        atlChangePercent,
        atlDate,

        sentimentVotesUp: sentimentUp,
        sentimentVotesDown: sentimentDown,
        sentimentScore,
        communityScore: json.community_score ?? 0,
        developerScore: json.developer_score ?? 0,
        liquidityScore: json.liquidity_score ?? 0,
        publicInterestScore: json.public_interest_score ?? 0,

        forks,
        stars,
        subscribers,
        totalIssues,
        closedIssues,
        pullRequestsMerged,
        pullRequestContributors,
        commitCount4Weeks,

        twitterFollowers,
        redditSubscribers,
        telegramChannelUserCount,

        tickersCount,
        exchangesCount,

        amplitude24h,
        pricePosition24h,
        volatility24h,
        volatility7d,
        volatility30d,
        volatility1y,

        trendStrength,
        momentumScore,
        riskScore,

        sma24h,
        std24h,
        zScore24h,

        distanceFromATHPercent,
        distanceFromATLPercent,
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
