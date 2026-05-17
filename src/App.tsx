import { NavigationProvider } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { TradesProvider } from "./context/TradesContext";
import { CapitalProvider } from "./context/CapitalContext";
import { AlertsProvider } from "./context/AlertsContext";   // ⭐ Necessário para o Copilot
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  return (
    <AlertsProvider>
      <NavigationProvider>
        <PortfolioProvider>
          <TradesProvider>
            <CapitalProvider>
              <MainLayout />   {/* ⭐ Aqui é onde todas as páginas são renderizadas */}
            </CapitalProvider>
          </TradesProvider>
        </PortfolioProvider>
      </NavigationProvider>
    </AlertsProvider>
  );
};

export default App;
