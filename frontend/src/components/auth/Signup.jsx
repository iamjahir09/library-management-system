import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import "./Auth.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:7070/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || `Signup failed (${response.status}).`);
            }

            setNotice("Account created successfully. You can now log in.");
            setTimeout(() => navigate("/login"), 900);
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
                    <h1>Join the Library</h1>
                    <p className="heading-subtitle">Create an account to get started.</p>
                </div>
                <form className="auth-form signup-form" onSubmit={handleSubmit}>
                    <div className="form-heading">
                        <h2>Create Account</h2>
                        <p>Enter your details below.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-name">Name</label>
                        <input id="signup-name" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={event => setName(event.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-email">Email</label>
                        <input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-password">Password</label>
                        <input id="signup-password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" value={password} onChange={event => setPassword(event.target.value)} required />
                    </div>
                    {error && <p className="error-message" role="alert">{error}</p>}
                    {notice && <p className="success-message" role="status">{notice}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>{loading ? "Creating account…" : "Sign Up"}</button>
                    <p className="auth-footer">Already registered? <Link to="/login">Login</Link></p>
                </form>
            </div>
        </div>
    );
}

export default Signup;
