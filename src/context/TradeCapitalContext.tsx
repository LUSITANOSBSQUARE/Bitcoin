import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Trade } from "./TradesContext";

/* ---------------------------------------------
   TIPOS
--------------------------------------------- */

export type MonthAuditEntry = {
  id: string;
  date: string;      // ISO
  message: string;
};

export type TradeCapitalMonth = {
  monthIndex: number;      // 0-11
  monthName: string;       // "Janeiro"
  bancaInicial: number;
  bancaFinal: number;
  pnlUSDT: number;
  pnlPercent: number;
  targetPercent: number;
  targetUSDT: number;
  aporte: number;
  withdraw: number;
  reserve: number;
  btc: number;
  fees: number;
  trades: number;
  winrate: number;
  notes?: string;
  auditLog?: MonthAuditEntry[];
};

export type TradeCapitalYear = {
  year: number;
  bancaInicial: number;
  bancaFinal: number;
  roiPercent: number;
  totalAportes: number;
  totalWithdraw: number;
  totalFees: number;
  totalTrades: number;
  winrate: number;
  months: TradeCapitalMonth[];
};

type TradeCapitalContextType = {
  capital: number;
  reserve: number;
  btcAccumulated: number;
  profitReservePercent: number;

  years: TradeCapitalYear[];
  currentYear: TradeCapitalYear | null;
  months: TradeCapitalMonth[];

  registerClosedTrade: (trade: Trade, pnl: number, isWin?: boolean) => void;
  addAporte: (value: number) => void;
  removeCapital: (value: number) => void;
  buyBTC: (value: number, btcPrice: number) => void;
  setProfitReservePercent: (p: number) => void;

  updateMonth: (
    year: number,
    monthIndex: number,
    patch: Partial<TradeCapitalMonth>,
    auditMessage?: string
  ) => void;
};

const STORAGE_KEY = "btc_engine_trade_capital_v2";

const TradeCapitalContext = createContext<TradeCapitalContextType | null>(null);

/* ---------------------------------------------
   PROVIDER
--------------------------------------------- */

