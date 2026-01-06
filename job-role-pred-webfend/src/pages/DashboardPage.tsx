import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../styles/dashboard.css";

type RolePred = {
  role: string;
  confidence: number;
  reasons: string[];
};

export default function DashboardPage() {
  const [user, setUser] = useState({ name: "User" });
  const [predictions, setPredictions] = useState<RolePred[]>([]);
  const [userData, setUserData] = useState({
    degree: "",
    skills: [] as string[],
    experience_level: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);

  // SAFE title-case function
  const toTitleCase = (str?: string) => {
    if (!str) return "";
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .split(" ")
      .map(
        word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setError("Please login");
          setLoading(false);
          return;
        }

        const API = import.meta.env.VITE_API_BASE;

        // PROFILE
        const profileRes = await fetch(`${API}/api/accounts/myprofile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        setUser({ name: profileData?.name || "User" });

        // USER ML DATA
        const dataRes = await fetch(`${API}/api/ml/dash-prediction-data/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await dataRes.json();
        setUserData(data);
        console.log("User data:", userData);

        // ---- GUARD: stop if no data ----
        if (
          !data?.degree ||
          !data?.experience_level ||
          !Array.isArray(data?.skills) ||
          data.skills.length === 0
        ) {
          setNoData(true);
          return;
        }

        // PREDICT (only if data exists)
        const predictRes = await fetch(`${API}/api/ml/predict/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            skills: data.skills, // keep as array
            qualification: data.degree,
            experience_level: data.experience_level
          })
        });

        const predData = await predictRes.json();

        const results = predData?.predicted_role || [];

        const formatted = results.map((item: any) => ({
          role: item.role,
          confidence: Number(item.confidence),
          reasons: Array.isArray(item.reasons) ? item.reasons : []
        }));

        setPredictions(formatted);
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ---- UI computed values ----
  const topRole =
    predictions[0] || {
      role: "Analyzing...",
      confidence: 0,
      reasons: []
    };

  const recommendedRoles = predictions.map(p => ({
    name: p.role,
    confidence: p.confidence
  }));

  // ---- LOADING ----
  if (loading) {
    return (
      <div className="root">
        <NavBar />
        <div className="dashRoot">
          <div className="header">
            <div className="welcome">
              <div className="wHi">Welcome back,</div>
              <div className="name">User</div>
            </div>
          </div>

          <div className="mainGrid">
            <div className="rolesCard">
              <div className="cardTitle">
                Analyzing your profile...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="root">
      <NavBar />
      <div className="dashRoot">
        <div className="header">
          <div className="welcome">
            <div className="wHi">Welcome back,</div>
            <div className="name">{user?.name}</div>
          </div>

          {error ? (
            <div className="errorBanner">
              <span>{error}</span>
              <button
                className="retryBtn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : noData ? (
            <div className="errorBanner">
              <span>
                Complete your profile (degree, skills, experience)
                to see role predictions.
              </span>
            </div>
          ) : (
            <div className="topRow">
              <div className="predictedRoleCard">
                <div className="label">Top prediction</div>

                <div className="roleWrap">
                  <div className="roleName">
                    {toTitleCase(topRole.role)}
                  </div>
                  <div className="roleConf">
                    {Math.round(topRole.confidence)}%
                  </div>
                </div>

                <div className="explain">
                  {topRole.reasons.map((reason, i) => (
                    <div className="bullet" key={i}>
                      {reason}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>

        {!noData && (
          <div className="mainGrid">
            <div className="rolesCard">
              <div className="cardTitle">
                Recommended roles
              </div>

              <div className="rolesList">
                {recommendedRoles.map((r, i) => (
                  <div className="roleRow" key={r.name}>
                    <div className="rank">{i + 1}</div>

                    <div className="roleInfo">
                      <div className="rName">
                        {toTitleCase(r.name)}
                      </div>
                    </div>

                    <div className="rBarWrap" aria-hidden>
                      <div className="rBar">
                        <div
                          className="rFill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, r.confidence)
                            )}%`
                          }}
                        />
                      </div>

                      <div className="rPercent">
                        {Math.round(r.confidence)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
