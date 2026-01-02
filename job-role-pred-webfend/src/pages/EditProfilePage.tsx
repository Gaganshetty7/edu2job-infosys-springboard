import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import "../styles/editprofile.css";
import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [educations, setEducations] = useState([
    { degree: "", specialization: "", university: "", cgpa: "", year: "" },
  ]);

  const [certs, setCerts] = useState([
    { certName: "", certOrg: "", certDate: "" },
  ]);

  // placement
  const [placement, setPlacement] = useState({
    company: "",
    job_title: "",
    joining_date: "",
  });

  // projects
  const [projects, setProjects] = useState([
    { title: "", description: "" },
  ]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    skills: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    type?: "edu" | "cert" | "project" | "placement"
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

    if (type === "project" && index !== undefined) {
      const copy = [...projects];
      copy[index] = { ...copy[index], [e.target.name]: e.target.value };
      setProjects(copy);
      return;
    }

    if (type === "placement") {
      setPlacement({ ...placement, [e.target.name]: e.target.value });
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

  // ---------- PROJECT ----------
  const addProject = () =>
    setProjects([...projects, { title: "", description: "" }]);

  const removeProject = () => {
    if (projects.length === 1) return;
    setProjects(projects.slice(0, -1));
  };

  // ---------- VALIDATION ----------
  const validate = () => {
    const newErrors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Invalid email";

    educations.forEach((e, i) => {
      if (!e.degree) newErrors[`degree_${i}`] = "Required";
      if (!e.specialization) newErrors[`specialization_${i}`] = "Required";
      if (!e.university) newErrors[`university_${i}`] = "Required";
    });

    // joining date CAN be future — only ensure it's a valid date if entered
    if (placement.joining_date) {
      const d = new Date(placement.joining_date);
      if (isNaN(d.getTime())) newErrors.joining_date = "Enter a valid date";
    }

    projects.forEach((p, i) => {
      if (!p.title) newErrors[`project_title_${i}`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {

      // Prepare payload for API
      const payload = {
        name: form.name,
        email: form.email,
        educations: educations.map((edu) => ({
          degree: edu.degree,
          specialization: edu.specialization,
          university: edu.university,
          cgpa: parseFloat(edu.cgpa) || 0.0,
          year_of_completion: parseInt(edu.year) || 0,
        })),
        certifications: certs.map((c) => ({
          cert_name: c.certName,
          issuing_organization: c.certOrg,
          issue_date: c.certDate || null,
        })),
        placement_status: {
          company: placement.company,
          job_title: placement.job_title,
          joining_date: placement.joining_date || null,
        },
        skills: form.skills.split(",").map((s) => ({ skill_name: s.trim() })),
        projects: projects.map((p) => ({
          title: p.title,
          description: p.description,
        })),
      };

      const res = await api.put("/accounts/updateprofile/", payload);

      if (res.status === 200) {
        alert("Profile updated successfully!");
        navigate(-1);
      } else {
        alert("Failed to update profile. Please try again.");
      }

    } catch (err: any) {
      console.error("Update failed", err);
      alert("Error updating profile: " + (err.response?.data?.error || err.message));
    }
  };

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/accounts/myprofile/");
        const data = res.data;
        console.log("PROFILE DATA:", data);

        // Populating basic info
        setForm({
          name: data.name || "",
          email: data.email || "",
          skills: data.skills ? data.skills.map((s: any) => s.skill_name).join(", ") : "",
        });

        // Populating educations
        if (data.educations && data.educations.length > 0) {
          setEducations(
            data.educations.map((edu: any) => ({
              degree: edu.degree || "",
              specialization: edu.specialization || "",
              university: edu.university || "",
              cgpa: edu.cgpa || "",
              year: edu.year_of_completion || "",
            }))
          );
        }

        // Populating certifications
        if (data.certifications && data.certifications.length > 0) {
          setCerts(
            data.certifications.map((cert: any) => ({
              certName: cert.cert_name || "",
              certOrg: cert.issuing_organization || "",
              certDate: cert.issue_date || "",
            }))
          );
        }

        // Populating placement
        if (data.placement_status) {
          setPlacement({
            company: data.placement_status.company || "",
            job_title: data.placement_status.job_title || "",
            joining_date: data.placement_status.joining_date || "",
          });
        }

        // Populating projects
        if (data.projects && data.projects.length > 0) {
          setProjects(
            data.projects.map((proj: any) => ({
              title: proj.title || "",
              description: proj.description || "",
            }))
          );
        }

      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="edit-root">
      <NavBar />

      <main className="edit-main">
        <div className="edit-container">
          <div className="edit-container-header">
            <label className="edit-title">Edit Profile</label>
            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
          </div>
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
                {errors.name && <small className="error-text">{errors.name}</small>}
              </div>

              <div className="edit-group">
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="info-input"
                />
                {errors.email && <small className="error-text">{errors.email}</small>}
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
                      {errors[`degree_${idx}`] && (
                        <small className="error-text">{errors[`degree_${idx}`]}</small>
                      )}
                    </div>

                    <div className="edit-group">
                      <label>Specialization</label>
                      <input
                        name="specialization"
                        value={edu.specialization}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                      {errors[`specialization_${idx}`] && (
                        <small className="error-text">{errors[`specialization_${idx}`]}</small>
                      )}
                    </div>

                    <div className="edit-group">
                      <label>University</label>
                      <input
                        name="university"
                        value={edu.university}
                        onChange={(e) => handleChange(e, idx, "edu")}
                      />
                      {errors[`university_${idx}`] && (
                        <small className="error-text">{errors[`university_${idx}`]}</small>
                      )}
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
                    className={`RemoveLink ${educations.length === 1 ? "disabled" : ""
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
                      {errors[`certDate_${idx}`] && (
                        <small className="error-text">{errors[`certDate_${idx}`]}</small>
                      )}
                    </div>
                  </div>
                ))}

                <div className="edit-actions">
                  <span className="AddMoreLink" onClick={addCert}>
                    + Add Certification
                  </span>

                  <span
                    className={`RemoveLink ${certs.length === 1 ? "disabled" : ""
                      }`}
                    onClick={removeCert}
                  >
                    - Remove Certification
                  </span>
                </div>
              </div>
            </div>

            {/* PLACEMENT */}
            <div className="edit-section">
              <label className="edit-section-title">Placement Status</label>

              <div className="edit-grid-bg">
                <div className="edit-grid">
                  <div className="edit-group">
                    <label>Company</label>
                    <input
                      name="company"
                      value={placement.company}
                      onChange={(e) => handleChange(e, undefined, "placement")}
                    />
                  </div>

                  <div className="edit-group">
                    <label>Job Title</label>
                    <input
                      name="job_title"
                      value={placement.job_title}
                      onChange={(e) => handleChange(e, undefined, "placement")}
                    />
                  </div>

                  <div className="edit-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      name="joining_date"
                      value={placement.joining_date}
                      onChange={(e) => handleChange(e, undefined, "placement")}
                    />
                    {errors.joining_date && (
                      <small className="error-text">{errors.joining_date}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PROJECTS */}
            <div className="edit-section">
              <label className="edit-section-title">Projects</label>

              <div className="edit-grid-bg">
                {projects.map((p, idx) => (
                  <div className="edit-grid" key={idx}>
                    <div className="edit-group">
                      <label>Project Title</label>
                      <input
                        name="title"
                        value={p.title}
                        onChange={(e) => handleChange(e, idx, "project")}
                      />
                      {errors[`project_title_${idx}`] && (
                        <small className="error-text">
                          {errors[`project_title_${idx}`]}
                        </small>
                      )}
                    </div>

                    <div className="edit-group">
                      <label>Description</label>
                      <input
                        name="description"
                        value={p.description}
                        onChange={(e) => handleChange(e, idx, "project")}
                      />
                    </div>
                  </div>
                ))}

                <div className="edit-actions">
                  <span className="AddMoreLink" onClick={addProject}>
                    + Add Project
                  </span>

                  <span
                    className={`RemoveLink ${projects.length === 1 ? "disabled" : ""
                      }`}
                    onClick={removeProject}
                  >
                    - Remove Project
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
