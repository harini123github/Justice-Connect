import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

import MetaMaskApprovalChecker from "./MetaMaskApprovalChecker";

import ViewUsers from "./ViewUsers";
import AddCase from "./AddCase";
import ViewCases from "./Viewcases";
import CaseList from "./CaseList";
import Dashboard from "./Success";
import SimilarCases from "./SimilarCases";

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Blockchain Legal Summariser";
    var role = window.localStorage.getItem("role");
    var id = window.localStorage.getItem("id");
    var address = window.localStorage.getItem("address");
    var username = window.localStorage.getItem("username");
    setUser(username || "");
    setAuth(role);
    console.log(address, id, role, username);
  }, [auth]);

  console.log("Auth status:", auth);

  const logout = async () => {
    window.localStorage.clear();
    navigate("/");
    setAuth(null);
  };
  const styles = {
    navbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#222", // dark background
      padding: "12px 24px",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
    },
    brand: {
      textDecoration: "none",
      color: "#f8f9fa",
      fontSize: "20px",
      fontWeight: "bold",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    link: {
      textDecoration: "none",
      color: "#ddd",
      fontSize: "16px",
      transition: "0.3s",
    },
    linkHover: {
      color: "#fff",
    },
    button: {
      backgroundColor: "transparent",
      color: "#f8f9fa",
      border: "1px solid #f8f9fa",
      padding: "6px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "0.3s",
    },
    buttonHover: {
      backgroundColor: "#f8f9fa",
      color: "#222",
    },
  };
  return (
    <>
      <nav style={styles.navbar}>
        <Link to="/" style={styles.brand}>
          Judgement Summary
        </Link>
        <div style={styles.navLinks}>
          {!auth ? (
            <>
              <Link
                to="/login"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Register
              </Link>
            </>
          ) : auth === "admin" ? (
            <>
              <Link
                to="/view"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Home
              </Link>
              <Link
                to="/success"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                View User
              </Link>
              <Link
                to="/addcase"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Add Case
              </Link>

              <Link
                to="/cases"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                View Cases
              </Link>
              <span>Hello, {user}</span>
              <button
                style={styles.button}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor =
                    styles.buttonHover.backgroundColor;
                  e.target.style.color = styles.buttonHover.color;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor =
                    styles.button.backgroundColor;
                  e.target.style.color = styles.button.color;
                }}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : auth === "Judge" ? (
            <>
              <Link
                to="/view"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Home
              </Link>

              <Link
                to="/cases"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                View Cases
              </Link>
              <span>Hello, {user}</span>
              <button
                style={styles.button}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor =
                    styles.buttonHover.backgroundColor;
                  e.target.style.color = styles.buttonHover.color;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor =
                    styles.button.backgroundColor;
                  e.target.style.color = styles.button.color;
                }}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <span>Hello, {user}</span>
              <Link
                to="/view"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                Home
              </Link>

              <Link
                to="/cases"
                style={styles.link}
                onMouseOver={(e) =>
                  (e.target.style.color = styles.linkHover.color)
                }
                onMouseOut={(e) => (e.target.style.color = styles.link.color)}
              >
                View Cases
              </Link>
              <button
                style={styles.button}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor =
                    styles.buttonHover.backgroundColor;
                  e.target.style.color = styles.buttonHover.color;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor =
                    styles.button.backgroundColor;
                  e.target.style.color = styles.button.color;
                }}
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/success" element={<ViewUsers />} />
        <Route
          path="/meta"
          element={<MetaMaskApprovalChecker setAuth={setAuth} />}
        />
        <Route path="/view" element={<Dashboard />} />
        <Route path="/addcase" element={<AddCase />} />
        <Route path="/cases" element={<CaseList />} />
        <Route path="/case/:id" element={<ViewCases />} />

        <Route path="/case/:id/similar" element={<SimilarCases />} />
      </Routes>
    </>
  );
}

export default App;
