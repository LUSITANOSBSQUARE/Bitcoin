import { Sidebar } from "../components/Sidebar";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: "flex", background: "#000", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 40 }}>{children}</div>
    </div>
  );
};
