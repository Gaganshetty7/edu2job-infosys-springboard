import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import "../styles/editprofile.css";
import { useState } from "react";

export default function EditProfilePage() {
  const { user } = useAuth();

  const [educations, setEducations] = useState([
    { degree: "", specialization: "", university: "", cgpa: "", year: "" },
  ]);

  const [certs, setCerts] = useState([
    { certName: "", certOrg: "", certDate: "" },
  ]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    skills: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    type?: "edu" | "cert"
  ) => {
    if (type === "edu" && index !== undefined) {
      const copy = [...educations];
      copy[index] = { ...copy[index], [e.target.name]: e.target.value };
      setEducations(copy);
      return;
    }

    if (type === "cert" && index !== undefined) {
      const copy = [...certs];
      copy[index] = { ...copy[index], [e.target.name]: e.target.value };
      setCerts(copy);
      return;
    }

    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------- EDUCATION ----------
  const addEducation = () =>
    setEducations([
      ...educations,
      { degree: "", specialization: "", university: "", cgpa: "", year: "" },
    ]);

  const removeEducation = () => {
    if (educations.length === 1) return;
    setEducations(educations.slice(0, -1));
  };

  // ---------- CERTIFICATION ----------
  const addCert = () =>
    setCerts([...certs, { certName: "", certOrg: "", certDate: "" }]);

  const removeCert = () => {
    if (certs.length === 1) return;
    setCerts(certs.slice(0, -1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      ...form,
      educations,
      certifications: certs,
    });
  };

  return (
    <div className="edit-root">
      <NavBar />

      <main className="edit-main">
        <div className="edit-container">
          <label className="edit-title">Edit Profile</label>

          <form className="edit-form" onSubmit={handleSubmit}>
            {/* BASIC INFO */}
            <div className="edit-section">
              <div className="edit-group">
                <label>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="info-input"
                />
              </div>

              <div className="edit-group">
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="info-input"
                />
              </div>
            </div>

            {/* EDUCATION */}
            <div className="edit-section">
              <label className="edit-section-title">Education</label>

              <div className="edit-grid-bg">
                {educations.map((edu, idx) => (
                  <div className="edit-grid" key={idx}>
                    <div className="edit-group">
                      <label>Degree</label>
                      <input
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>Specialization</label>
                      <input
                        name="specialization"
                        value={edu.specialization}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>University</label>
                      <input
                        name="university"
                        value={edu.university}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>CGPA</label>
                      <input
                        name="cgpa"
                        value={edu.cgpa}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>Year of Completion</label>
                      <input
                        name="year"
                        value={edu.year}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                    </div>
                  </div>
                ))}

                <div className="edit-actions">
                  <span className="AddMoreLink" onClick={addEducation}>
                    + Add Education
                  </span>

                  <span
                    className={`RemoveLink ${
                      educations.length === 1 ? "disabled" : ""
                    }`}
                    onClick={removeEducation}
                  >
                    - Remove Education
                  </span>
                </div>
              </div>
            </div>

            {/* CERTIFICATIONS */}
            <div className="edit-section">
              <label className="edit-section-title">Certification</label>

              <div className="edit-grid-bg">
                {certs.map((c, idx) => (
                  <div className="edit-grid" key={idx}>
                    <div className="edit-group">
                      <label>Certificate Name</label>
                      <input
                        name="certName"
                        value={c.certName}
                        onChange={(e) => handleChange(e, idx, "cert")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>Organization</label>
                      <input
                        name="certOrg"
                        value={c.certOrg}
                        onChange={(e) => handleChange(e, idx, "cert")}
                      />
                    </div>

                    <div className="edit-group">
                      <label>Issue Date</label>
                      <input
                        type="date"
                        name="certDate"
                        value={c.certDate}
                        onChange={(e) => handleChange(e, idx, "cert")}
                      />
                    </div>
                  </div>
                ))}

                <div className="edit-actions">
                  <span className="AddMoreLink" onClick={addCert}>
                    + Add Certification
                  </span>

                  <span
                    className={`RemoveLink ${
                      certs.length === 1 ? "disabled" : ""
                    }`}
                    onClick={removeCert}
                  >
                    - Remove Certification
                  </span>
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <div className="edit-section">Skills (comma separated)</div>

            <div className="edit-group">
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Python, React, MySQL"
              />
            </div>

            <button className="edit-save">Save Changes</button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
