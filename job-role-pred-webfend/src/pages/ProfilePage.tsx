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

interface UserProfile {
    id: number;
    email: string;
    name: string;
    role: string;
    educations: Education[];
    certifications: Certification[];
}

export default function UserProfilePage() {
    const accessToken = useAuth();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!accessToken) return;   // do NOT call until token exists

        const fetchProfile = async () => {
            try {
                const res = await api.get("/accounts/myprofile/");
                setProfile(res.data);
            } catch (err: any) {
                console.log("PROFILE FETCH FAILED:", err.response || err);
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

                            <button className="EditBtn" onClick={() => navigate("/edit-profile")}>
                                Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="OverviewGrid">

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

                        <div className="ProfileCard PlacementCard">
                            <p className="CardTitle">Placement Status</p>
                            <div className="CardContent">
                                <p className="MainInfo">Python Stack Developer</p>
                                <p className="SubInfo">Infosys</p>
                                <p className="SmallNote">Joining: July 2025</p>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                        <div className="ProfileCard SkillsCard">
                            <p className="CardTitle">Skills</p>
                            <div className="CardContent">
                                <div className="SkillsList">
                                    <span className="SkillTag">Python</span>
                                    <span className="SkillTag">MySQL</span>
                                    <span className="SkillTag">React</span>
                                    <span className="SkillTag">Java</span>
                                    <span className="SkillTag">AWS</span>
                                    <span className="SkillTag">Django</span>
                                </div>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                    </div>

                    <div className="ProjectsSection">
                        <p className="SectionTitle">Projects</p>

                        <div className="ProjectCard">
                            <h3 className="ProjectTitle">Digpal – Personal Safety App</h3>
                            <p className="ProjectDesc">React Native + Django SOS and night travel system.</p>
                        </div>

                        <div className="ProjectCard">
                            <h3 className="ProjectTitle">CareerPath.ai</h3>
                            <p className="ProjectDesc">
                                AI + Human powered career guidance with real-time suggestions.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
