import { useCallback, useEffect, useMemo, useState } from "react";
import { BookUp, RotateCcw, Search, RefreshCw } from "lucide-react";
import { apiRequest, formatDate, getIssueStatus } from "../../api";
import "./IssueReturn.css";

const todayString = () => new Date().toISOString().slice(0, 10);

function IssueReturn() {
    const [mode, setMode] = useState("issue");
    const [email, setEmail] = useState("");
    const [bookId, setBookId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [bookData, userData, issueData] = await Promise.all([
                apiRequest("/books"),
                apiRequest("/admin/users"),
                apiRequest("/admin/book-issues"),
            ]);
            setBooks(Array.isArray(bookData) ? bookData : []);
            setUsers(Array.isArray(userData) ? userData : userData?.users || []);
            setIssues(Array.isArray(issueData) ? issueData : []);
        } catch (err) {
            setError(err.message || "Could not load library data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const usersById = useMemo(() => new Map(users.map(user => [String(user.id), user])), [users]);
    const booksById = useMemo(() => new Map(books.map(book => [String(book.id), book])), [books]);
    const activeIssues = issues.filter(issue => issue.status === "ISSUED");
    const filteredActiveIssues = activeIssues.filter(issue => {
        const book = booksById.get(String(issue.book_id));
        const user = usersById.get(String(issue.user_id));
        const term = search.trim().toLowerCase();
        return !term || [book?.title, book?.author, user?.email, user?.name, issue.id]
            .some(value => String(value ?? "").toLowerCase().includes(term));
    });

    async function handleIssue(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!email.trim() || !bookId || !dueDate) {
            setError("Enter a member email, select a book and choose a due date.");
            return;
        }
        if (dueDate < todayString()) {
            setError("Due date cannot be before today.");
            return;
        }

        setSaving(true);
        try {
            const created = await apiRequest("/admin/book-issues", {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim(),
                    bookId: Number(bookId),
                    dueDate,
                }),
            });
            setNotice(`Book issued successfully. Issue ID: ${created?.id ?? "created"}`);
            setEmail("");
            setBookId("");
            setDueDate("");
            await loadData();
        } catch (err) {
            setError(err.message || "Could not issue this book.");
        } finally {
            setSaving(false);
        }
    }

    async function handleReturn(issue) {
        const book = booksById.get(String(issue.book_id));
        if (!window.confirm(`Return "${book?.title || `Book #${issue.book_id}`}" for issue #${issue.id}?`)) return;

        setError("");
        setNotice("");
        setSaving(true);
        try {
            await apiRequest(`/admin/book-issues/${issue.id}/return`, { method: "POST" });
            setNotice("Book returned successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Could not return this book.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="issue-page">
            <div className="page-heading-row">
                <div>
                    <p className="page-eyebrow">CIRCULATION DESK</p>
                    <h1>Issue / Return Books</h1>
                    <p className="issue-subtitle">Issue books to registered members and keep returns up to date.</p>
                </div>
                <button className="page-refresh-btn" onClick={loadData} disabled={loading}><RefreshCw size={15}/> Refresh</button>
            </div>

            {error && <div className="page-alert page-alert-error" role="alert">{error}</div>}
            {notice && <div className="page-alert page-alert-success" role="status">{notice}</div>}

            <div className="issue-tabs">
                <button type="button" className={`issue-tab ${mode === "issue" ? "active" : ""}`} onClick={() => { setMode("issue"); setError(""); setNotice(""); }}><BookUp size={16}/> Issue book</button>
                <button type="button" className={`issue-tab ${mode === "return" ? "active" : ""}`} onClick={() => { setMode("return"); setError(""); setNotice(""); }}><RotateCcw size={16}/> Return book <span>{activeIssues.length}</span></button>
            </div>

            {mode === "issue" ? (
                <div className="issue-layout">
                    <section className="issue-form-panel">
                        <div className="page-panel-heading"><span className="panel-icon"><BookUp size={19}/></span><div><h2>Issue a book</h2><p>Member and book details</p></div></div>
                        <form onSubmit={handleIssue}>
                            <div className="issue-field">
                                <label htmlFor="issue-email">Registered member email *</label>
                                <input id="issue-email" type="email" list="member-emails" placeholder="member@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                <datalist id="member-emails">{users.map(user => <option key={user.id} value={user.email}>{user.name}</option>)}</datalist>
                            </div>
                            <div className="issue-field">
                                <label htmlFor="issue-book">Book title *</label>
                                <select id="issue-book" value={bookId} onChange={e => setBookId(e.target.value)} required>
                                    <option value="">Select a book</option>
                                    {books.map(book => <option key={book.id} value={book.id} disabled={Number(book.available_copies) < 1}>{book.title} — {book.author} ({book.available_copies} available)</option>)}
                                </select>
                            </div>
                            {bookId && (() => {
                                const selected = booksById.get(String(bookId));
                                return selected ? <div className="selected-book-note"><BookUp size={16}/><span><strong>{selected.title}</strong><small>{selected.available_copies} of {selected.total_copies} copies available</small></span></div> : null;
                            })()}
                            <div className="issue-field">
                                <label htmlFor="issue-due-date">Due date *</label>
                                <input id="issue-due-date" type="date" min={todayString()} value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                            </div>
                            <button className="issue-submit" type="submit" disabled={saving || loading}>{saving ? "Processing…" : "Confirm book issue"}</button>
                        </form>
                    </section>
                    <aside className="issue-aside">
                        <div className="issue-quote-card"><span>THE LIBRARY RULE</span><p>“A book is a gift you can open again and again.”</p><small>Keep knowledge in circulation.</small><div className="issue-illustration" aria-hidden="true">▤　▥　▤</div></div>
                        <div className="issue-summary-card"><h3>Circulation summary</h3><div><span>Book titles</span><strong>{books.length}</strong></div><div><span>Available copies</span><strong>{books.reduce((sum, book) => sum + Number(book.available_copies || 0), 0)}</strong></div><div><span>Currently issued</span><strong>{activeIssues.length}</strong></div></div>
                    </aside>
                </div>
            ) : (
                <section className="issue-form-panel return-panel">
                    <div className="return-toolbar">
                        <div><h2>Currently issued books</h2><p>Select a record to process its return.</p></div>
                        <div className="return-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member or book…"/></div>
                    </div>
                    {loading ? <p className="page-empty">Loading active issues…</p> : filteredActiveIssues.length === 0 ? <p className="page-empty">No matching active issues found.</p> : (
                        <div className="responsive-table-wrap"><table className="library-table"><thead><tr><th>Book</th><th>Member</th><th>Issue date</th><th>Due date</th><th>Status</th><th>Action</th></tr></thead><tbody>
                            {filteredActiveIssues.map(issue => {
                                const book = booksById.get(String(issue.book_id));
                                const user = usersById.get(String(issue.user_id));
                                const status = getIssueStatus(issue);
                                return <tr key={issue.id}><td><strong>{book?.title || `Book #${issue.book_id}`}</strong><small>{book?.author || ""}</small></td><td>{user?.email || `User #${issue.user_id}`}</td><td>{formatDate(issue.issueDate)}</td><td>{formatDate(issue.dueDate)}</td><td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td><td><button className="table-primary-btn" disabled={saving} onClick={() => handleReturn(issue)}>Return</button></td></tr>;
                            })}
                        </tbody></table></div>
                    )}
                </section>
            )}
        </section>
    );
}

export default IssueReturn;
