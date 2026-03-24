import { useNavigate } from "react-router-dom";
import "../styles/MainLogin.css";

const MainLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="main-login-container">
      <div className="main-login-card">
        
        {/* Logo Icon */}
        <div className="brand-logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="url(#gradient1)" strokeWidth="4"/>
            <path d="M40 15 L40 35 M40 45 L40 65" stroke="url(#gradient1)" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="40" cy="40" r="5" fill="url(#gradient1)"/>
            <path d="M25 30 L40 40 L55 30" stroke="url(#gradient1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M25 50 L40 40 L55 50" stroke="url(#gradient1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="brand-title">CiviX Portal</h1>
        
        {/* Decorative Line */}
        <div className="decorative-line">
          <span className="line-dot"></span>
          <span className="line-bar"></span>
          <span className="line-dot"></span>
        </div>

        <p className="brand-subtitle">
          Empowering Citizens. Enabling Governance.
        </p>

        <div className="login-options">
          <button
            className="login-option citizen"
            onClick={() => navigate("/login/citizen")}
          >
            <span className="button-icon">👤</span>
            Login as Citizen
          </button>

          <button
            className="login-option official"
            onClick={() => navigate("/login/official")}
          >
            <span className="button-icon">🏛️</span>
            Login as Government Official
          </button>
        </div>

      </div>
    </div>
  );
};

export default MainLogin;