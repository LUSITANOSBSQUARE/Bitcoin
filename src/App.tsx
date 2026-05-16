import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { MainLayout } from "./layout/MainLayout";

const Router = () => {
  const { page } = useNavigation();

  if (page === "dashboard") return <DashboardPage />;
  return <HomePage />;
};

function App() {
  return (
    <NavigationProvider>
      <MainLayout>
        <Router />
      </MainLayout>
    </NavigationProvider>
  );
}

export default App;
