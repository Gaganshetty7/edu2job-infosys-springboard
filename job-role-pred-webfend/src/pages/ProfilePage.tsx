import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
import "../styles/profile.css";

export default function StudentProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="root">
            <NavBar />

            <main className="main profile-main">
                <div className="container profile-container">

                    {/* ---------- BANNER ---------- */}
                    <div className="ProfileBanner">
                        <div className="ProfileBannerInner">
                            <img src="/profile.jpg" className="ProfilePhoto" />

                            <div className="ProfileHeader">
                                <p className="ProfileName">{user?.name}</p>
                                <p className="ProfileDegree">Master of Computer Applications</p>
                                <p className="ProfileEmail">{user?.email}</p>
                            </div>

                            <button className="EditBtn" onClick={()=>{navigate("/edit-profile")}}>Edit Details</button>
                        </div>
                    </div>

                    {/* ---------- GRID ---------- */}
                    <div className="OverviewGrid">

                        {/* Academic Card */}
                        <div className="ProfileCard AcademicCard">
                            <p className="CardTitle">Academic Profile</p>
                            <div className="CardContent">
                                <p className="MainInfo">St. Aloysius University</p>
                                <p className="SubInfo">MCA 2025</p>
                                <p className="HighlightText">CGPA: 8.9</p>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Certifications Card */}
                        <div className="ProfileCard CertificationsCard">
                            <p className="CardTitle">Certifications</p>
                            <div className="CardContent">
                                <p className="MainInfo">AWS Cloud Practitioner</p>
                                <p className="SubInfo">Amazon Web Services</p>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Placement Card */}
                        <div className="ProfileCard PlacementCard">
                            <p className="CardTitle">Placement Status</p>
                            <div className="CardContent">
                                <p className="MainInfo">Python Stack Developer</p>
                                <p className="SubInfo">Infosys</p>
                                <p className="SmallNote">Joining: July 2025</p>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                        {/* Skills Card */}
                        <div className="ProfileCard SkillsCard">
                            <p className="CardTitle">Skills</p>
                            <div className="CardContent">
                                <div className="SkillsList">
                                    <span className="SkillTag">Python</span>
                                    <span className="SkillTag">MySQL</span>
                                    <span className="SkillTag">React</span>
                                    <span className="SkillTag">Java</span>
                                    <span className="SkillTag">AWS</span>
                                    <span className="SkillTag">Cloud Computing</span>
                                    <span className="SkillTag">Django</span>
                                    <span className="SkillTag">TypeScript</span>
                                    <span className="SkillTag">Git</span>
                                    <span className="SkillTag">Docker</span>
                                    <span className="SkillTag">Linux</span>
                                    <span className="SkillTag">Data Structures</span>
                                </div>
                            </div>
                            <span className="SeeMoreLink">See More</span>
                        </div>

                    </div>

                    {/* ---------- PROJECTS ---------- */}
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
