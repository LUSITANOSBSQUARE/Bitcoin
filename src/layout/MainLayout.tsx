import { Sidebar } from "../components/Sidebar";
import { useNavigation } from "../context/NavigationContext";

import { HomePage } from "../pages/HomePage";
import { DashboardPage } from "../pages/DashboardPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { TradesPage } from "../pages/TradesPage";
import { MarketPage } from "../pages/MarketPage"; // ⭐ IMPORTANTE

export const MainLayout = () => {
  const { page } = useNavigation();

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage />;
      case "dashboard":
        return <DashboardPage />;
      case "portfolio":
        return <PortfolioPage />;
      case "trades":
        return <TradesPage />;
      case "market":               // ⭐ AQUI ESTÁ O QUE FALTAVA
        return <MarketPage />;
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
                                                                                         