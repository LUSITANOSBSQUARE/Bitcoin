export const MetricCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: 16,
        background: "rgba(0,0,0,0.55)", // vidro premium
        border: "1px solid rgba(247,147,26,0.35)", // borda laranja fina
        backdropFilter: "blur(14px)",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {label}
      </p>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: 0,
          color: "#fff", // números sempre brancos
          letterSpacing: 0.3,
        }}
      >
        {value}
      </h2>
    </div>
  );
};
