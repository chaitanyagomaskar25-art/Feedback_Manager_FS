import { NavLink } from "react-router-dom";

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-wrap">
      <NavLink to="/" className="footer-brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
          </svg>
        </span>
        <span>Kindred Feedback</span>
      </NavLink>
      <p className="footer-note">Made better together. Thanks for being part of it.</p>
    </div>
  </footer>
);

export default Footer;
