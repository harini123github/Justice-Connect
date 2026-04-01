import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    document.title = "Blockchain Legal Summariser";
  }, []);

  return (
    <div style={styles.page}>
      {/* Header Section */}
      <header className="text-center text-light py-5" style={styles.hero}>
        <h1 className="display-3 fw-bold" style={styles.glow}>
          Justice Connect
        </h1>
        <p className="lead mt-3" style={{ animation: "fadeIn 2s" }}>
          Turning lengthy judgments into concise insights <br />
          with <b>AI + Blockchain trust</b>.
        </p>
        <NavLink to="/login">
          <button
            className="btn btn-lg btn-primary mt-4 shadow-lg"
            style={styles.ctaBtn}
          >
            Get Started
          </button>
        </NavLink>
      </header>

      {/* How it Works */}
      <section className="container text-center text-light my-5">
        <h2 className="fw-bold mb-4">How It Works</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div
              className="card bg-dark text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>Upload Judgment</h4>
              <p>Upload long legal documents securely into our system.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div
              className="card bg-dark text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>AI Summarises</h4>
              <p>Our AI condenses complex judgments into simple summaries.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div
              className="card bg-dark text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>Blockchain Verifies</h4>
              <p>Each summary is verified and secured using blockchain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="container text-center text-light my-5">
        <h2 className="fw-bold mb-4">Why Blockchain?</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div
              className="card bg-secondary text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>Integrity</h4>
              <p>Judgments are immutable.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div
              className="card bg-secondary text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>Trust</h4>
              <p>Verified records ensure complete authenticity.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div
              className="card bg-secondary text-light shadow-lg p-3"
              style={styles.card}
            >
              <h4>Transparency</h4>
              <p>All summaries are openly traceable on blockchain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center text-light py-4"
        style={{ background: "rgba(0,0,0,0.8)" }}
      >
        <p>Powered by AI & Blockchain | © 2025 LegalChain</p>
      </footer>

      {/* Internal CSS Animations */}
      <style>
        {`
          @keyframes glow {
            0% { text-shadow: 0 0 10px #00f, 0 0 20px #00f; }
            50% { text-shadow: 0 0 20px #0ff, 0 0 40px #0ff; }
            100% { text-shadow: 0 0 10px #00f, 0 0 20px #00f; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: {
    paddingTop: "80px",
    paddingBottom: "80px",
  },
  glow: {
    animation: "glow 2s infinite alternate",
  },
  ctaBtn: {
    borderRadius: "30px",
    padding: "10px 30px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  card: {
    borderRadius: "15px",
    transition: "transform 0.3s",
    cursor: "pointer",
  },
};

export default Home;
