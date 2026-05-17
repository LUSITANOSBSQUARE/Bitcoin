import { Sidebar } from "../components/Sidebar";
import { useNavigation } from "../context/NavigationContext";

/* ⭐ IMPORTA TODAS AS PÁGINAS */
import { HomePage } from "../pages/HomePage";
import { DashboardPage } from "../pages/DashboardPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { LedgerPage } from "../pages/LedgerPage";
import { TradesPage } from "../pages/TradesPage";
import { MarketPage } from "../pages/MarketPage";
import { CapitalControlPage } from "../pages/CapitalControlPage";
import { TradeCopilotPage } from "../pages/TradeCopilotPage";
import { TradeControlPage } from "../pages/TradeControlPage";   // ⭐ NOVO

export const MainLayout = () => {
  const { page } = useNavigation();

  /* ⭐ ROUTER INTERNO */
  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage />;

      case "dashboard":
        return <DashboardPage />;

      case "market":
        return <MarketPage />;

      case "portfolio":
        return <PortfolioPage />;

      case "ledger":
        return <LedgerPage />;

      case "capital":
        return <CapitalControlPage />;

      case "trades":
        return <TradesPage />;

      case "tradecopilot":
        return <TradeCopilotPage />;

      case "tradecontrol":               // ⭐ NOVO
        return <TradeControlPage />;

      default:
        return <HomePage />;
    }
  };

  const sidebarWidth = page === "home" ? 0 : 220;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: 30,
          marginLeft: sidebarWidth,
          transition: "0.25s ease",
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
};
                                                                  