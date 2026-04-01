import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [role, setRole] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const r = localStorage.getItem("role");
    setRole(r || "");

    if (!id) return;

    axios
      .get(`http://localhost:5000/dashboard/stats?user_id=${id}`)
      .then((res) => setStats(res.data));
  }, []);

  const openCard = async (type, title) => {
    const id = localStorage.getItem("id");

    const res = await axios.get(
      `http://localhost:5000/dashboard/list?type=${type}&user_id=${id}`,
    );

    setModalTitle(title);
    setModalData(res.data);
    setShowModal(true);
  };

  if (!stats) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>📊 Dashboard</h2>
        <p>Smart Legal Analytics & Case Tracking</p>
      </div>

      {/* CARDS */}
      <div style={styles.grid}>
        <Card
          title="Total Cases"
          value={stats.total_cases}
          onClick={() => openCard("total_cases", "Total Cases")}
        />
        <Card
          title="Open Cases"
          value={stats.open_cases}
          color="#ffb703"
          onClick={() => openCard("open_cases", "Open Cases")}
        />
        <Card
          title="Closed Cases"
          value={stats.closed_cases}
          color="#06d6a0"
          onClick={() => openCard("closed_cases", "Closed Cases")}
        />
        <Card
          title="Upcoming Hearings"
          value={stats.upcoming_hearings}
          color="#00b4d8"
          onClick={() => openCard("upcoming_hearings", "Upcoming Hearings")}
        />
        <Card
          title="Today Hearings"
          value={stats.today_hearings}
          color="#4361ee"
          onClick={() => openCard("today_hearings", "Today Hearings")}
        />
        <Card
          title="Year Hearings"
          value={stats.year_hearings}
          color="#7209b7"
          onClick={() => openCard("year_hearings", "Year Hearings")}
        />

        {role === "Admin" && (
          <>
            <Card
              title="Users"
              value={stats.total_users}
              color="#ef476f"
              onClick={() => openCard("users", "Users")}
            />
            <Card
              title="Judges"
              value={stats.total_judges}
              color="#06d6a0"
              onClick={() => openCard("judges", "Judges")}
            />
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h4>{modalTitle}</h4>
              <button onClick={() => setShowModal(false)}>✖</button>
            </div>

            <div style={styles.modalBody}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name / Case</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.caseid || row.id}</td>
                      <td>{row.casesubject || row.username}</td>
                      <td>{row.status || row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- CARD ---------------- */
function Card({ title, value, color = "#111", onClick }) {
  return (
    <div
      style={{
        ...styles.card,
        background: `linear-gradient(135deg, ${color}, #000)`,
      }}
      onClick={onClick}
    >
      <h6>{title}</h6>
      <h2>{value}</h2>
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "16px",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
    transition: "0.3s",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "70%",
    background: "#1e1e2f",
    borderRadius: "12px",
    padding: "20px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },

  modalBody: {
    maxHeight: "400px",
    overflowY: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#fff",
  },

  loading: {
    color: "#fff",
    textAlign: "center",
    marginTop: "50px",
  },
};
