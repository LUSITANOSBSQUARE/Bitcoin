import { NavigationProvider } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { TradesProvider } from "./context/TradesContext";
import { CapitalProvider } from "./context/CapitalContext";
import { AlertsProvider } from "./context/AlertsContext";
import { LedgerProvider } from "./context/LedgerContext";
import { TradeCapitalProvider } from "./context/TradeCapitalContext"; // ⭐ NOVO
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  return (
    <LedgerProvider>               
      <AlertsProvider>
        <NavigationProvider>
          <PortfolioProvider>      
            <TradesProvider>
              <CapitalProvider>    
                <TradeCapitalProvider>   {/* ⭐ ADICIONADO AQUI */}
                  <MainLayout />         
                </TradeCapitalProvider>
              </CapitalProvider>
            </TradesProvider>
          </PortfolioProvider>
        </NavigationProvider>
      </AlertsProvider>
    </LedgerProvider>
  );
};

export default App;
