import { createContext, useContext, useState } from "react";

type Page =
  | "home"
  | "dashboard"
  | "portfolio"
  | "trades"
  | "market"; // ⭐ ADICIONADO

type NavContextType = {
  page: Page;
  navigate: (p: Page) => void;
};

const NavContext = createContext<NavContextType | null>(null);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [page, setPage] = useState<Page>("home");

  const navigate = (p: Page) => setPage(p);

  return (
    <NavContext.Provider value={{ page, navigate }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be inside NavigationProvider");
  return ctx;
};
