import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import "./Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:7070/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || `Login failed (${response.status}).`);
            }

            if (!data.token || !data.user) {
                throw new Error("The login response did not include a token and user.");
            }

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.user.role || "");

            if (data.user.role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                setError("This panel is for administrators. Please use an admin account.");
            }
        } catch (err) {
            setError(err.message || "Could not connect to the library server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-shell">
            <div className="auth-page">
                <div className="library-heading">
                    <div className="crest"><span>▤</span></div>
                    <p className="eyebrow">THE OLD LIBRARY</p>
                    <h1>Welcome Back</h1>
                    <p className="heading-subtitle">Sign in to manage your library collection.</p>
                </div>
                <form className="auth-form login-form" onSubmit={handleSubmit}>
                    <div className="form-heading">
                        <h2>Administrator Login</h2>
                        <p>Enter your credentials to continue.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} required />
                    </div>
                    {error && <p className="error-message" role="alert">{error}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>{loading ? "Signing in…" : "Login"}</button>
                    <p className="auth-footer">New member? <Link to="/signup">Create an account</Link></p>
                </form>
            </div>
        </div>
    );
}

export default Login;
