import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setUsers(await apiRequest("/auth/users"));
    } catch (requestError) {
      setError(requestError.message || "We couldn't load user accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateRole = async (id, role) => {
    setUpdatingId(id);
    setError("");
    try {
      const { user } = await apiRequest(`/auth/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((current) => current.map((item) => item.id === id ? { ...item, role: user.role } : item));
    } catch (requestError) {
      setError(requestError.message || "We couldn't update this role.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="feedback-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> Workspace settings</p>
          <h1>People & roles</h1>
          <p className="page-description">Manage access for your feedback workspace.</p>
        </div>
        <button type="button" className="secondary-button" onClick={loadUsers} disabled={isLoading}>
          Refresh list
        </button>
      </header>

      <section className="panel users-panel">
        <div className="users-heading">
          <div>
            <h2>Accounts</h2>
            <p>New accounts always start with User access.</p>
          </div>
          <span className="step-pill">{users.length} {users.length === 1 ? "person" : "people"}</span>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        {isLoading ? (
          <div className="loading-state" role="status">Loading accounts…</div>
        ) : users.length ? (
          <div className="user-list">
            {users.map((user) => (
              <article className="user-row" key={user.id}>
                <span className="avatar" aria-hidden="true">
                  {user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
                <div className="user-identity">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
                <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.name}</label>
                <select
                  id={`role-${user.id}`}
                  className="filter-control user-role-select"
                  value={user.role}
                  disabled={updatingId === user.id}
                  onChange={(event) => updateRole(user.id, event.target.value)}
                >
                  <option value="user">User</option>
                  <option value="manager">Feedback Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <span className="user-created">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><h2>No accounts found</h2></div>
        )}
      </section>
    </div>
  );
};

export default Users;
