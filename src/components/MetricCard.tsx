export const MetricCard = ({
  label,
  value,
  color = "#f7931a",
}: {
  label: string;
  value: string | number;
  color?: string;
}) => {
  return (
    <div
      style={{
        background: "#111",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #222",
        width: 220,
      }}
    >
      <p style={{ color: "#aaa", marginBottom: 8 }}>{label}</p>
      <h2 style={{ fontSize: 26, fontWeight: "bold", color }}>{value}</h2>
    </div>
  );
};
