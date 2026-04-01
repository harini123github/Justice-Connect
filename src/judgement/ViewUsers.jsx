import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  // 🚀 NO RELOAD APPROVAL
  const approveUser = async (id) => {
    setLoadingId(id);

    try {
      await axios.post(`http://localhost:5000/admin/approve/${id}`);

      // ✅ instant UI update (no reload)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, approved: 1 } : u)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>👥 User Approval Panel</h2>
        <p>Manage and approve registered users securely</p>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.row}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>

                <td>
                  <span style={styles.roleBadge(u.role)}>{u.role}</span>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    style={{
                      ...styles.status,
                      color: u.approved === 1 ? "#00ff9d" : "#ffd166",
                    }}
                  >
                    {u.approved === 1 ? "Approved" : "Pending"}
                  </span>
                </td>

                {/* ACTION */}
                <td>
                  {u.approved === 1 ? (
                    <span style={styles.tick}>✔</span>
                  ) : loadingId === u.id ? (
                    <span style={styles.loader}></span>
                  ) : (
                    <button
                      style={styles.approveBtn}
                      onClick={() => approveUser(u.id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && <div style={styles.empty}>No users found</div>}
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

  card: {
    backdropFilter: "blur(14px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  row: {
    transition: "0.3s",
  },

  roleBadge: (role) => ({
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    background:
      role === "Admin"
        ? "#ff4d6d"
        : role === "Judge"
          ? "#ffd166"
          : role === "Lawyer"
            ? "#06d6a0"
            : "#00b4d8",
    color: "#000",
    fontWeight: "bold",
  }),

  status: {
    fontWeight: "bold",
  },

  approveBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(45deg, #00ff9d, #00c853)",
    cursor: "pointer",
    fontWeight: "bold",
  },

  tick: {
    color: "#00ff9d",
    fontSize: "18px",
    animation: "pop 0.3s ease",
  },

  loader: {
    width: "18px",
    height: "18px",
    border: "3px solid #fff",
    borderTop: "3px solid #00ff9d",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },

  empty: {
    textAlign: "center",
    marginTop: "20px",
    opacity: 0.7,
  },
};

/* 🔥 ADD GLOBAL CSS (important) */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`,
  styleSheet.cssRules.length,
);

styleSheet.insertRule(
  `
@keyframes pop {
  0% { transform: scale(0);}
  100% { transform: scale(1);}
}
`,
  styleSheet.cssRules.length,
);
