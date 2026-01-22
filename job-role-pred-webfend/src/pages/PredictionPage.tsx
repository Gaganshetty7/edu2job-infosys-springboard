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
  const [predictionId, setPredictionId] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "approved" | "flagged">("idle");

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

      setPredictionId(data.prediction_id);
      setFeedbackStatus("idle");

      const formatted: RolePred[] = results.map((item: any) => ({
        role: item.role,
        confidence: Math.round(Number(item.confidence)),
        reasons: Array.isArray(item.reasons) ? item.reasons : [],
      }));

      setPreds(formatted);

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

  // prediction feedback/approval
  const sendFeedback = async (action: "approve" | "flag") => {
    if (!predictionId || feedbackStatus !== "idle") return;

    try {
      const token = localStorage.getItem("access");
      const API = import.meta.env.VITE_API_BASE;

      const resp = await fetch(
        `${API}/api/ml/prediction/${predictionId}/feedback/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!resp.ok) throw new Error("Feedback failed");

      setFeedbackStatus(action === "approve" ? "approved" : "flagged");
    } catch (err) {
      console.error("Feedback error:", err);
    }
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

      <div className="container mainContent">
        {/* Row 1: Two Columns - Input Form & Predicted Roles */}
        <div className="predGrid">
          {/* Left Column - Input Form */}
          <div className="inputSection">
            <div className="predHeader">Predict Job Role</div>
            <div className="predCard glassBox">

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
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    borderRadius: '10px',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                    },
                  }),
                }}
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
                  type="button"
                  onClick={handlePredict}
                  disabled={loading || !degree || !selectedSkills.length || !experience}
                >
                  {loading ? "Predicting..." : "Predict Now"}
                </button>
                <button type="button" className="btnOutline" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Predicted Roles */}
          <div className="resultsSection">
            <div className="predHeader">Predicted Roles</div>
            <div className="predWrap">
              {!preds ? (
                <div className="empty">
                  No results yet — select skills and click Predict.
                </div>
              ) : (
                preds.slice(0, 3).map((p) => (
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

        {/* Row 2: Feedback Section (conditional) */}
        {preds && preds.length > 0 && predictionId && (
          <div className="feedbackSection glassBox">
            <div className="feedbackTitle">Prediction Feedback</div>
            {feedbackStatus === "idle" ? (
              <>
                <div className="feedbackText">
                  Is the predicted role accurate?
                </div>
                <div className="btnRow feedbackBtns">
                  <button
                    type="button"
                    className="btnApprove"
                    onClick={() => sendFeedback("approve")}
                  >
                    Yes, Accurate
                  </button>
                  <button
                    type="button"
                    className="btnFlag"
                    onClick={() => sendFeedback("flag")}
                  >
                    Not Accurate
                  </button>
                </div>
              </>
            ) : (
              <div className="feedbackThanks">
                Thank you for your feedback!
              </div>
            )}
          </div>
        )}

        {/* Row 3: Previous Predictions (always visible) */}
        <div className="prevPanel glassBox">
          <div className="prevHeader">
            <div className="prevTitle">Previous Predictions</div>
            {history.length > 0 && (
              <button className="clearBtn" onClick={clearHistory}>
                Clear
              </button>
            )}
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
      </div>

      <Footer />
    </div>
  );
}