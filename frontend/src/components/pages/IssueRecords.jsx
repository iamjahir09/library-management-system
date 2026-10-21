import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { apiRequest, formatDate, getIssueStatus } from "../../api";
import "./IssueRecords.css";

function IssueRecords() {
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRecords = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [issueData, bookData, userData] = await Promise.all([
                apiRequest("/admin/book-issues"),
                apiRequest("/books"),
                apiRequest("/admin/users"),
            ]);
            setIssues(Array.isArray(issueData) ? issueData : []);
            setBooks(Array.isArray(bookData) ? bookData : []);
            setUsers(Array.isArray(userData) ? userData : userData?.users || []);
        } catch (err) {
            setError(err.message || "Could not load issue records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadRecords(); }, [loadRecords]);

    const booksById = useMemo(() => new Map(books.map(book => [String(book.id), book])), [books]);
    const usersById = useMemo(() => new Map(users.map(user => [String(user.id), user])), [users]);
    const filtered = issues.filter(issue => {
        const book = booksById.get(String(issue.book_id));
        const user = usersById.get(String(issue.user_id));
        const status = getIssueStatus(issue);
        const term = search.trim().toLowerCase();
        const matchesTerm = !term || [book?.title, book?.author, user?.name, user?.email, issue.id, issue.book_id, issue.user_id]
            .some(value => String(value ?? "").toLowerCase().includes(term));
        const matchesStatus = statusFilter === "ALL" || status === statusFilter;
        return matchesTerm && matchesStatus;
    }).sort((a, b) => String(b.issueDate || "").localeCompare(String(a.issueDate || "")));

    return (
        <section className="records-page">
            <div className="page-heading-row">
                <div>
                    <p className="page-eyebrow">CIRCULATION REGISTER</p>
                    <h1>Issue Records</h1>
                    <p className="records-subtitle">Review every issue and return recorded by the library.</p>
                </div>
                <button className="page-refresh-btn" onClick={loadRecords} disabled={loading}><RefreshCw size={15}/> Refresh</button>
            </div>

            <div className="records-stat-row">
                <div><span>Total records</span><strong>{issues.length}</strong></div>
                <div><span>Currently issued</span><strong>{issues.filter(item => item.status === "ISSUED").length}</strong></div>
                <div><span>Returned</span><strong>{issues.filter(item => item.status === "RETURNED").length}</strong></div>
                <div><span>Overdue</span><strong>{issues.filter(item => getIssueStatus(item) === "OVERDUE").length}</strong></div>
            </div>

            {error && <div className="page-alert page-alert-error" role="alert">{error}</div>}

            <div className="records-filters">
                <label className="records-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search book, member, or issue ID…"/></label>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
                    <option value="ALL">All statuses</option><option value="ISSUED">Issued</option><option value="RETURNED">Returned</option><option value="OVERDUE">Overdue</option>
                </select>
            </div>

            <section className="records-table-panel">
                {loading ? <p className="page-empty">Loading issue records…</p> : filtered.length === 0 ? <p className="page-empty">No records match your filters.</p> : (
                    <div className="records-table-wrap">
                        <table className="records-table">
                            <thead><tr><th>Issue #</th><th>Book</th><th>Member</th><th>Issue date</th><th>Due date</th><th>Return date</th><th>Status</th></tr></thead>
                            <tbody>{filtered.map(issue => {
                                const book = booksById.get(String(issue.book_id));
                                const user = usersById.get(String(issue.user_id));
                                const status = getIssueStatus(issue);
                                return <tr key={issue.id}>
                                    <td>#{issue.id}</td>
                                    <td><strong>{book?.title || `Book #${issue.book_id}`}</strong><small>{book?.author || ""}</small></td>
                                    <td>{user?.name || user?.email || `User #${issue.user_id}`}<small>{user?.email || ""}</small></td>
                                    <td>{formatDate(issue.issueDate)}</td><td>{formatDate(issue.dueDate)}</td><td>{formatDate(issue.returnDate)}</td>
                                    <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                                </tr>;
                            })}</tbody>
                        </table>
                    </div>
                )}
                <div className="records-footer"><span>Showing {filtered.length} of {issues.length} records</span><span>Library circulation register</span></div>
            </section>
        </section>
    );
}

export default IssueRecords;
