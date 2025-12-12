// Dashboard.tsx
import NavBar from "../components/NavBar";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
// import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

type Skill = { name: string; score: number }; // 0-100
type Role = { name: string; confidence: number };

export type DashboardProps = {
  userName: string;
  topRole: Role;
  avgConfidence: number; // 0-100
  totalPredictions: number;
  skills: Skill[]; // ordered or not
  recommendedRoles: Role[]; // top 3-5
  onViewRoadmap?: () => void;
};

export default function Dashboard({
  //userName,
  topRole,
  avgConfidence,
  totalPredictions,
  skills,
  recommendedRoles,
  onViewRoadmap,
}: DashboardProps) {

  const { user } = useAuth();
  // const navigate = useNavigate();

  return (
    <div className="root">
      <NavBar />
      <div className="dashRoot">
        <div className="header">
          <div className="welcome">
            <div className="wHi">Welcome back,</div>
            <div className="name">{user?.name}</div>
          </div>

          <div className="topRow">
            <div className="predictedRoleCard">
              <div className="label">Top prediction</div>
              <div className="roleWrap">
                <div className="roleName">{topRole.name}</div>
                <div className="roleConf">{Math.round(topRole.confidence)}%</div>
              </div>
              <div className="explain">Based on your skills & activity</div>
              <button
                className="btn"
                onClick={() => (onViewRoadmap ? onViewRoadmap() : null)}
                aria-label="View career roadmap"
              >
                View roadmap
              </button>
            </div>

            <div className="confidenceCard">
              <div className="cLabel">Avg confidence</div>
              <div className="cValue">{Math.round(avgConfidence)}%</div>
              <div className="meta">from {totalPredictions} predictions</div>
              <div className="meter" aria-hidden>
                <div
                  className="meterFill"
                  style={{ width: `${Math.max(0, Math.min(100, avgConfidence))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mainGrid">
          <div className="skillsCard">
            <div className="cardTitle">Skill match</div>
            <div className="skillsList">
              {skills.map((s) => (
                <div className="skillRow" key={s.name}>
                  <div className="skillName">{s.name}</div>
                  <div className="skillBar" aria-hidden>
                    <div
                      className="skillFill"
                      style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }}
                    />
                  </div>
                  <div className="skillPct">{Math.round(s.score)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rolesCard">
            <div className="cardTitle">Recommended roles</div>
            <div className="rolesList">
              {recommendedRoles.map((r, i) => (
                <div className="roleRow" key={r.name}>
                  <div className="rank">{i + 1}</div>
                  <div className="roleInfo">
                    <div className="rName">{r.name}</div>
                    <div className="rMeta">Confidence {Math.round(r.confidence)}%</div>
                  </div>
                  <div className="rBarWrap" aria-hidden>
                    <div className="rBar">
                      <div
                        className="rFill"
                        style={{ width: `${Math.max(0, Math.min(100, r.confidence))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

/* -------------------------
  Example usage (copy into a page)
   ------------------------- */
// Example data - replace with real API data
export const exampleData: DashboardProps = {
  userName: "Suryansh",
  topRole: { name: "Data Scientist", confidence: 76 },
  avgConfidence: 92,
  totalPredictions: 3,
  skills: [
    { name: "Problem Solving", score: 82 },
    { name: "Programming", score: 76 },
    { name: "Data Analysis", score: 68 },
    { name: "Communication", score: 70 },
  ],
  recommendedRoles: [
    { name: "Data Scientist", confidence: 78 },
    { name: "ML Engineer", confidence: 75 },
    { name: "Full Stack Developer", confidence: 72 },
  ],
  onViewRoadmap: () => {
    // navigate or open roadmap modal
    console.log("Open roadmap");
  },
};
