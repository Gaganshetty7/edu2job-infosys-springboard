import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles/admin.css";

export default function AdminPanelPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleTrain = async () => {
    if (!file) {
      setStatus("Please upload a dataset first.");
      return;
    }

    setStatus("Uploading & training…");

    const formData = new FormData();
    formData.append("dataset", file);

    try {
      const res = await fetch("/api/admin/train-model/", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setStatus("Model trained & saved successfully");
    } catch (err: any) {
      setStatus("Training failed: " + err.message);
    }
  };

  return (
    <div className="root">
      <NavBar />

      <div className="dashRoot">
        <div className="header">
          <div className="welcome">
            <div className="wHi">Admin Panel</div>
            <div className="name">{user?.name}</div>
          </div>

          <div className="adminBadge">ADMIN ACCESS</div>
        </div>

        <section className="adminStats">
          <div className="aCard">
            <div className="aLabel">Total Users</div>
            <div className="aValue">1,248</div>
            <div className="aHint">active on platform</div>
          </div>

          <div className="aCard">
            <div className="aLabel">Predictions</div>
            <div className="aValue">6,732</div>
            <div className="aHint">model usage count</div>
          </div>

          <div className="aCard">
            <div className="aLabel">Approved Roles</div>
            <div className="aValue">312</div>
            <div className="aHint">visible to users</div>
          </div>

          <div className="aCard">
            <div className="aLabel">Model Accuracy</div>
            <div className="aValue">87%</div>
            <div className="meter">
              <div className="meterFill" style={{ width: "87%" }} />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="cardTitle">Recent Activity</div>

          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Qualification</th>
                <th>Skills</th>
                <th>Predicted Role</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Arjun</td>
                <td>BTech</td>
                <td>React, Node</td>
                <td>Frontend Developer</td>
                <td>Today</td>
              </tr>

              <tr>
                <td>Sneha</td>
                <td>MCA</td>
                <td>Python, ML</td>
                <td>Data Analyst</td>
                <td>Yesterday</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="cardTitle">ML Controls</div>

          <div className="mlControls">
            <input className="datasetinput" type="file" accept=".csv" onChange={handleUpload} />
            <button className="btnTrain" onClick={handleTrain}>
              Train & Save Model
            </button>
            {status && <div className="statusText">{status}</div>}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
