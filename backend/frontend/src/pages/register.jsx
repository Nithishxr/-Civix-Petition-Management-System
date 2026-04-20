import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import AlertMessage from "../components/AlertMessage";
import "../styles/Register.css";

const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Citizen",
    location: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          location: `${position.coords.latitude}, ${position.coords.longitude}`
        }));
        setError("");
      },
      () => setError("Unable to fetch location")
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        location: form.location
      });

      setMessage("Registered successfully");
      setTimeout(
        () => navigate(form.role === "Citizen" ? "/login/citizen" : "/login/official"),
        1500
      );

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration Failed"
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <h2>Register</h2>

        <AlertMessage type="danger" message={error} onClose={() => setError("")} />
        <AlertMessage type="success" message={message} onClose={() => setMessage("")} />

        <form onSubmit={handleSubmit} className="register-form">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            onChange={handleChange}
          >
            <option value="Citizen">Citizen</option>
            <option value="Government Official">Official</option>
          </select>

          <button
            type="button"
            className="detect-btn"
            onClick={detectLocation}
          >
            Detect Location
          </button>

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            readOnly
          />

          <button type="submit" className="register-btn">
            Register
          </button>

        </form>

        <p className="login-link">
          Already registered?{" "}
          <Link to={form.role === "Citizen" ? "/login/citizen" : "/login/official"}>
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;