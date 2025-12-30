import React, { useState, useEffect } from "react";
import Select from "react-select";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../styles/prediction.css";

type RolePred = {
  role: string;
  confidence: number;
  reasons: string[];
};

type FullPrediction = {
  id: number;
  degree: string;
  skills: string;
  results: RolePred[];
  time: string;
};

export default function PredictionPage() {
  const [degree, setDegree] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<{ label: string; value: string }[]>([]);
  const [experience, setExperience] = useState("");

  const [preds, setPreds] = useState<RolePred[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<FullPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<{
    qualification: string[];
    skills: string[];
    experience_level: string[];
  } | null>(null);

  // Fetch metadata from backend for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE;

        const resp = await fetch(`${API}/api/ml/metadata/`);

        if (!resp.ok) throw new Error("Failed to fetch metadata");
        const data = await resp.json();
        setMetadata(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetadata();
  }, []);

  const skillOptions = metadata?.skills.map((s) => ({ label: s, value: s })) || [];

  // Submit prediction
  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const skillString = selectedSkills.map((s) => s.value).join(", ");
    if (!skillString || !degree.trim() || !experience.trim()) return;

    setLoading(true);
    setPreds(null);
    setError(null);

    try {
      const token = localStorage.getItem("access");
      const API = import.meta.env.VITE_API_BASE;

      const resp = await fetch(`${API}/api/ml/predict/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          skills: skillString,
          qualification: degree,
          experience_level: experience,
        }),
      });

      if (!resp.ok) throw new Error("Prediction failed");

      const data = await resp.json();
      const results = data.predicted_role || [];

      const formatted: RolePred[] = results.map((item: any) => ({
        role: item.role,
        confidence: Math.round(Number(item.confidence)),
        reasons: Array.isArray(item.reasons) ? item.reasons : [],
      }));

      setPreds(formatted);

      // Store prediction in history
      const entry: FullPrediction = {
        id: Date.now(),
        degree,
        skills: skillString,
        results: formatted,
        time: new Date().toLocaleString(),
      };

      setHistory((prev) => [entry, ...prev]);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setDegree("");
    setSelectedSkills([]);
    setExperience("");
    setPreds(null);
    setError(null);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="root">
      <NavBar />

      <div className="container pgHeader">
        <h2 className="pgTitle">Predict Job Role</h2>
      </div>

      <div className="page container">
        <form className="leftBox glassBox predCard" onSubmit={handlePredict}>
          <div className="cardTitle">Profile Summary</div>

          <label className="lbl">Highest degree</label>
          <select className="input" value={degree} onChange={(e) => setDegree(e.target.value)}>
            <option value="" disabled>
              Select degree
            </option>
            {metadata?.qualification.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          <label className="lbl">Skills</label>
          <Select
            isMulti
            options={skillOptions}
            value={selectedSkills}
            onChange={(skills) => setSelectedSkills(skills as any)}
            placeholder="Select skills"
          />

          <label className="lbl">Experience level</label>
          <select className="input" value={experience} onChange={(e) => setExperience(e.target.value)}>
            <option value="" disabled>
              Select experience level
            </option>
            {metadata?.experience_level.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {error && <div className="errBox">{error}</div>}

          <div className="btnRow">
            <button
              className="btnPrimary"
              type="submit"
              disabled={loading || !degree || !selectedSkills.length || !experience}
            >
              {loading ? "Predicting..." : "Predict Now"}
            </button>
            <button type="button" className="btnOutline" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        <div className="rightBox">
          <div className="predHeader">Predicted Roles</div>
          <div className="predWrap">
            {!preds ? (
              <div className="empty">
                No results yet — select skills and click Predict.
              </div>
            ) : (
              preds.map((p) => (
                <div key={p.role} className="roleCard">
                  <div className="roleRow">
                    <div className="roleTitle">{p.role}</div>
                    <div className="confVal">{p.confidence}%</div>
                  </div>
                  <div className="confBar">
                    <div className="confFill" style={{ width: `${p.confidence}%` }} />
                  </div>
                  {p.reasons.length > 0 && (
                    <ul className="reasons">
                      {p.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="prevPanel container glassBox">
        <div className="prevHeader">
          <div className="prevTitle">Previous Predictions</div>
          <button className="clear-btn" onClick={clearHistory}>
            Clear
          </button>
        </div>

        {history.length === 0 ? (
          <div className="emptySmall">No previous predictions yet.</div>
        ) : (
          <div className="prevList">
            {history.map((h) => (
              <div key={h.id} className="prevItem">
                <div className="prevTop">
                  <div className="prevMeta">
                    <div>
                      <strong>Degree:</strong> {h.degree || "—"}
                    </div>
                    <div>
                      <strong>Skills:</strong> {h.skills}
                    </div>
                  </div>
                  <div className="prevTime">{h.time}</div>
                </div>
                <div className="prevRoles">
                  {h.results.map((r) => (
                    <div key={r.role} className="prevRoleTag">
                      {r.role} ({r.confidence}%)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
