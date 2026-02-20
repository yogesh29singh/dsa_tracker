import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  NotebookTabs,
} from "lucide-react";
import "../styles/Login.css";
import toast, { Toaster } from "react-hot-toast";


function Login() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e, isLogin = true) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = isLogin
      ? { identifier: username, password }
      : { fullName, username, email, password, role: "user" };

    try {
      const endpoint = isLogin ? "login" : "register";
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.data.username,
          email: data.data.email,
          role: data.data.role,
        }),
      );

      
      if (isLogin) {
        toast.success(`Welcome back, ${data.data.username}!`);
      } else {
        toast.success("Account created successfully!");
      }

      setTimeout(() => {
        if (data.data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (err) {
      toast.error(err.message);
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => handleAuth(e, true);

  const handleSignup = (e) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    handleAuth(e, false);
  };

  return (
    <div className="page">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="main-card">
        <div className="promo">
          <div className="logo">
            <div className="logo-icon">
              <NotebookTabs size={26} />
            </div>
            <h1>DSA Tracker</h1>
          </div>
          <p className="tagline">
            Your path to mastering <strong>Data Structures & Algorithms</strong>
          </p>
          <div className="features">
            <div className="feature">
              <CheckCircle className="feature-icon" />
              <span>Track Your Progress</span>
            </div>
            <div className="feature">
              <Target className="feature-icon" />
              <span>450+ Curated Problems</span>
            </div>
            <div className="feature">
              <TrendingUp className="feature-icon" />
              <span>Easy → Medium → Hard</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>{tab === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>
                {tab === "login"
                  ? "Login to continue your journey"
                  : "Sign up and start tracking today"}
              </p>
            </div>

            <div className="tabs">
              <button
                className={tab === "login" ? "active" : ""}
                onClick={() => setTab("login")}
              >
                Login
              </button>
              <button
                className={tab === "signup" ? "active" : ""}
                onClick={() => setTab("signup")}
              >
                Sign Up
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Username or Email</label>
                  <input
                    type="text"
                    placeholder="admin / your@email.com"
                    value={username || email}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setEmail(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="form-group password-wrapper">
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Logging in..." : "→ Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="johndoe123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group password-wrapper">
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group password-wrapper">
                  <label>Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Creating account..." : "⊕ Create Account"}
                </button>

                <p className="footer-text">Track your DSA progress easily!</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
