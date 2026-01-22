import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../styles/testimonials.css";
import { useNavigate } from "react-router-dom";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
};

export default function TestimonialsPage() {

  const navigate = useNavigate();

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Recent Graduate, Computer Science",
      text: "This platform helped me identify the right career path based on my skills. The predictions were incredibly accurate and gave me confidence in my job search. Within two weeks, I landed my first role as a Frontend Developer!",
      rating: 5
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Career Switcher, 3 years experience",
      text: "I was transitioning from a non-tech background and wasn't sure which roles to target. The ML predictions highlighted opportunities I hadn't considered. Now I'm working as a Data Analyst and loving it.",
      rating: 5
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "Final Year Student, Information Technology",
      text: "The role predictions gave me clarity on what skills to focus on during my final semester. I appreciated how the system explained why certain roles matched my profile. Very transparent and helpful.",
      rating: 4
    },
    {
      id: 4,
      name: "Vikram Reddy",
      role: "Junior Developer, 1 year experience",
      text: "I used this to validate my career progression plans. The predictions confirmed I was on the right track and suggested adjacent roles I could explore. Great tool for career planning!",
      rating: 5
    },
    {
      id: 5,
      name: "Meera Singh",
      role: "Fresher, Electronics Engineering",
      text: "As someone from a non-CS background, I was unsure about entering tech. The predictions showed me roles that matched my analytical skills and engineering mindset. Now I'm pursuing a career in IoT development.",
      rating: 4
    },
    {
      id: 6,
      name: "Arjun Desai",
      role: "Mid-Level Professional, 5 years experience",
      text: "I wanted to explore leadership roles but didn't know if I was ready. The platform's predictions gave me insights into what skills I needed to develop. Very valuable for career advancement planning.",
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="testRating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "starFilled" : "starEmpty"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="root">
      <NavBar />

      <div className="container pgHeader">
        <div className="testHeaderContent">
          <h2 className="pgTitle">What Our Users Say</h2>
        </div>
      </div>

      <div className="container testContent">
        <div className="testGrid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testCard glassBox">
              <div className="testText">"{testimonial.text}"</div>
              
              <div className="testDivider"></div>
              
              <div className="testFooter">
                <div className="testUserInfo">
                  <div className="testUser">{testimonial.name}</div>
                  <div className="testRole">{testimonial.role}</div>
                </div>
                {renderStars(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>

        <div className="testCta glassBox">
          <div className="ctaTitle">Ready to discover your ideal career path?</div>
          <div className="ctaText">
            Join thousands of users who have found clarity in their career journey with our AI-powered predictions.
          </div>
          <button className="ctaBtn" type="button" onClick={() => navigate("/predict")}>
            Get Started
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}