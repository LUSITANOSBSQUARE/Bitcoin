import { NavigationProvider } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { TradesProvider } from "./context/TradesContext";
import { CapitalProvider } from "./context/CapitalContext";
import { AlertsProvider } from "./context/AlertsContext";
import { LedgerProvider } from "./context/LedgerContext";   // ⭐ AGORA EXISTE
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  return (
    <LedgerProvider>               {/* ⭐ Ledger no topo */}
      <AlertsProvider>
        <NavigationProvider>
          <PortfolioProvider>      {/* ⭐ Portfolio lê do Ledger */}
            <TradesProvider>
              <CapitalProvider>    {/* ⭐ Capital lê do Portfolio */}
                <MainLayout />     {/* ⭐ Todas as páginas */}
              </CapitalProvider>
            </TradesProvider>
          </PortfolioProvider>
        </NavigationProvider>
      </AlertsProvider>
    </LedgerProvider>
  );
};

export default App;
