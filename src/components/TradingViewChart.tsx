import React, { useEffect, useRef } from "react";

export const TradingViewChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Evita duplicar widgets ao navegar
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (!(window as any).TradingView) return;

      new (window as any).TradingView.widget({
        autosize: true,
        symbol: "BINANCE:BTCEUR", // BTC/EUR
        interval: "60",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tv_chart_container",
      });
    };

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      id="tv_chart_container"
      ref={containerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};
