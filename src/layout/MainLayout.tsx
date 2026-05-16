import { Sidebar } from "../components/Sidebar";
import { ContentContainer } from "./ContentContainer";

export const MainLayout = ({
  children,
  hideSidebar = false,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) => {
  return (
    <div style={{ display: "flex", background: "#000", minHeight: "100vh" }}>
      {!hideSidebar && <Sidebar />}
      <ContentContainer>{children}</ContentContainer>
    </div>
  );
};
