import React, { useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/prediction.css";
import Footer from "../components/Footer";

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
    const [skills, setSkills] = useState("");
    const [preds, setPreds] = useState<RolePred[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<FullPrediction[]>([]);

    function parseSkills(s: string) {
        return s
            .split(",")
            .map((x) => x.trim().toLowerCase())
            .filter(Boolean);
    }

    function mockPredict(degreeVal: string, skillsVal: string): RolePred[] {
        const s = parseSkills(skillsVal);

        const buckets: Record<string, string[]> = {
            "Data Scientist": ["python", "pandas", "numpy", "ml", "data", "statistics"],
            "Full Stack Developer": ["react", "javascript", "node", "frontend", "backend"],
            "ML Engineer": ["pytorch", "tensorflow", "ml", "deployment"],
            "DevOps Engineer": ["docker", "kubernetes", "ci", "aws"],
            "Product Manager": ["strategy", "roadmap", "communication"]
        };

        const results: RolePred[] = [];

        for (const [role, keys] of Object.entries(buckets)) {
            let score = 10;
            const reasons: string[] = [];

            // Degree effect
            if (/m\.?sc|b\.?tech|bsc|mca|phd/i.test(degreeVal)) {
                score += 12;
                reasons.push("Relevant educational background");
            }

            // Skill matches
            let matches = 0;
            for (const key of keys) {
                if (s.some((ss) => ss.includes(key))) {
                    matches++;
                }
            }

            if (matches > 0) {
                score += matches * 15;
                reasons.push(`${matches} matching skill${matches > 1 ? "s" : ""}`);
            }

            score = Math.min(100, score);

            results.push({
                role,
                confidence: score,
                reasons
            });
        }

        return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }

    async function handlePredict(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!skills.trim()) return;

        setLoading(true);
        setPreds(null);

        await new Promise((res) => setTimeout(res, 300));

        const result = mockPredict(degree, skills);
        setPreds(result);

        const entry: FullPrediction = {
            id: Date.now(),
            degree,
            skills,
            results: result,
            time: new Date().toLocaleString()
        };

        setHistory((prev) => [entry, ...prev]);

        setLoading(false);
    }

    function handleReset() {
        setDegree("");
        setSkills("");
        setPreds(null);
    }

    const clearHistory = () => {
        setHistory([]);
    };


    return (
        <div className="root">
            <NavBar />

            <div className="container pgHeader">
                <h2 className="pgTitle">Predict Job Role</h2>
            </div>

            <div className="page container">
                {/* LEFT FORM PANEL */}
                <form className="leftBox glassBox predCard" onSubmit={handlePredict}>
                    <div className="cardTitle">Profile Summary</div>

                    <label className="lbl">Highest degree</label>
                    <select
                        className="input"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                    >
                        <option value="">Select degree</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="MCA">MCA</option>
                        <option value="PhD">PhD</option>
                    </select>

                    <label className="lbl">Skills (comma separated)</label>
                    <input
                        className="input"
                        placeholder="Python, React, SQL..."
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />

                    <div className="btnRow">
                        <button className="btnPrimary" type="submit" disabled={loading}>
                            {loading ? "Predicting..." : "Predict Now"}
                        </button>
                        <button type="button" className="btnOutline" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </form>

                {/* RIGHT RESULT PANEL */}
                <div className="rightBox">
                    <div className="predHeader">Predicted Roles</div>

                    <div className="predWrap">
                        {!preds ? (
                            <div className="empty">
                                No results yet — enter skills & click Predict.
                                <div className="hint">Tip: use core skills like “React”, “SQL”, “Docker”.</div>
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

            {/* BOTTOM FULL-WIDTH HISTORY PANEL */}
            <div className="prevPanel container glassBox">
                <div className="prevHeader">
                    <div className="prevTitle">Previous Predictions</div>
                    <button className="clear-btn" onClick={clearHistory}>Clear</button>
                </div>

                {history.length === 0 ? (
                    <div className="emptySmall">No previous predictions yet.</div>
                ) : (
                    <div className="prevList">
                        {history.map((h) => (
                            <div key={h.id} className="prevItem">
                                <div className="prevTop">
                                    <div className="prevMeta">
                                        <div><strong>Degree:</strong> {h.degree || "—"}</div>
                                        <div><strong>Skills:</strong> {h.skills}</div>
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
