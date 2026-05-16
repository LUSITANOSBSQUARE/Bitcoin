import { useNavigation } from "../context/NavigationContext";

export const Sidebar = () => {
  const { page, navigate } = useNavigation();

  const menuItem = (label: string, target: "home" | "dashboard") => (
    <div
      onClick={() => navigate(target)}
      style={{
        padding: "14px 20px",
        cursor: "pointer",
        background: page === target ? "#111" : "transparent",
        borderRadius: 8,
        marginBottom: 8,
        color: page === target ? "#f7931a" : "#fff",
        fontWeight: page === target ? "bold" : "normal",
        transition: "0.2s",
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      style={{
        width: 220,
        background: "#000",
        borderRight: "1px solid #111",
        height: "100vh",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#f7931a",
          marginBottom: 40,
        }}
      >
        ₿ Engine
      </div>

      {menuItem("Home", "home")}
      {menuItem("Dashboard", "dashboard")}
    </div>
  );
};
