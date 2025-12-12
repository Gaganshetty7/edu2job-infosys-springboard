// src/components/LandingPage.tsx
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import careerIcon from "../assets/images/icons8-career-100.png";
import Footer from "../components/Footer";

import "./../styles/landing.css";

export default function LandingPage() {

  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  
  const handleGetStarted = () => {
    if (user && accessToken) navigate("/dashboard");
    else navigate("/login");
  };

  return (
    <div className="root">
      {/* NavBar */}
      <NavBar />

      {/* Hero Section */}
      <main className="main">
        <div className="hero">
          <div className="container hero-inner">
            <div className="hero-text">
              <h1 className="hero-title">Predict Your Job from Your Education</h1>
              <p className="tagline">
                Edu2Job analyzes your academic background, skills, and interests and suggests career paths with predicted placement likelihood and next steps.
              </p>
              <div className="hero-cta">
                <button className="btn primary-btn" onClick={handleGetStarted}>
                  Try free prediction
                </button>
              </div>
            </div>
            <div className="hero-illustration">
              <img className="careerIcon" src={careerIcon} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
    </div>
  );
}
