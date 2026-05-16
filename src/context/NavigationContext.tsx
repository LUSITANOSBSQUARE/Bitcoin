import { createContext, useContext, useState } from "react";

//
// 🔥 DEFINIÇÃO COMPLETA DAS PÁGINAS
// — Inclui todas as páginas reais do teu projeto
// — Inclui o TradeCopilot
//
export type Page =
  | "home"
  | "dashboard"
  | "portfolio"
  | "trades"
  | "capital"
  | "tradecopilot"
  | "market";

//
// 🔥 TIPO DO CONTEXTO
//
type NavContextType = {
  page: Page;
  navigate: (p: Page) => void;
};

//
// 🔥 CRIAÇÃO DO CONTEXTO
//
const NavContext = createContext<NavContextType | null>(null);

//
// 🔥 PROVIDER PRINCIPAL
//
export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [page, setPage] = useState<Page>("home");

  const navigate = (p: Page) => {
    setPage(p);
  };

  return (
    <NavContext.Provider value={{ page, navigate }}>
      {children}
    </NavContext.Provider>
  );
};

//
// 🔥 HOOK PERSONALIZADO
//
export const useNavigation = () => {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error("useNavigation must be inside NavigationProvider");
  }
  return ctx;
};
