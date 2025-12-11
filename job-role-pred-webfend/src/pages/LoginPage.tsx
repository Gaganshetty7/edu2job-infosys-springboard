import LoginForm from "../components/LoginForm";
import type { CSSProperties } from "react";

export default function LoginPage() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <LoginForm />
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  pageContainer: {
    minHeight: "100vh", 
    display: "flex",
    justifyContent: "center", 
    alignItems: "center", 
    padding: "20px", 
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px", 
  },
};