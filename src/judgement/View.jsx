import React, { useEffect, useState } from "react";
import axios from "axios";

const JudgementList = () => {
  const [judgements, setJudgements] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/judgements") // <-- adjust API endpoint
      .then((res) => setJudgements(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">Judgement Records</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Title</th>
            <th>Created At</th>
            <th>PDF</th>
            <th>IPFS Key</th>
            <th>Blockchain Key</th>
          </tr>
        </thead>
        <tbody>
          {judgements.length > 0 ? (
            judgements.map((j) => (
              <tr key={j.id}>
                <td>{j.id}</td>
                <td>{j.user_id}</td>
                <td>{j.judgementtitle}</td>
                <td>{new Date(j.created_at).toLocaleString()}</td>
                <td>{j.pdfdetails ? <p>View PDF</p> : "N/A"}</td>
                <td>{j.ipfskey || "N/A"}</td>
                <td>{j.blockchainkey || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No judgements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JudgementList;
