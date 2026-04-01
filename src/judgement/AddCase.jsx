import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddCase() {
  const [users, setUsers] = useState([]);
  const [judges, setJudges] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const [form, setForm] = useState({
    userid: "",
    judgeid: "",
    lawyerid: "",
    casesubject: "",
    casecontent: "",
    otheruser: "",
    case_type: "",
    case_complexity: "",
    num_witnesses: "",
    num_evidence_docs: "",
    court_level: "",
    previous_adjournments: "",
  });

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/users").then((res) => {
      const all = res.data;
      setUsers(all.filter((u) => u.role === "User"));
      setJudges(all.filter((u) => u.role === "Judge"));
      setLawyers(all.filter((u) => u.role === "Lawyer"));
    });
  }, []);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    if (!form.userid || !form.judgeid || !form.lawyerid || !form.casesubject) {
      alert("Fill required fields");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((k) => data.append(k, form[k]));
    if (pdf) data.append("contentpdf", pdf);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/cases", data);
      alert("✅ Case Added");
      window.location.reload();
    } catch {
      alert("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>⚖ Add New Case</h2>
        <p>Manage legal cases with AI-powered insights</p>
      </div>

      {/* GLASS CARD */}
      <div style={styles.glassCard}>
        {/* SECTION 1 */}
        <Section title="👥 Participants">
          <div className="row">
            <Select
              label="User *"
              data={users}
              field="userid"
              form={form}
              handleChange={handleChange}
            />
            <Select
              label="Lawyer *"
              data={lawyers}
              field="lawyerid"
              form={form}
              handleChange={handleChange}
              showExp
            />
            <Select
              label="Judge *"
              data={judges}
              field="judgeid"
              form={form}
              handleChange={handleChange}
            />
          </div>

          <div className="row mt-3">
            <Select
              label="Opponent"
              data={users.filter((u) => u.id !== form.userid)}
              field="otheruser"
              form={form}
              handleChange={handleChange}
            />
          </div>
        </Section>

        {/* SECTION 2 */}
        <Section title="📄 Case Info">
          <input
            style={styles.input}
            placeholder="Case Subject"
            value={form.casesubject}
            onChange={(e) => handleChange("casesubject", e.target.value)}
          />

          <textarea
            style={{ ...styles.input, height: "120px" }}
            placeholder="Case Description"
            value={form.casecontent}
            onChange={(e) => handleChange("casecontent", e.target.value)}
          />
        </Section>

        {/* SECTION 3 */}
        <Section title="🤖 Prediction Inputs">
          <div className="row">
            <Input
              label="Complexity"
              onChange={(v) => handleChange("case_complexity", v)}
            />
            <Input
              label="Witnesses"
              onChange={(v) => handleChange("num_witnesses", v)}
            />
            <Input
              label="Evidence Docs"
              onChange={(v) => handleChange("num_evidence_docs", v)}
            />
          </div>

          <div className="row mt-3">
            <SelectSimple
              label="Case Type"
              field="case_type"
              form={form}
              handleChange={handleChange}
              options={["civil", "criminal", "cyber"]}
            />
            <SelectSimple
              label="Court Level"
              field="court_level"
              form={form}
              handleChange={handleChange}
              options={["district", "high", "supreme"]}
            />
            <Input
              label="Adjournments"
              onChange={(v) => handleChange("previous_adjournments", v)}
            />
          </div>
        </Section>

        {/* SECTION 4 */}
        <Section title="📎 Upload">
          <input
            type="file"
            style={styles.file}
            onChange={(e) => setPdf(e.target.files[0])}
          />
        </Section>

        {/* BUTTON */}
        <button style={styles.button} onClick={submit}>
          {loading ? "Processing..." : "🚀 Submit Case"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h5 style={styles.sectionTitle}>{title}</h5>
    {children}
  </div>
);

const Select = ({ label, data, field, form, handleChange, showExp }) => (
  <div className="col-md-4">
    <label>{label}</label>
    <select
      style={styles.input}
      value={form[field]}
      onChange={(e) => handleChange(field, e.target.value)}
    >
      <option value="">Select</option>
      {data.map((d) => (
        <option key={d.id} value={d.id}>
          {d.username} {showExp && `(${d.experience} yrs)`}
        </option>
      ))}
    </select>
  </div>
);

const SelectSimple = ({ label, field, form, handleChange, options }) => (
  <div className="col-md-4">
    <label>{label}</label>
    <select
      style={styles.input}
      value={form[field]}
      onChange={(e) => handleChange(field, e.target.value)}
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const Input = ({ label, onChange }) => (
  <div className="col-md-4">
    <label>{label}</label>
    <input
      style={styles.input}
      type="number"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    padding: "40px",
    color: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  glassCard: {
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },

  section: {
    marginBottom: "25px",
    padding: "20px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.05)",
  },

  sectionTitle: {
    marginBottom: "15px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    marginBottom: "10px",
  },

  file: {
    width: "100%",
    padding: "10px",
    background: "#fff",
    borderRadius: "8px",
    color: "#000",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(45deg, #00c6ff, #0072ff)",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
};
