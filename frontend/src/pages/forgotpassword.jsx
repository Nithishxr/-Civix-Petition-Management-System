import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(""); // shows OTP in dev mode

  const showMsg = (text, type = "info") => setMessage({ text, type });

  // STEP 1 — Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await API.post("/auth/send-otp", { email });
      showMsg("OTP sent to your email. Check your inbox.", "success");
      // Dev mode: backend returns OTP in response
      if (res.data.otp) {
        setDevOtp(res.data.otp);
      }
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP. Check the email address.";
      showMsg(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMsg("Password must be at least 6 characters.", "error");
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await API.post("/auth/reset-password", { email, otp, password: newPassword });
      showMsg("Password reset successfully! Redirecting to login…", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid or expired OTP.";
      showMsg(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-card-icon">🔐</div>
        <h2>Reset Password</h2>
        <p className="forgot-subtitle">
          {step === 1
            ? "Enter your email to receive a one-time password."
            : `Enter the OTP sent to ${email}`}
        </p>

        {/* Step indicator */}
        <div className="forgot-steps">
          <div className={`forgot-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="forgot-step-line" />
          <div className={`forgot-step ${step >= 2 ? "active" : ""}`}>2</div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`forgot-message forgot-message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Dev OTP hint */}
        {devOtp && step === 2 && (
          <div className="forgot-dev-hint">
            🛠 Dev mode — Your OTP: <strong>{devOtp}</strong>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={resetPassword}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
            <button
              type="button"
              className="forgot-btn-ghost"
              onClick={() => { setStep(1); setDevOtp(""); setMessage({ text: "", type: "" }); }}
            >
              ← Back
            </button>
          </form>
        )}

        <a href="/login" className="forgot-back">← Back to Login</a>
      </div>
    </div>
  );
};

export default ForgotPassword;
