import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, BookUp, LibraryBig, ArrowUpRight, RefreshCw } from "lucide-react";
import { apiRequest, formatDate, getIssueStatus } from "../../api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {
        setLoading(true);
        setError("");
        try {
            const [userData, bookData, issueData] = await Promise.all([
                apiRequest("/admin/users"),
                apiRequest("/books"),
                apiRequest("/admin/book-issues"),
            ]);
            setUsers(Array.isArray(userData) ? userData : userData?.users || []);
            setBooks(Array.isArray(bookData) ? bookData : []);
            setIssues(Array.isArray(issueData) ? issueData : []);
        } catch (err) {
            setError(err.message || "Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadDashboard(); }, []);

    const totalCopies = books.reduce((sum, book) => sum + Number(book.total_copies || 0), 0);
    const availableCopies = books.reduce((sum, book) => sum + Number(book.available_copies || 0), 0);
    const activeIssues = issues.filter(issue => issue.status === "ISSUED").length;
    const recentIssues = [...issues].sort((a, b) =>
        String(b.issueDate || "").localeCompare(String(a.issueDate || ""))
    ).slice(0, 5);
    const bookById = new Map(books.map(book => [String(book.id), book]));
    const userById = new Map(users.map(user => [String(user.id), user]));

    return (
        <section className="dashboard-page">
            <div className="dashboard-heading-row">
                <div>
                    <p className="dashboard-eyebrow">LIBRARY OVERVIEW</p>
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back, Administrator. Here is your library at a glance.</p>
                </div>
                <button className="dashboard-refresh" onClick={loadDashboard} disabled={loading}>
                    <RefreshCw size={15} className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </div>

            {error && <div className="dashboard-message" role="alert">{error}</div>}

            <div className="dashboard-quote-banner">
                <div>
                    <span className="dashboard-quote-label">A NOTE FROM THE LIBRARY</span>
                    <p>“A room without books is like a body without a soul.”</p>
                    <small>— Marcus Tullius Cicero</small>
                </div>
                <div className="dashboard-book-art" aria-hidden="true"></div>
            </div>

            <div className="dashboard-stats">
                <article className="stat-card">
                    <div className="stat-card-head"><span className="stat-icon bg-blue"><Users size={19}/></span><span className="stat-card-label">Total users</span></div>
                    <strong>{loading ? "—" : users.length}</strong>
                    <span className="stat-card-trend">Registered members</span>
                </article>
                <article className="stat-card">
                    <div className="stat-card-head"><span className="stat-icon bg-green"><BookOpen size={19}/></span><span className="stat-card-label">Total copies</span></div>
                    <strong>{loading ? "—" : totalCopies}</strong>
                    <span className="stat-card-trend">{books.length} book titles</span>
                </article>
                <article className="stat-card">
                    <div className="stat-card-head"><span className="stat-icon bg-gold"><BookUp size={19}/></span><span className="stat-card-label">Currently issued</span></div>
                    <strong>{loading ? "—" : activeIssues}</strong>
                    <span className="stat-card-trend">Books with members</span>
                </article>
                <article className="stat-card">
                    <div className="stat-card-head"><span className="stat-icon bg-red"><LibraryBig size={19}/></span><span className="stat-card-label">Available copies</span></div>
                    <strong>{loading ? "—" : availableCopies}</strong>
                    <span className="stat-card-trend">Ready to issue</span>
                </article>
            </div>

            <div className="dashboard-lower">
                <section className="recent-panel">
                    <div className="panel-head">
                        <div><h2>Recent book issues</h2><p>Latest activity in your library</p></div>
                        <Link to="/admin/issue-records">View all <ArrowUpRight size={14}/></Link>
                    </div>
                    {loading ? <p className="dashboard-empty">Loading issue records…</p> :
                        recentIssues.length === 0 ? <p className="dashboard-empty">No issue records yet.</p> :
                        <div className="dashboard-table-wrap">
                            <table className="recent-table">
                                <thead><tr><th>Book</th><th>Member</th><th>Issue date</th><th>Status</th></tr></thead>
                                <tbody>
                                {recentIssues.map(issue => {
                                    const book = bookById.get(String(issue.book_id));
                                    const user = userById.get(String(issue.user_id));
                                    const status = getIssueStatus(issue);
                                    return <tr key={issue.id}>
                                        <td>{book?.title || `Book #${issue.book_id}`}</td>
                                        <td>{user?.email || `User #${issue.user_id}`}</td>
                                        <td>{formatDate(issue.issueDate)}</td>
                                        <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                                    </tr>;
                                })}
                                </tbody>
                            </table>
                        </div>
                    }
                </section>

                <div className="dashboard-side-stack">
                    <section className="quote-panel">
                        <span className="quote-mark">“</span>
                        <p className="quote-text">Books are a uniquely portable magic.</p>
                        <span className="quote-author">— Stephen King</span>
                    </section>
                    <section className="quick-panel">
                        <div className="panel-head"><h2>Quick actions</h2></div>
                        <div className="quick-list">
                            <Link className="quick-item" to="/admin/books"><span className="quick-item-icon"><BookOpen size={17}/></span><span><strong>Manage books</strong><small>Add or update catalogue titles</small></span><ArrowUpRight size={15}/></Link>
                            <Link className="quick-item" to="/admin/issue-return"><span className="quick-item-icon"><BookUp size={17}/></span><span><strong>Issue a book</strong><small>Assign a book to a member</small></span><ArrowUpRight size={15}/></Link>
                            <Link className="quick-item" to="/admin/users"><span className="quick-item-icon"><Users size={17}/></span><span><strong>View members</strong><small>Browse registered users</small></span><ArrowUpRight size={15}/></Link>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}

export default AdminDashboard;
