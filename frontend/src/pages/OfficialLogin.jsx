import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";
 
const OfficialLogin = () => {
 
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    try {
 
      const res = await API.post("/auth/login", {
        email,
        password
      });
 
      const data = res.data;
 
      if (!data.user || !data.user.role) {
        setError("Invalid credentials");
        return;
      }
 
      // Ensure role is official
      if (data.user.role !== "official") {
        setError("Only officials can login here");
        return;
      }
 
      // Save user in context
      login(data);
 
      // Redirect to official dashboard
      navigate("/official-dashboard");
 
    } catch (err) {
 
      console.error("Official login error:", err);
 
      if (err.response?.status === 400) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setError("You are not approved as an official. Please wait for the main official to approve your account.");
      } else if (err.response?.status === 404) {
        setError("User not found. Please register first.");
      } else {
        setError("Login failed. Please try again.");
      }
 
    }
  };
 
  return (
<div className="auth-container">
<div className="auth-card">
 
        <h2>Official Login</h2>
 
        {error && <p className="error-message">{error}</p>}
 
        <form onSubmit={handleSubmit}>
 
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
 
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
 
          <button type="submit" className="auth-button official-btn">
            Login
</button>
 
        </form>
 
        <div className="auth-links">
<Link to="/forgotpassword">Forgot Password?</Link>
<Link to="/register">Register</Link>
</div>
 
      </div>
</div>
  );
};
 
export default OfficialLogin;