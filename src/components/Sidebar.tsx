import { useNavigation } from "../context/NavigationContext";

export const Sidebar = () => {
  const { page, navigate } = useNavigation();

  const hidden = page === "home";

  const menuItem = (label: string, target: any) => (
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
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: hidden ? 0 : 220,
        overflow: "hidden",
        background: "#000",
        borderRight: hidden ? "none" : "1px solid #111",
        padding: hidden ? 0 : 20,
        boxSizing: "border-box",
        transition: "0.25s ease",
        zIndex: 1000,
      }}
    >
      {!hidden && (
        <>
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
          {menuItem("Mercado", "market")}
          {menuItem("Portfolio", "portfolio")}
          {menuItem("Capital", "capital")}   {/* ⭐ NOVO */}
          {menuItem("Trades", "trades")}
          {menuItem("Copilot", "tradecopilot")} 
        </>
      )}
    </div>
  );
};
