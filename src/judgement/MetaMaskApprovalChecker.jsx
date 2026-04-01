import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function MetaMaskApprovalChecker({ setAuth }) {
  const [isApproved, setIsApproved] = useState(false);
  const [account, setAccount] = useState(null);

  const nav = useNavigate();

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);

          if (
            window.localStorage.getItem("address").toLowerCase().trim() ===
            accounts[0]
          ) {
            setIsApproved(true);
            nav("/view");
            setAuth(true);
          } else {
            alert(
              "Wrong account approval. Please connect the correct account.",
            );
          }
        } else {
          alert("Please connect an account.");
        }
      } catch (error) {
        console.error("MetaMask connection error:", error);
      }
    } else {
      alert("MetaMask not installed. Please install MetaMask and try again.");
    }
  };

  return (
    <div>
      <style>{`
        .metamask-bg {
           background-image: url('https://t3.ftcdn.net/jpg/03/91/46/10/360_F_391461057_5P0BOWl4lY442Zoo9rzEeJU0S2c1WDZR.jpg');
          background-size: cover;
          background-position: center;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .metamask-card {
          background-color: rgba(255, 255, 255, 0.95);
          padding: 30px;
          border-radius: 10px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        .metamask-card h5 {
          font-weight: bold;
        }
        .metamask-card p {
          margin-top: 15px;
        }
      `}</style>

      <div className="metamask-bg">
        <div className="metamask-card">
          {isApproved ? (
            <>
              <h5 className="text-success">MetaMask Connected!</h5>
              <p className="text-muted">
                Account: <span className="text-primary fw-bold">{account}</span>
              </p>
            </>
          ) : (
            <>
              <h5 className="text-dark mb-3">Connect Your MetaMask Wallet</h5>
              <button className="btn btn-primary" onClick={connectToMetaMask}>
                Connect to MetaMask
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetaMaskApprovalChecker;
