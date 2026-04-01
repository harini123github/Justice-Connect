import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  card: {
    width: "450px", // slight increase for 4 roles
    background: "rgba(0,0,0,0.85)",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0px 0px 20px rgba(0,0,0,0.6)",
  },
  glowText: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "bold",
    animation: "glow 2s infinite alternate",
    marginBottom: "20px",
  },
  input: {
    color: "black",
    border: "1px solid #444",
  },
  btn: {
    borderRadius: "30px",
    fontWeight: "bold",
    width: "100%",
  },
  roleCard: (active) => ({
    flex: 1,
    cursor: "pointer",
    padding: "12px",
    borderRadius: "12px",
    textAlign: "center",
    border: active ? "2px solid #00ffcc" : "1px solid #444",
    boxShadow: active ? "0 0 15px #00ffcc" : "0 0 6px rgba(255,255,255,0.1)",
    transition: "0.3s",
  }),
};

const glowKeyframes = `
@keyframes glow {
  from { text-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc; }
  to { text-shadow: 0 0 20px #00ffcc, 0 0 30px #00ffcc; }
}
`;

const Login = () => {
  const [form, setForm] = useState({
    address: "",
    privatekey: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectRole = (role) => {
    setForm({ ...form, role });
  };

  const validate = () => {
    let errs = {};
    if (!form.address) errs.address = "Wallet address is required";
    if (!form.privatekey) errs.privatekey = "Private key is required";
    if (!form.role) errs.role = "Please choose a role";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length === 0) {
      try {
        setLoading(true);

        const res = await axios.post("http://localhost:5000/login", {
          address: form.address,
          private_key: form.privatekey,
          role: form.role,
        });

        localStorage.setItem("id", res.data.id);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("address", res.data.address);
        localStorage.setItem("username", res.data.username);

        alert(`✅ ${res.data.role.toUpperCase()} Login Successful`);

        nav("/meta");
      } catch (err) {
        alert("❌ Login Failed: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={styles.page}>
      <style>{glowKeyframes}</style>

      <div style={styles.card}>
        <h2 style={styles.glowText}>Blockchain Secure Login</h2>

        <form onSubmit={handleSubmit}>
          {/* Wallet Address */}
          <div className="mb-3">
            <input
              type="text"
              name="address"
              className="form-control"
              style={styles.input}
              placeholder="Wallet Address"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && (
              <small className="text-danger">{errors.address}</small>
            )}
          </div>

          {/* Private Key */}
          <div className="mb-3">
            <input
              type="password"
              name="privatekey"
              className="form-control"
              style={styles.input}
              placeholder="Private Key"
              value={form.privatekey}
              onChange={handleChange}
            />
            {errors.privatekey && (
              <small className="text-danger">{errors.privatekey}</small>
            )}
          </div>

          {/* ROLE SELECTION */}
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <div
              style={styles.roleCard(form.role === "admin")}
              onClick={() => selectRole("admin")}
            >
              🛡
              <br />
              <strong>ADMIN</strong>
            </div>

            <div
              style={styles.roleCard(form.role === "Judge")}
              onClick={() => selectRole("Judge")}
            >
              ⚖<br />
              <strong>JUDGE</strong>
            </div>

            <div
              style={styles.roleCard(form.role === "Lawyer")}
              onClick={() => selectRole("Lawyer")}
            >
              📜
              <br />
              <strong>LAWYER</strong>
            </div>

            <div
              style={styles.roleCard(form.role === "User")}
              onClick={() => selectRole("User")}
            >
              👤
              <br />
              <strong>USER</strong>
            </div>
          </div>

          {errors.role && (
            <small className="text-danger d-block mb-2">{errors.role}</small>
          )}

          <button
            type="submit"
            className="btn btn-success mt-2"
            style={styles.btn}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login Securely"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
