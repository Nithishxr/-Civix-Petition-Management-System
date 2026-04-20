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
  const [devOtp, setDevOtp] = useState("");

  const showMsg = (text, type = "info") => setMessage({ text, type });

  // STEP 1 — Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    setDevOtp("");
    try {
      await API.post("/auth/forgot-password", { email: email.trim() });
      showMsg("OTP sent to your email. Check your inbox and spam folder.", "success");
      setStep(2);
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 404) {
        showMsg("No account found with this email address.", "error");
        return;
      }

      if (status === 500) {
        // Backend saved the OTP to DB before email failed.
        // Fetch it directly so the user can still reset their password.
        try {
          const otpRes = await API.post("/auth/forgot-password", { email: email.trim() });
          if (otpRes.data?.otp) setDevOtp(otpRes.data.otp);
        } catch (_) { /* ignore second attempt */ }

        showMsg(
          "Email delivery failed (email not configured). Your OTP is shown below — use it to reset your password.",
          "error"
        );

        // Fetch OTP from DB via a workaround: call reset with a dummy to get the saved OTP
        // Since we can't get it directly, we'll just advance and let user try
        setStep(2);
        return;
      }

      showMsg(msg || "Failed to send OTP. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6 || !/^\d{6}$/.test(otp.trim())) {
      showMsg("OTP must be exactly 6 digits.", "error");
      return;
    }
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
      await API.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      showMsg("Password reset successfully! Redirecting to login…", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 400) {
        if (msg === "Invalid OTP")        showMsg("Incorrect OTP. Please check and try again.", "error");
        else if (msg === "OTP expired")   showMsg("OTP has expired. Go back and request a new one.", "error");
        else if (msg === "OTP not requested") showMsg("No OTP was requested. Go back and try again.", "error");
        else showMsg(msg || "Invalid request.", "error");
      } else if (status === 404) {
        showMsg("No account found with this email.", "error");
      } else {
        showMsg(msg || "Failed to reset password. Please try again.", "error");
      }
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

        {/* Dev OTP hint — shown when email fails */}
        {devOtp && step === 2 && (
          <div className="forgot-dev-hint">
            🛠 OTP (email failed): <strong>{devOtp}</strong>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp} autoComplete="off">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              autoComplete="email"
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
          <form onSubmit={resetPassword} autoComplete="off">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
            <button
              type="button"
              className="forgot-btn-ghost"
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setDevOtp("");
                setMessage({ text: "", type: "" });
              }}
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
