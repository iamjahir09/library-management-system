import { useState } from "react";
import "./Signup.css";
import "./Auth.css";
import { Link } from 'react-router-dom';
function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        const response = await fetch('http://localhost:7070/signup', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        const data = await response.json()
        console.log(response.status, data)

        if (!response.ok) {
            setError(data.error)
            return
        }
        setError('')
        console.log('success', data)
    }

    return (
        <form className="auth-form signup-form" onSubmit={handleSubmit}>
            <div className="form-heading">
                <h2>Create Account</h2>
                <p>Join us — it only takes a minute</p>
            </div>

            <div className="input-group">
                <label htmlFor="signup-name">Name</label>
                <input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label htmlFor="signup-email">Email</label>
                <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label htmlFor="signup-password">Password</label>
                <input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit" className="auth-button">Sign Up</button>

            {error && <p className="error-message">{error}</p>}
        </form>
    )
}

export default Signup