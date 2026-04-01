import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

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
    width: "400px",
    background: "rgba(0,0,0,0.85)",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0px 0px 20px rgba(0,0,0,0.5)",
  },
  glowText: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "bold",
    animation: "glow 2s infinite alternate",
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
};

// Glow animation keyframes
const glowKeyframes = `
@keyframes glow {
  from { text-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc; }
  to { text-shadow: 0 0 20px #00ffcc, 0 0 30px #00ffcc; }
}
`;

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    privatekey: "",
    role: "",
    experience: "", // ✅ added
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && value !== "Lawyer") {
      setForm({ ...form, role: value, experience: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    let errs = {};

    if (!form.username) errs.username = "Username is required";
    if (!form.email.includes("@")) errs.email = "Invalid email format";
    if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.address) errs.address = "Address is required";
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = "Phone must be 10 digits";
    if (!form.privatekey) errs.privatekey = "Private key is required";
    if (!form.role) errs.role = "Role is required";

    // ✅ ONLY for Lawyer
    if (form.role === "Lawyer" && !form.experience) {
      errs.experience = "Experience is required";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      try {
        await axios.post("http://localhost:5000/register", form, {
          withCredentials: true,
        });
        setMessage({ type: "success", text: "✅ Registered successfully!" });
        setForm({
          username: "",
          email: "",
          password: "",
          address: "",
          phone: "",
          privatekey: "",
          role: "",
          experience: "", // ✅ reset
        });
      } catch (err) {
        setErrors({
          type: "danger",
          text: "❌ " + (err.response?.data?.error || "Something went wrong"),
        });
      }
      console.log(form);
    }
  };
  const [message, setMessage] = useState({ type: "", text: "" });
  return (
    <div style={styles.page}>
      {/* Inject glow animation */}
      <style>{glowKeyframes}</style>

      <div style={styles.card}>
        <h2 style={styles.glowText}>Blockchain Secure Form</h2>
        <form onSubmit={handleSubmit}>
          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.text}
            </div>
          )}
          {/* Username */}
          <div className="mb-3">
            <input
              type="text"
              name="username"
              className="form-control"
              style={styles.input}
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && (
              <small className="text-danger">{errors.username}</small>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <small className="text-danger">{errors.email}</small>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              style={styles.input}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <small className="text-danger">{errors.password}</small>
            )}
          </div>

          {/* Address */}
          <div className="mb-3">
            <input
              type="text"
              name="address"
              className="form-control"
              style={styles.input}
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && (
              <small className="text-danger">{errors.address}</small>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <input
              type="text"
              name="phone"
              className="form-control"
              style={styles.input}
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <small className="text-danger">{errors.phone}</small>
            )}
          </div>

          {/* Private Key */}
          <div className="mb-3">
            <input
              type="text"
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

          <div className="mb-3">
            <select
              value={form.role}
              onChange={handleChange}
              name="role"
              className="form-control"
              style={styles.input}
            >
              <option value="">Select Role</option>
              <option value="Judge">Judge</option>
              <option value="User">User</option>
              <option value="Lawyer">Lawyer</option> // ✅ added
            </select>
            {errors.role && (
              <small className="text-danger">{errors.role}</small>
            )}
          </div>

          {form.role === "Lawyer" && (
            <div className="mb-3">
              <input
                type="number"
                name="experience"
                className="form-control"
                style={styles.input}
                placeholder="Years of Experience"
                value={form.experience}
                onChange={handleChange}
              />
              {errors.experience && (
                <small className="text-danger">{errors.experience}</small>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-success" style={styles.btn}>
            Submit Securely
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
