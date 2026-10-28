
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
} from "lucide-react";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const today = () => {
  const date = new Date();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: today(),
});

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Salary",
  "Business",
  "Investment",
  "Other",
];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (path = "", options = {}) => {
    let response;

    try {
      response = await fetch(`${API_URL}/api/transactions${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    } catch {
      throw new Error(
        "Cannot reach the API. Check the backend and VITE_API_URL."
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected API response. Check your backend API.");
      }

      setTransactions(data);
    } catch (err) {
      setError(err.message || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesType = filter === "all" || item.type === filter;
      const query = search.toLowerCase();

      const matchesSearch = [
        item.title,
        item.category,
        item.type,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesType && matchesSearch;
    });
  }, [transactions, filter, search]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item._id);

    setForm({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10),
    });

    setError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !form.date
    ) {
      setError("Enter a title, valid positive amount, category, and date.");
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category.trim(),
      date: new Date(`${form.date}T12:00:00.000Z`).toISOString(),
    };

    try {
      if (editingId) {
        await request(`/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Transaction updated successfully.");
      } else {
        await request("", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Transaction added successfully.");
      }

      closeForm();
      await loadTransactions();
    } catch (err) {
      setError(err.message || "Unable to save the transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await request(`/${id}`, { method: "DELETE" });
      setNotice("Transaction deleted successfully.");
      await loadTransactions();
    } catch (err) {
      setError(err.message || "Unable to delete the transaction.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={23} />
          </div>
          <div>
            <h2>PennyWise</h2>
            <p>Personal finance</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          <Wallet size={19} />
          Dashboard
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">ET</div>
          <div>
            <strong>My Finances</strong>
            <p>Expense Tracker</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Expense Tracker</h1>
            <p className="subtitle">
              Manage your money. Understand your spending.
            </p>
          </div>

          <button className="primary-button" onClick={openAddForm}>
            <Plus size={18} />
            Add transaction
          </button>
        </header>

        {notice && (
          <div className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button onClick={loadTransactions}>
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        <section className="summary-grid">
          <SummaryCard
            title="Total balance"
            amount={totals.balance}
            icon={<Wallet size={21} />}
            variant="balance"
            description="Income minus expenses"
          />

          <SummaryCard
            title="Total income"
            amount={totals.income}
            icon={<TrendingUp size={21} />}
            variant="income"
            description="Money received"
          />

          <SummaryCard
            title="Total expenses"
            amount={totals.expenses}
            icon={<TrendingDown size={21} />}
            variant="expense"
            description="Money spent"
          />
        </section>

        <section className="transactions-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>Your income and expenses in one place</p>
            </div>

            <button
              className="icon-button"
              onClick={loadTransactions}
              aria-label="Refresh transactions"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                aria-label="Search transactions"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter transactions"
            >
              <option value="all">All transactions</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw className="spin" size={28} />
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ReceiptText size={30} />
              </div>
              <h3>No transactions found</h3>
              <p>Add a transaction to start tracking your finances.</p>
              <button className="secondary-button" onClick={openAddForm}>
                <Plus size={16} />
                Add your first transaction
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>TRANSACTION</th>
                    <th>CATEGORY</th>
                    <th>DATE</th>
                    <th>TYPE</th>
                    <th className="amount-column">AMOUNT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="transaction-title">
                          <div className={`transaction-icon ${item.type}`}>
                            {item.type === "income" ? (
                              <ArrowDownRight size={18} />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>
                          <strong>{item.title}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>

                      <td className="date-cell">{formatDate(item.date)}</td>

                      <td>
                        <span className={`type-label ${item.type}`}>
                          {item.type}
                        </span>
                      </td>

                      <td className={`amount-cell ${item.type}`}>
                        {item.type === "income" ? "+" : "−"}
                        {formatMoney(item.amount)}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="action-button"
                            onClick={() => openEditForm(item)}
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="action-button delete-action"
                            onClick={() => handleDelete(item._id)}
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="panel-footer">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </section>

        <footer className="footer">
          PennyWise · Expense Tracker Mini-Project
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">
                  {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                </p>
                <h2 id="form-title">
                  {editingId ? "Edit transaction" : "Add transaction"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="transaction-title">
                Transaction title
              </label>
              <input
                id="transaction-title"
                required
                maxLength={100}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Monthly salary"
              />

              <label className="field-label">Transaction type</label>
              <div className="type-selector">
                <button
                  type="button"
                  className={
                    form.type === "expense"
                      ? "selected expense-option"
                      : ""
                  }
                  onClick={() =>
                    setForm({ ...form, type: "expense", category: "Food" })
                  }
                >
                  <TrendingDown size={17} />
                  Expense
                </button>

                <button
                  type="button"
                  className={
                    form.type === "income"
                      ? "selected income-option"
                      : ""
                  }
                  onClick={() =>
                    setForm({ ...form, type: "income", category: "Salary" })
                  }
                >
                  <TrendingUp size={17} />
                  Income
                </button>
              </div>

              <label className="field-label" htmlFor="transaction-amount">
                Amount (₹)
              </label>
              <input
                id="transaction-amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="0.00"
              />

              <label className="field-label" htmlFor="transaction-category">
                Category
              </label>
              <select
                id="transaction-category"
                required
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label className="field-label" htmlFor="transaction-date">
                Date
              </label>
              <input
                id="transaction-date"
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />

              {error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Add transaction"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, amount, icon, variant, description }) {
  return (
    <article className={`summary-card ${variant}`}>
      <div className="summary-top">
        <span>{title}</span>
        <div className={`summary-icon ${variant}`}>{icon}</div>
      </div>

      <div className="summary-amount">{formatMoney(amount)}</div>
      <p>{description}</p>
    </article>
  );
}
