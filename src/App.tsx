import { NavigationProvider } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { TradesProvider } from "./context/TradesContext";
import { CapitalProvider } from "./context/CapitalContext";
import { AlertsProvider } from "./context/AlertsContext";   // ⭐ ADICIONADO
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  return (
    <AlertsProvider> {/* ⭐ OBRIGATÓRIO PARA O COPILOT */}
      <NavigationProvider>
        <PortfolioProvider>
          <TradesProvider>
            <CapitalProvider>
              <MainLayout />
            </CapitalProvider>
          </TradesProvider>
        </PortfolioProvider>
      </NavigationProvider>
    </AlertsProvider>
  );
};

export default App;
