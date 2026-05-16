import { useNavigation } from "../context/NavigationContext";
import { useEffect, useState } from "react";

import { useBitcoinData } from "../hooks/useBitcoinData";
import { useOnChainData } from "../hooks/useOnChainData";
import { useFearGreed } from "../hooks/useFearGreed";
import { useBTCDominance } from "../hooks/useBTCDominance";
import { useMarketIntelligence } from "../engine/useMarketIntelligence";

export const HomePage = () => {
  const { navigate } = useNavigation();

  const market = useBitcoinData();
  const onchain = useOnChainData();
  const fearGreed = useFearGreed();
  const dominance = useBTCDominance();
  const intel = useMarketIntelligence(market, onchain, fearGreed, dominance);

  const [marketText, setMarketText] = useState("A analisar mercado…");

  useEffect(() => {
    document.body.style.background =
      "radial-gradient(circle at top, #181818 0%, #0a0a0a 45%, #000 100%)";

    if (!intel || !market || !onchain) return;

    let text = "";

    if (intel.riskScore > 75) text = "O mercado está tenso e exige cautela";
    else if (intel.opportunityScore > 70) text = "O mercado oferece uma oportunidade interessante";
    else if ((fearGreed ?? 50) < 30) text = "O mercado está em modo de medo e desconto";
    else if ((fearGreed ?? 50) > 70) text = "O mercado está esticado e com excesso de confiança";
    else if (onchain.mempoolTxCount && onchain.mempoolTxCount > 200000)
      text = "A rede está congestionada e com custos elevados";
    else if (market.volatility24h > 8) text = "A volatilidade está elevada no curto prazo";
    else text = "O mercado mantém um comportamento equilibrado";

    setMarketText(text);

    return () => {
      document.body.style.background = "#000";
    };
  }, [intel, market, onchain, fearGreed]);

  return (
    <>
      <div style={backgroundGlow} />
      <div style={backgroundGrid} />
      <div style={noiseOverlay} />

      <div style={container}>
        <div style={logoWrapper}>
          <div style={logoAura} />
          <div style={logo}>₿</div>
        </div>

        <p style={subtitle}>{marketText}</p>

        {/* ⭐ NAVIGATION BUTTONS (COM CAPITAL + COPILOT) */}
        <div style={buttonRow}>
          {premiumButton("Dashboard", () => navigate("dashboard"))}
          {premiumButton("Portfolio", () => navigate("portfolio"))}
          {premiumButton("Capital", () => navigate("capital"))}
          {premiumButton("Trades", () => navigate("trades"))}
          {premiumButton("Mercado", () => navigate("market"))}
          {premiumButton("Copilot", () => navigate("tradecopilot"))} {/* ⭐ NOVO */}
        </div>

        <button
          onClick={() => navigate("dashboard")}
          style={mainButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow =
              "0 0 40px rgba(247,147,26,0.65)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 0 22px rgba(247,147,26,0.35)";
          }}
        >
          Entrar
        </button>

        <p style={footer}>Powered by BTC Engine</p>
      </div>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes auraPulse {
            0% { transform: scale(1); opacity: 0.45; }
            50% { transform: scale(1.15); opacity: 0.75; }
            100% { transform: scale(1); opacity: 0.45; }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
};

/* ---------------- BUTTON COMPONENT ---------------- */

const premiumButton = (label: string, action: () => void) => (
  <button
    onClick={action}
    style={secondaryButton}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.background = "rgba(247,147,26,0.12)";
      e.currentTarget.style.border =
        "1px solid rgba(247,147,26,0.55)";
      e.currentTarget.style.boxShadow =
        "0 0 18px rgba(247,147,26,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      e.currentTarget.style.border =
        "1px solid rgba(255,255,255,0.06)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {label}
  </button>
);

/* ---------------- STYLES ---------------- */

const container: React.CSSProperties = {
  position: "relative",
  zIndex: 5,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "40px 20px",
  color: "#fff",
  overflow: "hidden",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const backgroundGlow: React.CSSProperties = {
  position: "fixed",
  top: -250,
  left: "50%",
  transform: "translateX(-50%)",
  width: 800,
  height: 800,
  borderRadius: "50%",
  background: "rgba(247,147,26,0.13)",
  filter: "blur(130px)",
  zIndex: 0,
};

const backgroundGrid: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  zIndex: 0,
};

const noiseOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
  backgroundSize: "4px 4px",
  opacity: 0.25,
  zIndex: 1,
};

const logoWrapper: React.CSSProperties = {
  position: "relative",
  width: 180,
  height: 180,
  marginBottom: 34,
};

const logoAura: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: "rgba(247,147,26,0.25)",
  filter: "blur(40px)",
  animation: "auraPulse 4s ease-in-out infinite",
};

const logo: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg, #f7931a 0%, #ffbe5c 50%, #ff8f00 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 82,
  fontWeight: 900,
  color: "#000",
  animation: "float 5s ease-in-out infinite",
  boxShadow: "0 0 40px rgba(247,147,26,0.35)",
};

const subtitle: React.CSSProperties = {
  maxWidth: 760,
  color: "rgba(255,255,255,0.78)",
  fontSize: 22,
  lineHeight: 1.7,
  marginBottom: 40,
  fontWeight: 300,
  animation: "fadeIn 1.2s ease",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
  justifyContent: "center",
  marginBottom: 36,
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 22px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
  transition: "all 0.3s ease",
  backdropFilter: "blur(12px)",
};

const mainButton: React.CSSProperties = {
  padding: "18px 50px",
  borderRadius: 20,
  border: "none",
  background:
    "linear-gradient(135deg, #f7931a 0%, #ffbe5c 50%, #ff8f00 100%)",
  color: "#000",
  fontSize: 20,
  fontWeight: 900,
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 0 22px rgba(247,147,26,0.35)",
};

const footer: React.CSSProperties = {
  color: "rgba(255,255,255,0.3)",
  fontSize: 13,
  letterSpacing: 1,
  marginTop: 28,
};
                                                                    