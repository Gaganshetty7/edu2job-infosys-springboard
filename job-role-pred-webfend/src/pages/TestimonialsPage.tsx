import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import "../styles/testimonials.css";
import { useAuth } from "../auth/AuthContext";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  testimonial_text: string;
  rating: number;
  status: string;
  created_at: string;
}

interface FormData {
  name: string;
  role: string;
  message: string;
  rating: number;
}

export default function TestimonialsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    role: "",
    message: "",
    rating: 5
  });

  // Fetch approved testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get("accounts/testimonials/");
      setTestimonials(res.data);
    } catch (err: any) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Map message to testimonial_text for backend
      const payload = {
        name: formData.name,
        role: formData.role,
        testimonial_text: formData.message,
        rating: formData.rating,
      };
      await api.post("accounts/testimonials/submit/", payload);
      setSuccess(true);
      setFormData({ name: "", role: "", message: "", rating: 5 });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  };

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
          {user && (
            <p className="testSubtitle">Share your experience with our platform</p>
          )}
        </div>
      </div>

      <div className="container testContent">

        {/* User Feedback Form */}
        {user && (
          <div className="feedbackForm glassBox">
            <h3 className="formTitle">Share Your Experience</h3>

            {success && (
              <div className="successMessage">
                Thank you! Your testimonial is pending admin approval.
              </div>
            )}

            {error && (
              <div className="errorMessage">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="formGrid">
                <div className="formGroup">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="role">Role / Designation</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="formGroup">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="5">★★★★★ (5 stars)</option>
                  <option value="4">★★★★☆ (4 stars)</option>
                  <option value="3">★★★☆☆ (3 stars)</option>
                  <option value="2">★★☆☆☆ (2 stars)</option>
                  <option value="1">★☆☆☆☆ (1 star)</option>
                </select>
              </div>

              <div className="formGroup">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  rows={4}
                  placeholder="Share your experience with our platform..."
                />
              </div>

              <button
                type="submit"
                className="submitBtn"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        {loading ? (
          <div className="loadingState">
            <div className="spinner"></div>
            <p>Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="emptyState">
            <p>No testimonials yet.</p>
            <p className="emptyStateSubtext">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="testGrid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testCard glassBox">
                <div className="testText">"{testimonial.testimonial_text}"</div>

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
        )}

        {/* CTA Section */}
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