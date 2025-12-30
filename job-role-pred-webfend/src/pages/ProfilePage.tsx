import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import "../styles/profile.css";
import { useAuth } from "../auth/AuthContext";

interface Education {
    id: number;
    degree: string;
    specialization: string;
    university: string;
    cgpa: number;
    year_of_completion: number;
}

interface Certification {
    id: number;
    cert_name: string;
    issuing_organization: string;
}

/* NEW types (all optional for now) */
interface PlacementStatus {
    job_title: string;
    company: string;
}

interface Skill {
    skill_name: string;
}

interface Project {
    title: string;
    description: string;
}

interface UserProfile {
    id: number;
    email: string;
    name: string;
    role: string;
    educations: Education[];
    certifications: Certification[];

    /* Optional — backend will add later */
    placement_status?: PlacementStatus | null;
    skills?: Skill[] | null;
    projects?: Project[] | null;
}

export default function UserProfilePage() {
    const accessToken = useAuth();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const fetchProfile = async () => {
            try {
                const res = await api.get("/accounts/myprofile/");
                setProfile(res.data);
            } catch (err: any) {
                console.log("PROFILE FETCH FAILED:", err?.response || err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [accessToken]);

    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>Error loading profile.</div>;

    return (
        <div className="root">
            <NavBar />

            <main className="main profile-main">
                <div className="container profile-container">

                    <div className="ProfileBanner">
                        <div className="ProfileBannerInner">
                            <img src="/profile.jpg" className="ProfilePhoto" />

                            <div className="ProfileHeader">
                                <p className="ProfileName">{profile.name}</p>

                                {profile.educations[0] ? (
                                    <p className="ProfileDegree">
                                        {profile.educations[0].degree} ({profile.educations[0].specialization})
                                    </p>
                                ) : (
                                    <p className="ProfileDegree">No education added yet</p>
                                )}

                                <p className="ProfileEmail">{profile.email}</p>
                            </div>

                            <button
                                className="EditBtn"
                                onClick={() => navigate("/edit-profile")}
                            >
                                Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="OverviewGrid">

                        {/* Academic */}
                        <div className="ProfileCard AcademicCard">
                            <p className="CardTitle">Academic Profile</p>

                            <div className="CardContent">
                                {profile.educations.length === 0 && (
                                    <p className="SubInfo">No academic records yet</p>
                                )}

                                {profile.educations.map((edu) => (
                                    <div key={edu.id}>
                                        <p className="MainInfo">{edu.university}</p>
                                        <p className="SubInfo">
                                            {edu.degree} — {edu.year_of_completion}
                                        </p>
                                        <p className="HighlightText">CGPA: {edu.cgpa}</p>
                                    </div>
                                ))}
                            </div>

                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Certifications */}
                        <div className="ProfileCard CertificationsCard">
                            <p className="CardTitle">Certifications</p>

                            <div className="CardContent">
                                {profile.certifications.length === 0 && (
                                    <p className="SubInfo">No certifications yet</p>
                                )}

                                {profile.certifications.map((cert) => (
                                    <div key={cert.id}>
                                        <p className="MainInfo">{cert.cert_name}</p>
                                        <p className="SubInfo">{cert.issuing_organization}</p>
                                    </div>
                                ))}
                            </div>

                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Placement */}
                        <div className="ProfileCard PlacementCard">
                            <p className="CardTitle">Placement Status</p>

                            <div className="CardContent">
                                {!profile.placement_status ? (
                                    <p className="SubInfo">No placement status added yet</p>
                                ) : (
                                    <>
                                        <p className="MainInfo">{profile.placement_status.job_title}</p>
                                        <p className="SubInfo">{profile.placement_status.company}</p>
                                    </>
                                )}
                            </div>

                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Skills */}
                        <div className="ProfileCard SkillsCard">
                            <p className="CardTitle">Skills</p>

                            <div className="CardContent">
                                {!profile.skills || profile.skills.length === 0 ? (
                                    <p className="SubInfo">No skills added yet</p>
                                ) : (
                                    <div className="SkillsList">
                                        {profile.skills.map((skill, index) => (
                                            <span key={index} className="SkillTag">
                                                {skill.skill_name} {/* <-- Corrected */}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <span className="SeeMoreLink">See More</span>
                        </div>

                    </div>

                    {/* Projects */}
                    <div className="ProjectsSection">
                        <p className="CardTitle">Projects</p>

                        {!profile.projects || profile.projects.length === 0 ? (
                            <p className="SubInfo">No projects added yet</p>
                        ) : (
                            profile.projects.map((project, index) => (
                                <div key={index} className="ProjectCard">
                                    <h3 className="ProjectTitle">{project.title}</h3>
                                    <p className="ProjectDesc">{project.description}</p>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
