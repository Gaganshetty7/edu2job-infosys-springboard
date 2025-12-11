import RegisterForm from "../components/RegisterForm";
import type { CSSProperties } from "react";

export default function RegisterPage() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <RegisterForm />
      </div>
    </div>
  );
}

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
