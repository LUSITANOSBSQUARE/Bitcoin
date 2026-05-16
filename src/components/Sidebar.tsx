import { useNavigation } from "../context/NavigationContext";

export const Sidebar = () => {
  const { page, navigate } = useNavigation();

  const hidden = page === "home"; // ⭐ Sidebar escondido na Home

  const menuItem = (label: string, target: string) => (
    <div
      onClick={() => navigate(target as any)}
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
        width: hidden ? 0 : 220,   // ⭐ Sidebar continua no layout
        overflow: "hidden",        // ⭐ Mas fica invisível
        background: "#000",
        borderRight: hidden ? "none" : "1px solid #111",
        height: "100vh",
        padding: hidden ? 0 : 20,
        boxSizing: "border-box",
        transition: "0.25s ease",  // ⭐ Transição suave
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
          {menuItem("Portfolio", "portfolio")}
        </>
      )}
    </div>
  );
};
