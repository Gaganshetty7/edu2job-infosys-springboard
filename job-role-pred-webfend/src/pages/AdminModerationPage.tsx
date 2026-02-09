
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import "../styles/moderation.css";

interface PendingTestimonial {
  id: number;
  name: string;
  role: string;
  testimonial_text: string;
  rating: number;
  created_at: string;
}

type SortKey = "id" | "name" | "created_at" | "rating";
type SortOrder = "asc" | "desc";

export default function AdminModerationPage() {
  const [pendingTestimonials, setPendingTestimonials] = useState<PendingTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPendingTestimonials();
    // eslint-disable-next-line
  }, [page, sortKey, sortOrder, search]);

  const fetchPendingTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate offset for backend pagination
      const offset = (page - 1) * pageSize;
      const res = await api.get("/accounts/admin/testimonials/pending/", {
        params: {
          offset,
          limit: pageSize,
          sort: sortKey,
          order: sortOrder,
          search,
        },
      });
      setPendingTestimonials(res.data.results || res.data);
      setTotalPages(res.data.count ? Math.max(1, Math.ceil(res.data.count / pageSize)) : 1);
    } catch (err: any) {
      setError("Failed to fetch pending testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, is_approved: boolean) => {
    setProcessingId(id);
    setError(null);
    try {
      await api.patch(`/accounts/admin/testimonials/${id}/approve/`, { is_approved });
      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(`Failed to ${is_approved ? "approve" : "reject"} testimonial`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const renderStars = (rating: number) => (
    <span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? "#f5b301" : "#ccc" }}>★</span>
      ))}
    </span>
  );

  return (
    <div className="root">
      <NavBar />
      <main className="main admin-main">
        <div className="container admin-container">
          <h2 className="pgTitle" style={{ marginBottom: 24 }}>Testimonial Moderation</h2>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search by name, role, or text..."
              value={search}
              onChange={handleSearchChange}
              style={{ padding: 8, width: 280, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>

          {error && <div className="errorMessage">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : pendingTestimonials.length === 0 ? (
            <div className="emptyState">No pending testimonials to review.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="moderation-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>ID {sortKey === "id" ? (sortOrder === "asc" ? "▲" : "▼") : null}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>Name {sortKey === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}</th>
                    <th>Role</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("created_at")}>Created At {sortKey === "created_at" ? (sortOrder === "asc" ? "▲" : "▼") : null}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("rating")}>Rating {sortKey === "rating" ? (sortOrder === "asc" ? "▲" : "▼") : null}</th>
                    <th>Testimonial Text</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTestimonials.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.name}</td>
                      <td>{t.role}</td>
                      <td>{new Date(t.created_at).toLocaleString()}</td>
                      <td>{renderStars(t.rating)}</td>
                      <td style={{ maxWidth: 320, whiteSpace: "pre-line", overflowWrap: "break-word" }}>{t.testimonial_text}</td>
                      <td>
                        <button
                          className="approveBtn"
                          style={{ marginRight: 8 }}
                          onClick={() => handleAction(t.id, true)}
                          disabled={processingId === t.id}
                        >
                          {processingId === t.id ? "..." : "✓ Approve"}
                        </button>
                        <button
                          className="rejectBtn"
                          onClick={() => handleAction(t.id, false)}
                          disabled={processingId === t.id}
                        >
                          {processingId === t.id ? "..." : "✕ Reject"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}