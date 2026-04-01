import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ViewCase() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [hearing, setHearing] = useState({});
  const [pdf, setPdf] = useState(null);

  const role = localStorage.getItem("role");

  const load = useCallback(() => {
    axios
      .get(`http://localhost:5000/case/${id}`)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function addHearing() {
    await axios.post("http://localhost:5000/case/hearing", {
      ...hearing,
      caseid: id,
    });
    setHearing({});
    load();
  }

  async function closeCase() {
    const fd = new FormData();
    fd.append("caseid", id);
    if (pdf) fd.append("judgementpdf", pdf);

    await axios.post("http://localhost:5000/case/close", fd);
    load();
  }

  if (!data)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  const c = data.case;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>⚖ Case Details</h2>
        <p>Detailed view with AI insights</p>
      </div>

      {/* CASE CARD */}
      <div style={styles.card}>
        <h4>{c.casesubject}</h4>
        <p style={styles.text}>{c.casecontent}</p>

        <div style={styles.grid}>
          <Info label="👤 User" value={c.user} />
          <Info label="⚖ Judge" value={c.judge} />
          <Info label="👨‍💼 Lawyer" value={c.lawyer || "N/A"} />
          <Info label="🆚 Opponent" value={c.otherusername || "N/A"} />
        </div>

        {/* Prediction */}
        <div style={styles.badge}>
          📊 {c.predicted_hearings || "N/A"} Hearings
        </div>

        {/* Summary */}
        {c.contentsummarise && (
          <div style={styles.section}>
            <b>🧠 Case Summary</b>
            <p>{c.contentsummarise}</p>
          </div>
        )}

        {/* Status */}
        <div style={styles.status(c.status)}>{c.status}</div>

        {/* PDF */}
        {c.contentpdf && (
          <a
            href={`http://localhost:5000/${c.contentpdf}`}
            target="_blank"
            rel="noreferrer"
            style={styles.linkBtn}
          >
            📄 View Case PDF
          </a>
        )}
      </div>

      {/* JUDGEMENT */}
      {c.status === "CLOSED" && (
        <div style={styles.card}>
          <h4>⚖ Judgement</h4>

          {c.judgementsummarise && (
            <p style={styles.text}>{c.judgementsummarise}</p>
          )}

          {c.judgementpdf && (
            <a
              href={`http://localhost:5000/${c.judgementpdf}`}
              target="_blank"
              rel="noreferrer"
              style={styles.successBtn}
            >
              📄 View Judgement PDF
            </a>
          )}
        </div>
      )}

      {/* HEARINGS */}
      <div style={styles.card}>
        <h4>📅 Hearings</h4>

        {data.hearings.length === 0 && <p>No hearings yet</p>}

        {data.hearings.map((h) => (
          <div key={h.casehearingid} style={styles.hearing}>
            <b>{h.casedate}</b>
            <p>{h.caseinfo}</p>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      {c.status !== "CLOSED" && (role === "admin" || role === "Judge") && (
        <div style={styles.actionsWrap}>
          {/* ADD HEARING */}
          <div style={styles.card}>
            <h4>Add Hearing</h4>

            <input
              type="date"
              style={styles.input}
              onChange={(e) =>
                setHearing({ ...hearing, casedate: e.target.value })
              }
            />

            <textarea
              style={styles.input}
              placeholder="Hearing details"
              onChange={(e) =>
                setHearing({ ...hearing, caseinfo: e.target.value })
              }
            />

            <button style={styles.primaryBtn} onClick={addHearing}>
              Save Hearing
            </button>
          </div>

          {/* CLOSE CASE */}
          <div style={styles.card}>
            <h4>Close Case</h4>

            <input
              type="file"
              style={styles.input}
              onChange={(e) => setPdf(e.target.files[0])}
            />

            <button style={styles.dangerBtn} onClick={closeCase}>
              Close Case
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENT */
const Info = ({ label, value }) => (
  <div>
    <b>{label}</b>
    <p>{value}</p>
  </div>
);

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    padding: "40px",
    color: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  card: {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
  },

  text: {
    opacity: 0.85,
  },

  badge: {
    marginTop: "10px",
    background: "#ffd166",
    color: "#000",
    padding: "6px 10px",
    borderRadius: "6px",
    display: "inline-block",
  },

  section: {
    marginTop: "15px",
    padding: "10px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
  },

  status: (s) => ({
    marginTop: "10px",
    color: s === "OPEN" ? "#00ff9d" : s === "HEARING" ? "#ffd166" : "#ff4d4d",
    fontWeight: "bold",
  }),

  linkBtn: {
    display: "inline-block",
    marginTop: "10px",
    color: "#00c6ff",
  },

  successBtn: {
    display: "inline-block",
    marginTop: "10px",
    background: "#28a745",
    padding: "8px",
    borderRadius: "6px",
    color: "#fff",
    textDecoration: "none",
  },

  actionsWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
  },

  primaryBtn: {
    marginTop: "10px",
    background: "#0072ff",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "100%",
  },

  dangerBtn: {
    marginTop: "10px",
    background: "#ff4d4d",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "100%",
  },

  hearing: {
    marginTop: "10px",
    padding: "10px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
  },
};
