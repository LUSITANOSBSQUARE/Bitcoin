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
      <ContentWrapper />
    </NavigationProvider>
  );
}

const ContentWrapper = () => {
  const { page } = useNavigation();

  // 👉 Se estiver na Home, NÃO mostra sidebar
  if (page === "home") {
    return (
      <div style={{ background: "#000", minHeight: "100vh" }}>
        <HomePage />
      </div>
    );
  }

  // 👉 Em todas as outras páginas, usa o layout com sidebar
  return (
    <MainLayout>
      <Router />
    </MainLayout>
  );
};

export default App;
