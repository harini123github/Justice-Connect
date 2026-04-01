import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CaseList() {
  const [cases, setCases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const nav = useNavigate();
  const userId = localStorage.getItem("id");
  const role = localStorage.getItem("role");
  useEffect(() => {
    axios.get("http://localhost:5000/cases").then((res) => {
      let data = res.data;

      if (role === "User") {
        data = data.filter(
          (c) =>
            String(c.userid) === String(userId) ||
            String(c.otheruser) === String(userId),
        );
      } else if (role === "Judge") {
        data = data.filter((c) => String(c.judgeid) === String(userId));
      } else if (role === "Lawyer") {
        data = data.filter((c) => String(c.lawyerid) === String(userId));
      }

      setCases(data);
      setFiltered(data);
    });
  }, [role, userId]);

  // 🔥 FILTER LOGIC
  useEffect(() => {
    let data = [...cases];

    if (search) {
      data = data.filter((c) =>
        c.casesubject.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (type) {
      data = data.filter((c) => c.case_type === type);
    }

    setFiltered(data);
  }, [search, type, cases]);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>⚖ Case Dashboard</h2>
        <p>Track and manage all legal cases intelligently</p>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div style={styles.filterBar}>
        <input
          style={styles.search}
          placeholder="🔍 Search case..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="civil">Civil</option>
          <option value="criminal">Criminal</option>
          <option value="cyber">Cyber</option>
        </select>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {filtered.map((c) => (
          <div key={c.caseid} style={styles.card}>
            <div style={styles.cardHeader}>
              <h5>{c.casesubject}</h5>
              <span style={getStatusStyle(c.status)}>{c.status}</span>
            </div>

            <div style={styles.cardBody}>
              <p>
                <b>👤</b> {c.user}
              </p>
              <p>
                <b>⚖</b> {c.judge}
              </p>
              <p>
                <b>👨‍💼</b> {c.lawyer || "Not Assigned"}
              </p>
              <p>
                <b>🆚</b> {c.otherusername || "N/A"}
              </p>

              <div style={styles.badgeBox}>
                📊 {c.predicted_hearings || "N/A"} Hearings
              </div>

              {/* TYPE BADGE */}
              {c.case_type && (
                <div style={styles.typeBadge}>{c.case_type.toUpperCase()}</div>
              )}

              {c.contentsummarise && (
                <p style={styles.summary}>
                  {c.contentsummarise.substring(0, 100)}...
                </p>
              )}
            </div>

            <div style={styles.actions}>
              <button
                style={styles.primaryBtn}
                onClick={() => nav(`/case/${c.caseid}`)}
              >
                View
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() => nav(`/case/${c.caseid}/similar`)}
              >
                Similar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={styles.empty}>
          <h4>No matching cases</h4>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    padding: "40px",
    color: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
  },

  /* 🔥 FILTER BAR */
  filterBar: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    justifyContent: "center",
  },

  search: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "250px",
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  card: {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  cardBody: {
    fontSize: "14px",
  },

  badgeBox: {
    marginTop: "10px",
    background: "#ffd166",
    color: "#000",
    padding: "5px 10px",
    borderRadius: "6px",
    display: "inline-block",
  },

  typeBadge: {
    marginTop: "8px",
    background: "#00c6ff",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block",
    fontSize: "12px",
  },

  summary: {
    marginTop: "10px",
    fontSize: "13px",
    opacity: 0.8,
  },

  actions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
  },

  primaryBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    background: "#0072ff",
    color: "#fff",
    border: "none",
  },

  secondaryBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    background: "transparent",
    border: "1px solid #ccc",
    color: "#fff",
  },

  empty: {
    textAlign: "center",
    marginTop: "40px",
  },
};

function getStatusStyle(status) {
  if (status === "OPEN") return { color: "#00ff9d" };
  if (status === "HEARING") return { color: "#ffd166" };
  return { color: "#ff4d4d" };
}
