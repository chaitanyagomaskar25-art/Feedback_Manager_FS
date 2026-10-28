import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <NavLink to="/" className="brand" aria-label="Kindred home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
            </svg>
          </span>
          <span className="brand-name">kindred<span>.</span></span>
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Share feedback
              </NavLink>
              <NavLink to="/feedback" className={({ isActive }) => `nav-link nav-cta${isActive ? " active" : ""}`}>
                Dashboard
              </NavLink>
              {isAdmin && (
                <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  People
                </NavLink>
              )}
              <span className="user-chip" title={user.email}>
                <span className="user-chip-avatar">{user.name[0]?.toUpperCase()}</span>
                <span className="user-chip-name">{user.name}</span>
              </span>
              <button type="button" className="nav-link signout-button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Sign in</NavLink>
              <NavLink to="/register" className={({ isActive }) => `nav-link nav-cta${isActive ? " active" : ""}`}>Create account</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
