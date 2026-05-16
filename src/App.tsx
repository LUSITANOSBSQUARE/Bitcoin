import { NavigationProvider } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { TradesProvider } from "./context/TradesContext";
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  return (
    <NavigationProvider>
      <PortfolioProvider>
        <TradesProvider>
          <MainLayout />
        </TradesProvider>
      </PortfolioProvider>
    </NavigationProvider>
  );
};

export default App;
