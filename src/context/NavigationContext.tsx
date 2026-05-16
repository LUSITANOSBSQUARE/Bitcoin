import { createContext, useContext, useState } from "react";

type Page = "home" | "dashboard";

interface NavigationContextType {
  page: Page;
  navigate: (p: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [page, setPage] = useState<Page>("home");

  const navigate = (p: Page) => setPage(p);

  return (
    <NavigationContext.Provider value={{ page, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
};
