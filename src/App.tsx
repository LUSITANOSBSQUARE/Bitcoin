import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { PortfolioProvider } from "./context/PortfolioContext";

import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { PortfolioPage } from "./pages/PortfolioPage";

import { MainLayout } from "./layout/MainLayout";

const Router = () => {
  const { page } = useNavigation();

  if (page === "dashboard") return <DashboardPage />;
  if (page === "portfolio") return <PortfolioPage />;
  return <HomePage />;
};

const ContentWrapper = () => {
  const { page } = useNavigation();

  return (
    <MainLayout hideSidebar={page === "home"}>
      <div key={page} style={{ width: "100%", transition: "opacity 0.2s ease" }}>
        <Router />
      </div>
    </MainLayout>
  );
};

function App() {
  return (
    <NavigationProvider>
      <PortfolioProvider>
        <ContentWrapper />
      </PortfolioProvider>
    </NavigationProvider>
  );
}

export default App;
