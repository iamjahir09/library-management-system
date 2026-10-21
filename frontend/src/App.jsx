
import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BooksManagement from "./components/BooksManagement";
const books = [
    { id: 'left-back', side: 'left', size: 'book-small', title: 'LIBER VETUS', lines: 5 },
    { id: 'left-front', side: 'left', size: 'book-large', title: 'CODEX ARCANA', lines: 7 },
    { id: 'right-back', side: 'right', size: 'book-large', title: 'NOCTIS MEMORIA', lines: 7 },
    { id: 'right-front', side: 'right', size: 'book-small', title: 'HERBARIUM', lines: 5 },
];

function OpenBook({ side, size, title, lines, id }) {
    return (
        <div className={`decor-book ${side} ${size} ${id}`}>
            <div className="decor-book-cover">
                <div className="decor-page page-left">
                    <span className="page-title">{title}</span>
                    <span className="ink-lines">
                        {Array.from({ length: lines }, (_, i) => <i key={i} />)}
                    </span>
                    <span className="ink-script">aevora · velum · nocte</span>
                </div>

                <div className="decor-page page-right">
                    <span className="page-title">✧ ANTIQUA ✧</span>
                    <span className="ink-lines">
                        {Array.from({ length: lines + 1 }, (_, i) => <i key={i} />)}
                    </span>
                    <span className="ink-script">mystica memoria</span>
                </div>
            </div>
        </div>
    );
}

function LibraryBackdrop() {
    return (
        <div className="library-backdrop" aria-hidden="true">
            <div className="library-wall" />
            <div className="shelf shelf-top">
                <span /><span /><span /><span /><span /><span />
            </div>
            <div className="shelf shelf-bottom">
                <span /><span /><span /><span /><span /><span />
            </div>

            <div className="backdrop-books">
                {books.map(book => (
                    <OpenBook key={book.id} {...book} />
                ))}
            </div>

            <div className="library-shade" />
        </div>
    );
}

function AuthPage({ mode }) {
    const isSignup = mode === 'signup';

    return (
        <section className={`auth-page ${isSignup ? 'signup-page' : 'login-page'}`}>
            <header className="library-heading">
                <h1>THE OLD LIBRARY</h1>
                <p className="heading-subtitle">
                    A sanctuary for stories, knowledge & discovery
                </p>
                <div className="heading-rule"><span>◆</span></div>
            </header>

            <main className="auth-stage">
                {isSignup ? <Signup /> : <Login />}
            </main>

            <footer className="auth-footer">
                <span>
                    {isSignup
                        ? 'Already have a library card?'
                        : 'A new reader to our archive?'}
                </span>{' '}

                <Link to={isSignup ? '/login' : '/signup'}>
                    {isSignup ? 'Log in' : 'Create an account'}
                </Link>
            </footer>
        </section>
    );
}

function App() {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <BrowserRouter>
            <div className="app-root" data-theme={darkMode ? 'dark' : 'light'}>
                <button
                    type="button"
                    className="theme-toggle"
                    onClick={() => setDarkMode(prev => !prev)}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to night mode'}
                    aria-pressed={darkMode}
                    title={darkMode ? 'Light mode' : 'Night mode'}
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>

                <LibraryBackdrop />

                <div className="app-shell">
                    <Routes>
                        <Route path="/" element={<Navigate to="/signup" replace />} />
                        <Route path="/signup" element={<AuthPage mode="signup" />} />
                        <Route path="/login" element={<AuthPage mode="login" />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route
                            path="/admin/books"
                            element={<BooksManagement />}
                        />

                        <Route
                            path="*"
                            element={
                                <div className="not-found">
                                    <p className="eyebrow">ARCHIVE ENTRY NOT FOUND</p>
                                    <h1>404</h1>
                                    <Link to="/signup">Return to the library</Link>
                                </div>
                            }
                        />

                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