export const TradeCapitalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [capital, setCapital] = useState(0);
  const [reserve, setReserve] = useState(0);
  const [btcAccumulated, setBtcAccumulated] = useState(0);
  const [profitReservePercent, setProfitReservePercent] = useState(30);
  const [years, setYears] = useState<TradeCapitalYear[]>([]);

  const currentYearNumber = new Date().getFullYear();

  /* LOAD */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    setCapital(data.capital ?? 0);
    setReserve(data.reserve ?? 0);
    setBtcAccumulated(data.btcAccumulated ?? 0);
    setProfitReservePercent(data.profitReservePercent ?? 30);
    setYears(data.years ?? []);
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        capital,
        reserve,
        btcAccumulated,
        profitReservePercent,
        years,
      })
    );
  }, [capital, reserve, btcAccumulated, profitReservePercent, years]);

  /* HELPERS */

  const getOrCreateYear = (
    prev: TradeCapitalYear[],
    yearNum: number,
    bancaAtual: number
  ): TradeCapitalYear[] => {
    const existing = prev.find((y) => y.year === yearNum);
    if (existing) return prev;

    const newYear: TradeCapitalYear = {
      year: yearNum,
      bancaInicial: bancaAtual,
      bancaFinal: bancaAtual,
      roiPercent: 0,
      totalAportes: 0,
      totalWithdraw: 0,
      totalFees: 0,
      totalTrades: 0,
      winrate: 0,
      months: [],
    };

    return [...prev, newYear];
  };

  const recalcYear = (year: TradeCapitalYear): TradeCapitalYear => {
    const bancaInicial = year.bancaInicial;
    const bancaFinal =
      year.months.length > 0
        ? year.months[year.months.length - 1].bancaFinal
        : bancaInicial;

    const totalAportes = year.months.reduce((s, m) => s + m.aporte, 0);
    const totalWithdraw = year.months.reduce((s, m) => s + m.withdraw, 0);
    const totalFees = year.months.reduce((s, m) => s + m.fees, 0);
    const totalTrades = year.months.reduce((s, m) => s + m.trades, 0);

    const winsSum = year.months.reduce(
      (s, m) => s + m.trades * (m.winrate / 100),
      0
    );
    const winrate =
      totalTrades > 0 ? (winsSum / totalTrades) * 100 : 0;

    const roiPercent =
      bancaInicial > 0
        ? ((bancaFinal - bancaInicial) / bancaInicial) * 100
        : 0;

    return {
      ...year,
      bancaFinal,
      roiPercent,
      totalAportes,
      totalWithdraw,
      totalFees,
      totalTrades,
      winrate,
    };
  };

  /* REGISTAR TRADE FECHADA */

  const registerClosedTrade = (
    trade: Trade,
    pnl: number,
    isWin: boolean = pnl > 0
  ) => {
    const d = new Date(trade.entryDate);
    const yearNum = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthName = d.toLocaleString("pt-PT", { month: "long" });

    const isProfit = pnl > 0;
    const reserveAdd = isProfit ? pnl * (profitReservePercent / 100) : 0;
    const capitalAdd = pnl - reserveAdd;

    setCapital((oldCapital) => {
      const newCapital = oldCapital + capitalAdd;
      setReserve((oldReserve) => oldReserve + reserveAdd);

      setYears((prev) => {
        let updated = getOrCreateYear(prev, yearNum, oldCapital);
        updated = updated.map((year) => {
          if (year.year !== yearNum) return year;

          let months = [...year.months];
          let month = months.find((m) => m.monthIndex === monthIndex);

          if (!month) {
            const pnlPercent =
              oldCapital > 0 ? (pnl / oldCapital) * 100 : 0;

            month = {
              monthIndex,
              monthName,
              bancaInicial: oldCapital,
              bancaFinal: newCapital,
              pnlUSDT: pnl,
              pnlPercent,
              targetPercent: -6,
              targetUSDT: ( -6 / 100 ) * oldCapital,
              aporte: 0,
              withdraw: 0,
              reserve: reserve + reserveAdd,
              btc: btcAccumulated,
              fees: 0,
              trades: 1,
              winrate: isWin ? 100 : 0,
              notes: "",
              auditLog: [],
            };
            months.push(month);
          } else {
            const newPnlUSDT = month.pnlUSDT + pnl;
            const newTrades = month.trades + 1;
            const winsApprox =
              (month.winrate / 100) * month.trades + (isWin ? 1 : 0);
            const newWinrate =
              newTrades > 0 ? (winsApprox / newTrades) * 100 : 0;

            month = {
              ...month,
              bancaFinal: newCapital,
              pnlUSDT: newPnlUSDT,
              pnlPercent:
                month.bancaInicial > 0
                  ? (newPnlUSDT / month.bancaInicial) * 100
                  : 0,
              targetUSDT:
                (month.targetPercent / 100) * month.bancaInicial,
              reserve: reserve + reserveAdd,
              btc: btcAccumulated,
              trades: newTrades,
              winrate: newWinrate,
            };

            months = months.map((m) =>
              m.monthIndex === monthIndex ? month! : m
            );
          }

          const recalc = recalcYear({ ...year, months });
          return recalc;
        });

        return updated;
      });

      return newCapital;
    });
  };

  /* APORTES */

  const addAporte = (value: number) => {
    if (value <= 0) return;

    const now = new Date();
    const yearNum = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthName = now.toLocaleString("pt-PT", { month: "long" });

    setCapital((oldCapital) => {
      const newCapital = oldCapital + value;

      setYears((prev) => {
        let updated = getOrCreateYear(prev, yearNum, oldCapital);
        updated = updated.map((year) => {
          if (year.year !== yearNum) return year;

          let months = [...year.months];
          let month = months.find((m) => m.monthIndex === monthIndex);

          if (!month) {
            month = {
              monthIndex,
              monthName,
              bancaInicial: oldCapital,
              bancaFinal: newCapital,
              pnlUSDT: 0,
              pnlPercent: 0,
              targetPercent: -6,
              targetUSDT: ( -6 / 100 ) * oldCapital,
              aporte: value,
              withdraw: 0,
              reserve,
              btc: btcAccumulated,
              fees: 0,
              trades: 0,
              winrate: 0,
              notes: "",
              auditLog: [],
            };
            months.push(month);
          } else {
            month = {
              ...month,
              bancaFinal: newCapital,
              aporte: month.aporte + value,
            };
            months = months.map((m) =>
              m.monthIndex === monthIndex ? month! : m
            );
          }

          const recalc = recalcYear({ ...year, months });
          return recalc;
        });

        return updated;
      });

      return newCapital;
    });
  };

  /* SAÍDAS */

  const removeCapital = (value: number) => {
    if (value <= 0) return;

    const now = new Date();
    const yearNum = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthName = now.toLocaleString("pt-PT", { month: "long" });

    setCapital((oldCapital) => {
      const newCapital = Math.max(0, oldCapital - value);

      setYears((prev) => {
        let updated = getOrCreateYear(prev, yearNum, oldCapital);
        updated = updated.map((year) => {
          if (year.year !== yearNum) return year;

          let months = [...year.months];
          let month = months.find((m) => m.monthIndex === monthIndex);

          if (!month) {
            month = {
              monthIndex,
              monthName,
              bancaInicial: oldCapital,
              bancaFinal: newCapital,
              pnlUSDT: 0,
              pnlPercent: 0,
              targetPercent: -6,
              targetUSDT: ( -6 / 100 ) * oldCapital,
              aporte: 0,
              withdraw: value,
              reserve,
              btc: btcAccumulated,
              fees: 0,
              trades: 0,
              winrate: 0,
              notes: "",
              auditLog: [],
            };
            months.push(month);
          } else {
            month = {
              ...month,
              bancaFinal: newCapital,
              withdraw: month.withdraw + value,
            };
            months = months.map((m) =>
              m.monthIndex === monthIndex ? month! : m
            );
          }

          const recalc = recalcYear({ ...year, months });
          return recalc;
        });

        return updated;
      });

      return newCapital;
    });
  };

  /* COMPRA BTC */

  const buyBTC = (value: number, btcPrice: number) => {
    if (value <= 0) return;
    if (value > reserve) return;
    if (btcPrice <= 0) return;

    const btc = value / btcPrice;

    setReserve((r) => r - value);
    setBtcAccumulated((b) => b + btc);
  };

  /* UPDATE MONTH (EDIÇÃO MANUAL) */

  const updateMonth = (
    yearNum: number,
    monthIndex: number,
    patch: Partial<TradeCapitalMonth>,
    auditMessage?: string
  ) => {
    setYears((prev) =>
      prev.map((year) => {
        if (year.year !== yearNum) return year;

        const months = year.months.map((m) => {
          if (m.monthIndex !== monthIndex) return m;

          const updated: TradeCapitalMonth = {
            ...m,
            ...patch,
          };

          // recalcular derivados básicos
          const pnlUSDT = updated.pnlUSDT;
          const bancaInicial = updated.bancaInicial;
          updated.pnlPercent =
            bancaInicial > 0 ? (pnlUSDT / bancaInicial) * 100 : 0;
          updated.targetUSDT =
            (updated.targetPercent / 100) * bancaInicial;

          // audit log
          const logEntry: MonthAuditEntry | null = auditMessage
            ? {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                message: auditMessage,
              }
            : null;

          return {
            ...updated,
            auditLog: logEntry
              ? [...(updated.auditLog ?? []), logEntry]
              : updated.auditLog,
          };
        });

        return recalcYear({ ...year, months });
      })
    );
  };

  /* DERIVADOS */

  const currentYear =
    years.find((y) => y.year === currentYearNumber) ?? null;

  const months = currentYear ? currentYear.months : [];

  return (
    <TradeCapitalContext.Provider
      value={{
        capital,
        reserve,
        btcAccumulated,
        profitReservePercent,
        years,
        currentYear,
        months,
        registerClosedTrade,
        addAporte,
        removeCapital,
        buyBTC,
        setProfitReservePercent,
        updateMonth,
      }}
    >
      {children}
    </TradeCapitalContext.Provider>
  );
};

export const useTradeCapital = () => {
  const ctx = useContext(TradeCapitalContext);
  if (!ctx)
    throw new Error(
      "useTradeCapital must be used inside TradeCapitalProvider"
    );
  return ctx;
};
