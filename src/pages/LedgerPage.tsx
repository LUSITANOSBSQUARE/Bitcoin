import React, { useMemo, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import type { Transaction } from "../context/PortfolioContext"; // ⭐ IMPORTANTE
import { TransactionFormModal } from "../components/TransactionFormModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

export const LedgerPage = () => {
  const { transactions, addTransaction, editTransaction, removeTransaction } =
    usePortfolio();

  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Transaction>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  /* ---------------- FILTER + SEARCH + SORT ---------------- */

  const filtered = useMemo(() => {
    let list = [...transactions];

    // 🔍 Pesquisa
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.date.toLowerCase().includes(s) ||
          t.amountBTC.toString().includes(s) ||
          t.totalEUR.toString().includes(s) ||
          t.priceEUR.toString().includes(s)
      );
    }

    // 📅 Filtro por ano
    if (filterYear !== "all") {
      list = list.filter((t) => t.date.startsWith(filterYear));
    }

    // 📅 Filtro por mês
    if (filterMonth !== "all") {
      list = list.filter((t) => t.date.slice(5, 7) === filterMonth);
    }

    // ↕ Ordenação
    list.sort((a, b) => {
      const A = a[sortField];
      const B = b[sortField];

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [transactions, search, sortField, sortDir, filterYear, filterMonth]);

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field: keyof Transaction) =>
    sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "•";

  /* ---------------- RENDER ---------------- */

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Ledger</h1>

      {/* 🔍 Pesquisa + Filtros */}
      <div style={styles.filtersRow}>
        <input
          placeholder="Pesquisar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          style={styles.select}
        >
          <option value="all">Ano</option>
          {Array.from(new Set(transactions.map((t) => t.date.slice(0, 4)))).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={styles.select}
        >
          <option value="all">Mês</option>
          {Array.from(new Set(transactions.map((t) => t.date.slice(5, 7)))).map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>

        <button style={styles.addButton} onClick={() => setShowAdd(true)}>
          + Adicionar
        </button>
      </div>

      {/* TABELA */}
      {filtered.length === 0 ? (
        <p style={styles.empty}>Nenhum registo encontrado.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort("date")}>
                Data {sortIcon("date")}
              </th>
              <th onClick={() => toggleSort("amountBTC")}>
                BTC {sortIcon("amountBTC")}
              </th>
              <th onClick={() => toggleSort("totalEUR")}>
                Total EUR {sortIcon("totalEUR")}
              </th>
              <th onClick={() => toggleSort("priceEUR")}>
                Preço/BTC {sortIcon("priceEUR")}
              </th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={i % 2 ? styles.rowAlt : undefined}>
                <td>{t.date}</td>
                <td style={styles.num}>{t.amountBTC}</td>
                <td style={styles.num}>{t.totalEUR.toFixed(2)} €</td>
                <td style={styles.num}>{t.priceEUR.toFixed(2)} €</td>

                <td>
                  <button style={styles.editBtn} onClick={() => setEditTx(t)}>
                    Editar
                  </button>

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
      )}

      {/* MODAIS */}
      {showAdd && (
        <TransactionFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={(tx) => {
            addTransaction({ id: crypto.randomUUID(), ...tx });
            setShowAdd(false);
          }}
        />
      )}

      {editTx && (
        <TransactionFormModal
          initial={editTx}
          onClose={() => setEditTx(null)}
          onSubmit={(tx) => {
            editTransaction({ id: editTx.id, ...tx });
            setEditTx(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            removeTransaction(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    marginBottom: 20,
  },

  /* 🔍 Pesquisa + Filtros */
  filtersRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
  },
  select: {
    padding: "10px 14px",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
  },

  addButton: {
    padding: "10px 18px",
    background: "#f7931a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    color: "#000",
  },

  empty: {
    color: "#aaa",
    marginTop: 10,
  },

  /* TABELA */
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#fff",
    marginTop: 10,
  },
  rowAlt: {
    background: "rgba(255,255,255,0.03)",
  },
  num: {
    textAlign: "right",
  },

  editBtn: {
    padding: "6px 12px",
    background: "#333",
    border: "1px solid #555",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    marginRight: 10,
  },
  deleteBtn: {
    padding: "6px 12px",
    background: "#d9534f",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
  },
};
