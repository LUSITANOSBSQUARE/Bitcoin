import { createContext, useContext, useState } from "react";
import type { TradeAlert } from "../hooks/useTradeCopilot";

type AlertsContextType = {
  alerts: TradeAlert[];
  pushAlert: (a: TradeAlert) => void;
  dismissAlert: (id: string) => void;
};

const AlertsContext = createContext<AlertsContextType | null>(null);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);

  const pushAlert = (a: TradeAlert) => {
    setAlerts((prev) => {
      if (prev.find((x) => x.id === a.id)) return prev;
      return [...prev, a];
    });
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertsContext.Provider value={{ alerts, pushAlert, dismissAlert }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be inside AlertsProvider");
  return ctx;
};
