import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AdminCharts from "../components/AdminCharts";
import "../styles/visuals.css"


type TrendRow = {
  education_qualification: string;
  predicted_roles: string;
  count: number;
};

interface AdminStats {
  total_users: number;
  predictions: number;
  approved_roles: number;
  flagged_predictions: number;
  model_accuracy: number;
}

export default function AdminVisualizations() {
  const [rawData, setRawData] = useState<TrendRow[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    predictions: 0,
    approved_roles: 0,
    flagged_predictions: 0,
    model_accuracy: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const API = import.meta.env.VITE_API_BASE;
        const token = localStorage.getItem("access");

        const [statsRes, trendsRes] = await Promise.all([
          fetch(`${API}/api/ml/admin/stats/`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then(res => res.json()),

          fetch(`${API}/api/ml/education-job-trends/`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then(res => res.json())
        ]);

        setStats(statsRes);
        setRawData(trendsRes);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="root">
      <NavBar />

      <div className="container pgHeader">
        <h2 className="pgTitle">Admin Analytics & Visualizations</h2>
      </div>

      <div className="page container">
        {loading && <div className="empty">Loading analytics...</div>}
        {error && <div className="errBox">{error}</div>}

        {!loading && !error && (
          <AdminCharts stats={stats} trends={rawData} loading={loading} />
        )}
      </div>

      <Footer />
    </div>
  );
}
