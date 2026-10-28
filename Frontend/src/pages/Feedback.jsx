import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../auth/AuthContext";

const categories = ["Product", "Service", "Teaching", "Event", "Other"];
const statuses = ["New", "Under Review", "In Progress", "Resolved", "Rejected"];

const formatDate = (date) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDateKey = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};

const getInitials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

const Feedback = () => {
  const { user, isManager } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    averageRating: 0,
    positive: 0,
    negative: 0,
    pending: 0,
    resolved: 0,
    recent: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const cancelButtonRef = useRef(null);

  const loadData = useCallback(async (signal) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [items, dashboard] = await Promise.all([
        apiRequest("/feedback", { signal }),
        apiRequest("/feedback/dashboard", { signal }),
      ]);
      if (!Array.isArray(items)) throw new Error("The feedback service returned an unexpected response.");
      setFeedback(items);
      setSummary(dashboard);
    } catch (error) {
      if (error.name !== "AbortError") {
        setLoadError(error.message || "We couldn't load feedback. Please try again.");
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  useEffect(() => {
    if (!deleteId && !editing) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving && !isDeleting) {
        setDeleteId(null);
        setEditing(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    cancelButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [deleteId, editing, isDeleting, isSaving]);

  const visibleFeedback = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const items = feedback.filter((item) => {
      const matchesSearch = !query
        || `${item.name ?? ""} ${item.comment ?? ""}`.toLocaleLowerCase().includes(query);
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesRating = !ratingFilter || Number(item.rating) === Number(ratingFilter);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesDate = !dateFilter || getDateKey(item.createdAt) === dateFilter;
      return matchesSearch && matchesCategory && matchesRating && matchesStatus && matchesDate;
    });

    return items.sort((first, second) => {
      const firstDate = new Date(first.createdAt ?? 0).getTime() || 0;
      const secondDate = new Date(second.createdAt ?? 0).getTime() || 0;
      if (sortOrder === "oldest") return firstDate - secondDate;
      if (sortOrder === "highest") return Number(second.rating) - Number(first.rating);
      if (sortOrder === "lowest") return Number(first.rating) - Number(second.rating);
      return secondDate - firstDate;
    });
  }, [categoryFilter, dateFilter, feedback, ratingFilter, search, sortOrder, statusFilter]);

  const hasFilters = Boolean(search.trim() || categoryFilter || ratingFilter || statusFilter || dateFilter);
  const selectedFeedback = feedback.find((item) => item._id === deleteId);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setRatingFilter("");
    setStatusFilter("");
    setDateFilter("");
    setSortOrder("newest");
  };

  const exportCsv = () => {
    const escapeCell = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r\n=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Name", "Rating", "Category", "Status", "Comment", "Submitted"],
      ...visibleFeedback.map((item) => [
        item.anonymous ? "Anonymous" : item.name,
        item.rating,
        item.category,
        item.status,
        item.comment,
        formatDate(item.createdAt),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "kindred-feedback.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const openEditor = (item) => {
    setEditing({
      ...item,
      rating: String(item.rating),
      anonymous: Boolean(item.anonymous),
      status: item.status || "New",
      category: item.category || "Other",
    });
    setEditError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    setEditError("");
    setActionError("");
    const body = {
      comment: editing.comment,
      rating: Number(editing.rating),
      category: editing.category,
      anonymous: editing.anonymous,
    };
    if (!editing.anonymous) body.name = editing.name;
    if (isManager) body.status = editing.status;

    try {
      const updated = await apiRequest(`/feedback/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setFeedback((previous) => previous.map((item) => item._id === updated._id ? updated : item));
      setEditing(null);
      setActionError("Feedback updated successfully.");
      const dashboard = await apiRequest("/feedback/dashboard");
      setSummary(dashboard);
    } catch (error) {
      setEditError(error.message || "We couldn't save your changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError("");
    setActionError("");
    try {
      await apiRequest(`/feedback/${deleteId}`, { method: "DELETE" });
      setFeedback((previous) => previous.filter((item) => item._id !== deleteId));
      setDeleteId(null);
      setActionError("Feedback deleted.");
      const dashboard = await apiRequest("/feedback/dashboard");
      setSummary(dashboard);
    } catch (error) {
      setDeleteError(error.message || "We couldn't delete this feedback.");
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = [
    { label: "Total feedback", value: summary.total, icon: "bubble", color: "" },
    { label: "Average rating", value: `${Number(summary.averageRating || 0).toFixed(1)} / 5`, icon: "star", color: "gold" },
    { label: "Positive · 4–5★", value: summary.positive, icon: "positive", color: "" },
    { label: "Negative · 1–2★", value: summary.negative, icon: "negative", color: "orange" },
    { label: "Pending", value: summary.pending, icon: "pending", color: "gold" },
    { label: "Resolved", value: summary.resolved, icon: "resolved", color: "" },
  ];

  return (
    <div className="feedback-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> {isManager ? "Your feedback workspace" : "Your feedback space"}</p>
          <h1>{isManager ? "Feedback dashboard" : "My feedback"}</h1>
          <p className="page-description">
            {isManager
              ? "Understand what people are saying and keep every note moving."
              : "Track your submissions and share more thoughts whenever you like."}
          </p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="secondary-button" onClick={() => loadData()} disabled={isLoading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7v5h-5M4 17v-5h5m-4.1-3a8 8 0 0 1 13.2-2L20 12M4 12l1.9 5a8 8 0 0 0 13.2-2" />
            </svg>
            Refresh
          </button>
          <button type="button" className="primary-button" onClick={exportCsv} disabled={!visibleFeedback.length}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
            </svg>
            Export CSV
          </button>
        </div>
      </header>

      {actionError && (
        <div className="alert alert-success alert-offset" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
          </svg>
          <span>{actionError}</span>
          <button type="button" className="clear-filters" onClick={() => setActionError("")}>Dismiss</button>
        </div>
      )}

      <section className="stats-grid stats-grid-six" aria-label="Feedback summary">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className={`stat-icon ${stat.color}`}>
              {stat.icon === "star" ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.8Z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {stat.icon === "bubble" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 8h10M7 12h6m-9 8 3.2-3.2A2 2 0 0 1 8.6 16H17a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v13Z" />}
                  {stat.icon === "positive" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.8 8.6c0 5.2-8.8 11.4-8.8 11.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />}
                  {stat.icon === "negative" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 20s-8-4-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 7-8 11-8 11Zm-2-9h4" />}
                  {stat.icon === "pending" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 2m5-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />}
                  {stat.icon === "resolved" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m5 12 4 4L19 6" />}
                </svg>
              )}
            </span>
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </article>
        ))}
      </section>

      {loadError ? (
        <section className="empty-state" role="alert">
          <span className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" /></svg>
          </span>
          <h2>We couldn’t load the feedback</h2>
          <p>{loadError}</p>
          <button className="primary-button" type="button" onClick={() => loadData()}>Try again</button>
        </section>
      ) : (
        <>
          <section className="toolbar" aria-label="Filter feedback">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="11" cy="11" r="7" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="m16 16 4 4" /></svg>
              <input type="search" className="filter-control search-input" aria-label="Search feedback" placeholder="Search a name or comment..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="filter-control" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="filter-control" aria-label="Filter by rating" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
            </select>
            {isManager && (
              <select className="filter-control" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            )}
            <input type="date" className="filter-control" aria-label="Filter by date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            <select className="filter-control" aria-label="Sort feedback" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </section>

          <div className="result-line">
            <span><strong>Recent submissions</strong> · {isLoading ? "Loading…" : `${visibleFeedback.length} ${visibleFeedback.length === 1 ? "note" : "notes"}`}</span>
            {hasFilters && <button type="button" className="clear-filters" onClick={clearFilters}>Clear filters</button>}
          </div>

          {isLoading ? (
            <div className="skeleton-grid" aria-label="Loading feedback">
              {[1, 2, 3].map((item) => (
                <div className="skeleton-card" key={item} aria-hidden="true">
                  <div className="skeleton-line medium" /><div className="skeleton-line short" />
                  <div className="skeleton-line long" /><div className="skeleton-line long" />
                  <div className="skeleton-line medium" />
                </div>
              ))}
            </div>
          ) : visibleFeedback.length ? (
            <section className="feedback-grid" aria-label="Recent feedback">
              {visibleFeedback.map((item) => (
                <article className="feedback-card" key={item._id}>
                  <div className="card-topline">
                    <div className="person">
                      <span className="avatar" aria-hidden="true">{getInitials(item.anonymous ? "Anonymous" : (item.name || user.name))}</span>
                      <div>
                        <h2>{item.anonymous ? "Anonymous" : (item.name || user.name)}</h2>
                        <p>{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <span className="rating-badge" aria-label={`${item.rating} out of 5 stars`}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.8Z" /></svg>
                      {item.rating}
                    </span>
                  </div>
                  <div className="feedback-tags">
                    <span className="category-tag">{item.category || "Other"}</span>
                    <span className={`status-tag status-${(item.status || "New").toLowerCase().replaceAll(" ", "-")}`}>{item.status || "New"}</span>
                  </div>
                  <p className="card-comment">{item.comment}</p>
                  <div className="card-bottom">
                    <span className="card-date">{formatDate(item.createdAt)}</span>
                    <div className="card-actions">
                      <button type="button" className="edit-button" onClick={() => openEditor(item)} aria-label={`Edit feedback by ${item.anonymous ? "Anonymous" : item.name}`}>
                        Edit
                      </button>
                      <button type="button" className="delete-button" onClick={() => { setDeleteId(item._id); setDeleteError(""); }} aria-label={`Delete feedback by ${item.anonymous ? "Anonymous" : item.name}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16m-10 4v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <span className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 8h10M7 12h6m-9 8 3.2-3.2A2 2 0 0 1 8.6 16H17a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v13Z" /></svg></span>
              <h2>{hasFilters ? "No feedback matches those filters" : "Your first note is waiting"}</h2>
              <p>{hasFilters ? "Try changing your search or clearing the filters." : "There are no feedback submissions yet. Share a note to get started."}</p>
              {hasFilters && <button className="secondary-button" type="button" onClick={clearFilters}>Clear filters</button>}
            </section>
          )}
        </>
      )}

      {editing && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSaving) setEditing(null);
        }}>
          <section className="modal-card edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <span className="modal-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m15.2 5.2 3.6 3.6M4 20l4.4-.9L19 7.5a2.1 2.1 0 0 0-3-3L5.4 15.1 4 20Z" /></svg>
            </span>
            <h2 id="edit-title">Edit feedback</h2>
            <form className="form-fields edit-form" onSubmit={saveEdit}>
              {!editing.anonymous && (
                <div>
                  <label className="field-label" htmlFor="edit-name">Name</label>
                  <input id="edit-name" className="field-input" maxLength={80} value={editing.name || ""} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
                </div>
              )}
              <div>
                <label className="field-label" htmlFor="edit-category">Category</label>
                <select id="edit-category" className="field-input" value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="edit-rating">Rating</label>
                <select id="edit-rating" className="field-input" value={editing.rating} onChange={(event) => setEditing({ ...editing, rating: event.target.value })}>
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
                </select>
              </div>
              {isManager && (
                <div>
                  <label className="field-label" htmlFor="edit-status">Status</label>
                  <select id="edit-status" className="field-input" value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="field-label" htmlFor="edit-comment">Comment</label>
                <textarea id="edit-comment" className="field-textarea" maxLength={2000} value={editing.comment} onChange={(event) => setEditing({ ...editing, comment: event.target.value })} required />
              </div>
              {editError && <div className="alert" role="alert">{editError}</div>}
              <div className="modal-actions">
                <button ref={cancelButtonRef} type="button" className="secondary-button" onClick={() => setEditing(null)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isDeleting) setDeleteId(null);
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
            <span className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v3m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" /></svg>
            </span>
            <h2 id="delete-title">Delete this feedback?</h2>
            <p id="delete-description">{selectedFeedback ? `This will permanently remove ${selectedFeedback.anonymous ? "this anonymous" : selectedFeedback.name + "’s"} feedback.` : "This feedback will be permanently removed."}</p>
            {deleteError && <div className="alert delete-error" role="alert">{deleteError}</div>}
            <div className="modal-actions">
              <button ref={cancelButtonRef} type="button" className="secondary-button" onClick={() => setDeleteId(null)} disabled={isDeleting}>Keep it</button>
              <button type="button" className="danger-button" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete feedback"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Feedback;
