// src/components/NavBar.tsx
import type { CSSProperties } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={styles.navbar}>
      <span style={styles.name} onClick={() => navigate("/")}>Edu2Job</span>

      <div style={styles.navButtonsDiv}>
        {user ? (
          <>
            {!(user?.role === "ADMIN") && (
              <a style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                }}>Dashboard</a>
            )}

            <a style={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                navigate("/predict");
              }}>Predict</a>

            {!(user?.role === "ADMIN") && (
              <a style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/profile");
                }}>Profile</a>
            )}

            {user?.role === "ADMIN" && (
              <a
                style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/admin");
                }}
              >
                Admin Panel
              </a>
            )}

              <a
                style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/testimonials");
                }}
              >
                Testimonals
              </a>

            {user?.role === "ADMIN" && (
              <a
                style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/admin-visuals");
                }}
              >
                Visualizations
              </a>
            )}


            <button
              style={styles.navButtonPrimary}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button style={styles.navButtonOutline} onClick={() => navigate("/login")}>
              Login
            </button>
            <button style={styles.navButtonPrimary} onClick={() => navigate("/signup")}>
              Signup
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: CSSProperties } = {
  navbar: {
    display: "flex",
    height: "80px",
    width: "100%",
    padding: "10px 20px",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  name: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1e4fa3",
    cursor: "pointer",
  },
  navButtonsDiv: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  navButtonOutline: {
    backgroundColor: "transparent",
    color: "#1e4fa3",
    border: "1px solid #d7e6ff",
    borderRadius: "10px",
    padding: "6px 12px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: 600,
  },
  navButtonPrimary: {
    backgroundColor: "#1e4fa3",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "6px 12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  navLink: {
    color: "#1e4fa3",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  }
};

export default NavBar;
