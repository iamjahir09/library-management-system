
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

        if (loading) return;

        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:7070/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    `Login failed (${response.status}). Please try again.`
                );
            }

            if (!data?.token || !data?.user) {
                throw new Error(
                    "Invalid server response. Token or user details are missing."
                );
            }

            const role = String(data.user.role || "")
                .trim()
                .toUpperCase();

            if (!["ADMIN", "MEMBER", "USER"].includes(role)) {
                throw new Error(
                    `Unsupported account role: ${role || "missing"}.`
                );
            }

            // Save authenticated user information
            try {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("role", role);
                sessionStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...data.user,
                        role,
                    })
                );
            } catch {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                sessionStorage.removeItem("user");

                throw new Error(
                    "Unable to save your login session. Please try again."
                );
            }

            // Redirect according to account role
            if (role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/user", { replace: true });
            }
        } catch (err) {
            if (err instanceof TypeError) {
                setError(
                    "Cannot connect to the library server. Make sure the backend is running on port 7070."
                );
            } else {
                setError(
                    err.message || "Something went wrong during login."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-shell">
            <div className="auth-page">
                <div className="library-heading">
                    <div className="crest"></div>

                    <p className="eyebrow">THE OLD LIBRARY</p>

                    <h1>Welcome Back</h1>

                    <p className="heading-subtitle">
                        Sign in to access your library account.
                    </p>
                </div>

                <form
                    className="auth-form login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-heading">
                        <h2>Library Login</h2>
                        <p>Enter your credentials to continue.</p>
                    </div>

                    <div className="input-group">
                        <label htmlFor="login-email">Email</label>

                        <input
                            id="login-email"
                            type="email"
                            autoComplete="username"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="login-password">Password</label>

                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    <p className="auth-footer">
                        New member?{" "}
                        <Link to="/signup">
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
