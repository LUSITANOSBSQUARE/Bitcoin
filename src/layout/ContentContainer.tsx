export const ContentContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "40px",
        boxSizing: "border-box",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </div>
  );
};
