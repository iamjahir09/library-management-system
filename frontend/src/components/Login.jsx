import { useState } from "react";
import "./Login.css";
import "./Auth.css";
import {Link, useNavigate} from 'react-router-dom';
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault()

        const response = await fetch('http://localhost:7070/login', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()
        console.log(response.status, data)

        if (!response.ok) {
            setError(data.error)
            return
        }
        setError('')
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role",data.user.role);
        console.log("Token saved:", Boolean(sessionStorage.getItem("token")));
        console.log("User role:", sessionStorage.getItem("role"));
        if(data.user.role === "ADMIN"){
            navigate("/admin/dashboard");
        }else {
            navigate("/")
        }
    }

    return (
        <form className="auth-form login-form" onSubmit={handleSubmit}>
            <div className="form-heading">
                <h2>Welcome Back</h2>
                <p>Sign in to your account to continue</p>
            </div>

            <div className="input-group">
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit" className="auth-button">Login</button>

            {error && <p className="error-message">{error}</p>}
        </form>
    )
}

export default Login