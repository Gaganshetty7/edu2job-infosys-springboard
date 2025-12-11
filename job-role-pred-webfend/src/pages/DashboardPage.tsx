// src/pages/Dashboard.tsx
import NavBar from "../components/NavBar";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="root">
      <NavBar />

      <main className="main dashboard-main">
        <div className="container dashboard-inner">
          <h1 className="dashboard-greeting">Welcome, {user?.name}</h1>

          <div className="dashboard-cards">
            <div
              className="dashboard-card"
              onClick={() => navigate("/make-prediction")}
            >
              <h2>Make Prediction</h2>
              <p>Analyze your education and skills to find your ideal job</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => navigate("/predictions")}
            >
              <h2>Previous Predictions</h2>
              <p>View your past predictions and career suggestions</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} Edu2Job</div>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
