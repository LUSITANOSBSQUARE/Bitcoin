import React, { useMemo, useState } from "react";
import { useLedger } from "../context/LedgerContext";
import type { LedgerEntry } from "../context/LedgerContext";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

type MovementType = "DEPOSIT" | "WITHDRAW";

type FilterType = "ALL" | "DEPOSIT" | "WITHDRAW" | "TRADE" | "ENGINE";

export const LedgerPage: React.FC = () => {
  const { entries, clearLedger, removeEntry, addEntry } = useLedger();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof LedgerEntry>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [movementType, setMovementType] = useState<MovementType | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...entries];

    // filtro por tipo
    if (filterType !== "ALL") {
      list = list.filter((e) => {
        if (filterType === "DEPOSIT") return e.type === "DEPOSIT";
        if (filterType === "WITHDRAW") return e.type === "WITHDRAW";
        if (filterType === "TRADE")
          return e.type === "BUY" || e.type === "SELL";
        if (filterType === "ENGINE")
          return (
            e.type === "ENGINE_BUY" ||
            e.type === "ENGINE_SELL" ||
            e.meta?.kind === "DCA_BUY" ||
            e.meta?.kind === "DCA_DAILY_MARK"
          );
        return true;
      });
    }

    // pesquisa
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      list = list.filter((t) => {
        const metaStr = t.meta ? JSON.stringify(t.meta).toLowerCase() : "";
        return (
          t.type.toLowerCase().includes(s) ||
          t.date.toLowerCase().includes(s) ||
          t.amountEUR.toString().includes(s) ||
          (t.amountBTC?.toString().includes(s) ?? false) ||
          metaStr.includes(s)
        );
      });
    }

    // ordenação
    list.sort((a, b) => {
      const A = a[sortField] as any;
      const B = b[sortField] as any;

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [entries, search, sortField, sortDir, filterType]);

  const toggleSort = (field: keyof LedgerEntry) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field: keyof LedgerEntry) =>
    sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "•";

  const typeIcon = (t: LedgerEntry): string => {
    switch (t.type) {
      case "DEPOSIT":
        return "🟩";
      case "WITHDRAW":
        return "🟥";
      case "BUY":
        return "🟧";
      case "SELL":
        return "🟦";
      case "ENGINE_BUY":
      case "ENGINE_SELL":
        return "🟪";
      default:
        return "⬜";
    }
  };

  const typeLabel = (t: LedgerEntry): string => {
    if (t.meta?.kind === "DCA_BUY") return "DCA BUY";
    if (t.meta?.kind === "DCA_DAILY_MARK") return "DCA MARK";
    return t.type;
  };

  const typeColor = (t: LedgerEntry): string => {
    if (t.meta?.kind === "DCA_BUY" || t.meta?.kind === "DCA_DAILY_MARK")
      return "#f97316";
    switch (t.type) {
      case "DEPOSIT":
        return "#22c55e";
      case "WITHDRAW":
        return "#f97316";
      case "BUY":
        return "#38bdf8";
      case "SELL":
        return "#f43f5e";
      case "ENGINE_BUY":
      case "ENGINE_SELL":
        return "#a855f7";
      default:
        return "#e5e7eb";
    }
  };

  const handleExportCSV = async () => {
    const header = [
      "id",
      "date",
      "type",
      "amountEUR",
      "amountBTC",
      "priceEUR",
      "meta",
    ];
    const rows = filtered.map((e) => [
      e.id,
      e.date,
      e.type,
      e.amountEUR ?? "",
      e.amountBTC ?? "",
      (e as any).priceEUR ?? "",
      e.meta ? JSON.stringify(e.meta) : "",
    ]);

    const csv =
      header.join(";") +
      "\n" +
      rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");

    try {
      await navigator.clipboard.writeText(csv);
      setExportMessage("CSV copiado para o clipboard.");
      setTimeout(() => setExportMessage(null), 2500);
    } catch {
      setExportMessage("Não foi possível copiar para o clipboard.");
      setTimeout(() => setExportMessage(null), 2500);
    }
  };

  const handleCreateMovement = (
    type: MovementType,
    amount: number,
    dateStr: string,
    note?: string
  ) => {
    const isoDate = new Date(dateStr).toISOString();

    addEntry({
      id: crypto.randomUUID(),
      type,
      amountEUR: amount,
      amountBTC: 0,
      date: isoDate,
      meta: {
        source: "manual",
        note: note || undefined,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Ledger</h1>

        <div style={styles.headerRight}>
          {exportMessage && (
            <span style={styles.exportMessage}>{exportMessage}</span>
          )}
          <button style={styles.exportButton} onClick={handleExportCSV}>
            Exportar CSV
          </button>
          <button
            style={styles.clearButton}
            onClick={() => {
              if (
                window.confirm(
                  "Tens a certeza que queres limpar TODO o Ledger?"
                )
              ) {
                clearLedger();
              }
            }}
          >
            Limpar Ledger
          </button>
        </div>
      </div>

      <div style={styles.topActionsRow}>
        <div style={styles.filtersRow}>
          <input
            placeholder="Pesquisar por tipo, data, valor, meta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.filterButtons}>
            <FilterButton
              label="Todos"
              active={filterType === "ALL"}
              onClick={() => setFilterType("ALL")}
            />
            <FilterButton
              label="Deposits"
              active={filterType === "DEPOSIT"}
              onClick={() => setFilterType("DEPOSIT")}
            />
            <FilterButton
              label="Withdraws"
              active={filterType === "WITHDRAW"}
              onClick={() => setFilterType("WITHDRAW")}
            />
            <FilterButton
              label="Trades"
              active={filterType === "TRADE"}
              onClick={() => setFilterType("TRADE")}
            />
            <FilterButton
              label="Engine"
              active={filterType === "ENGINE"}
              onClick={() => setFilterType("ENGINE")}
            />
          </div>
        </div>

        <div style={styles.movementButtons}>
          <button
            style={styles.depositButton}
            onClick={() => setMovementType("DEPOSIT")}
          >
            + Adicionar Depósito
          </button>
          <button
            style={styles.withdrawButton}
            onClick={() => setMovementType("WITHDRAW")}
          >
            – Registar Saída
          </button>
        </div>
      </div>

      <div style={styles.separator} />

      {filtered.length === 0 ? (
        <p style={styles.empty}>Nenhum registo encontrado.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => toggleSort("date")}>
                  Data {sortIcon("date")}
                </th>
                <th onClick={() => toggleSort("type")}>
                  Tipo {sortIcon("type")}
                </th>
                <th>Detalhe</th>
                <th onClick={() => toggleSort("amountEUR")}>
                  EUR {sortIcon("amountEUR")}
                </th>
                <th onClick={() => toggleSort("amountBTC")}>
                  BTC {sortIcon("amountBTC")}
                </th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={i % 2 ? styles.rowAlt : undefined}>
                  <td style={styles.dateCell}>
                    {new Date(t.date).toLocaleString()}
                  </td>
                  <td style={styles.typeCell}>
                    <span style={{ marginRight: 6 }}>{typeIcon(t)}</span>
                    <span style={{ color: typeColor(t), fontWeight: 600 }}>
                      {typeLabel(t)}
                    </span>
                  </td>
                  <td style={styles.metaCell}>
                    {t.meta?.kind && (
                      <span style={styles.metaTag}>{t.meta.kind}</span>
                    )}
                    {t.meta?.note && (
                      <span style={styles.metaNote}>{t.meta.note}</span>
                    )}
                    {(t as any).priceEUR && (
                      <span style={styles.metaPrice}>
                        {(t as any).priceEUR.toFixed(2)} €/BTC
                      </span>
                    )}
                  </td>
                  <td style={styles.num}>
                    {t.amountEUR != null
                      ? `${t.amountEUR.toFixed(2)} €`
                      : "-"}
                  </td>
                  <td style={styles.num}>
                    {t.amountBTC != null ? t.amountBTC : "-"}
                  </td>

                  <td style={styles.actionsCell}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => setDeleteId(t.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            removeEntry(deleteId);
            setDeleteId(null);
          }}
        />
      )}

      {movementType && (
        <FundMovementModal
          type={movementType}
          onClose={() => setMovementType(null)}
          onSubmit={(amount, date, note) => {
            handleCreateMovement(movementType, amount, date, note);
            setMovementType(null);
          }}
        />
      )}
    </div>
  );
};

