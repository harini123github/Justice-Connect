import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function SimilarCases() {
  const { id } = useParams();
  const nav = useNavigate();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/cases/${id}/similar`)
      .then((res) => setCases(res.data));
  }, [id]);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>🔎 Similar Cases</h2>
        <p>AI-powered matching based on case patterns</p>
        <span style={styles.caseTag}>Case #{id}</span>
      </div>

      {/* EMPTY */}
      {cases.length === 0 && (
        <div style={styles.empty}>No similar cases found</div>
      )}

      {/* GRID */}
      <div style={styles.grid}>
        {cases.map((c) => (
          <div key={c.caseid} style={styles.card}>
            {/* TOP */}
            <div style={styles.cardHeader}>
              <h5>{c.casesubject}</h5>
              <span style={getStatusStyle(c.status)}>{c.status}</span>
            </div>

            {/* SUMMARY */}
            <div style={styles.section}>
              <small>🧠 Case Summary</small>
              <p>{c.contentsummarise || "No summary available"}</p>
            </div>

            {/* JUDGEMENT */}
            <div style={styles.judgement}>
              <small>⚖ Judgement Insight</small>
              <p>{c.judgementsummarise || "Not available"}</p>
            </div>

            {/* FOOTER */}
            <div style={styles.footer}>
              <span>📁 Case #{c.caseid}</span>

              <button
                style={styles.btn}
                onClick={() => nav(`/case/${c.caseid}`)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  caseTag: {
    display: "inline-block",
    marginTop: "10px",
    padding: "5px 12px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.2)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },

  card: {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    transition: "0.3s",
    cursor: "pointer",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  section: {
    fontSize: "13px",
    marginBottom: "10px",
    opacity: 0.9,
  },

  judgement: {
    background: "rgba(0,255,150,0.1)",
    borderLeft: "4px solid #00ff9d",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontSize: "13px",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },

  btn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(45deg, #00c6ff, #0072ff)",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    marginTop: "50px",
    opacity: 0.7,
  },
};

/* STATUS COLORS */
function getStatusStyle(status) {
  if (status === "OPEN") return { color: "#00ff9d" };
  if (status === "HEARING") return { color: "#ffd166" };
  return { color: "#ff4d4d" };
}