/* ---------------- MODAL DEPOSIT/WITHDRAW ---------------- */

const FundMovementModal: React.FC<{
  type: MovementType;
  onClose: () => void;
  onSubmit: (amount: number, date: string, note?: string) => void;
}> = ({ type, onClose, onSubmit }) => {
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>("");

  const isDeposit = type === "DEPOSIT";

  const handleConfirm = () => {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) return;
    onSubmit(value, date, note.trim() || undefined);
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isDeposit ? "Adicionar Depósito" : "Registar Saída"}
          </h2>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Valor (€)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.modalInput}
              placeholder="0.00"
            />
          </div>

          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.modalInput}
            />
          </div>

          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Nota (opcional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.modalTextarea}
              placeholder="Ex: transferência bancária, ajuste manual, etc."
            />
          </div>

          <div style={styles.modalInfo}>
            {isDeposit ? (
              <>
                Este depósito aumenta o capital total disponível para o
                assistente de capital. O impacto é visível na página de
                CapitalControl (Total Depositado, Liquidez, Runway).
              </>
            ) : (
              <>
                Esta saída reduz o capital disponível. Usa isto para levantar
                fundos ou ajustar o capital sob gestão sem mexer no histórico de
                trades.
              </>
            )}
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.modalCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            style={styles.modalConfirm}
            onClick={handleConfirm}
            disabled={!amount || Number(amount) <= 0}
          >
            {isDeposit ? "Registar Depósito" : "Registar Saída"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- COMPONENTES AUXILIARES ---------------- */

const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    style={{
      ...styles.filterButton,
      ...(active ? styles.filterButtonActive : {}),
    }}
    onClick={onClick}
  >
    {label}
  </button>
);

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 32,
    maxWidth: 1200,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
  },
  exportMessage: {
    fontSize: 12,
    color: "#f97316",
  },
  exportButton: {
    padding: "8px 14px",
    background: "#111827",
    borderRadius: 8,
    border: "1px solid #374151",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 13,
  },
  clearButton: {
    padding: "8px 14px",
    background: "#b91c1c",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
    fontSize: 13,
  },
  topActionsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  filtersRow: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    background: "#020617",
    border: "1px solid #1f2933",
    borderRadius: 8,
    color: "#e5e7eb",
    fontSize: 14,
  },
  filterButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #374151",
    background: "#020617",
    color: "#9ca3af",
    fontSize: 12,
    cursor: "pointer",
  },
  filterButtonActive: {
    background: "#f97316",
    borderColor: "#f97316",
    color: "#111827",
  },
  movementButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  depositButton: {
    padding: "10px 16px",
    background: "#16a34a",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  withdrawButton: {
    padding: "10px 16px",
    background: "#f97316",
    borderRadius: 8,
    border: "none",
    color: "#111827",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  separator: {
    borderTop: "1px solid #f9731633",
    margin: "16px 0",
  },
  empty: {
    color: "#9ca3af",
    marginTop: 10,
  },
  tableWrapper: {
    maxHeight: 520,
    overflowY: "auto",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#020617",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#e5e7eb",
    fontSize: 13,
  },
  rowAlt: {
    background: "rgba(15,23,42,0.7)",
  },
  dateCell: {
    whiteSpace: "nowrap",
    padding: "8px 10px",
    borderBottom: "1px solid #111827",
  },
  typeCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #111827",
    whiteSpace: "nowrap",
  },
  metaCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #111827",
    fontSize: 12,
    color: "#9ca3af",
  },
  metaTag: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid #4b5563",
    marginRight: 6,
    fontSize: 11,
  },
  metaNote: {
    display: "inline-block",
    marginRight: 6,
  },
  metaPrice: {
    display: "inline-block",
    color: "#f97316",
  },
  num: {
    textAlign: "right",
    padding: "8px 10px",
    borderBottom: "1px solid #111827",
    whiteSpace: "nowrap",
  },
  actionsCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #111827",
    textAlign: "right",
  },
  deleteBtn: {
    padding: "6px 10px",
    background: "#b91c1c",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },

  /* MODAL */
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    width: 420,
    maxWidth: "90%",
    background: "#020617",
    borderRadius: 16,
    border: "1px solid #f97316",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #f9731633",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#f97316",
  },
  modalBody: {
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  modalLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  modalInput: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #1f2933",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: 14,
  },
  modalTextarea: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #1f2933",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: 13,
    minHeight: 60,
    resize: "vertical",
  },
  modalInfo: {
    marginTop: 4,
    fontSize: 12,
    color: "#f97316",
  },
  modalFooter: {
    padding: "10px 18px",
    borderTop: "1px solid #f9731633",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalCancel: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #4b5563",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 13,
  },
  modalConfirm: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#f97316",
    color: "#111827",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};
