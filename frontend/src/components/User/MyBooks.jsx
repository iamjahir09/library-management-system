
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    Clock3,
    CheckCircle2,
    Search,
    RotateCcw,
    RefreshCw
} from "lucide-react";
import "./MyBooks.css";

const API_URL = "http://localhost:7070";


function formatDate(date) {
    if (!date) return "—";

    let parsed;

    // Handle LocalDate serialized as [year, month, day]
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day] = date;
        parsed = new Date(year, month - 1, day);
    } else {
        const value = String(date).slice(0, 10);
        parsed = new Date(`${value}T00:00:00`);
    }

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getDisplayStatus(book) {
    if (String(book.status).toUpperCase() === "RETURNED") {
        return "RETURNED";
    }

    if (book.dueDate) {
        const due = Array.isArray(book.dueDate)
            ? new Date(
                book.dueDate[0],
                book.dueDate[1] - 1,
                book.dueDate[2]
            )
            : new Date(`${String(book.dueDate).slice(0, 10)}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!Number.isNaN(due.getTime()) && due < today) {
            return "OVERDUE";
        }
    }

    return "ISSUED";
}

async function readResponse(response) {
    const text = await response.text();

    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(text || "Invalid response from server.");
    }
}

function MyBooks() {
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]);
    const [activeTab, setActiveTab] = useState("ISSUED");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadMyBooks = useCallback(async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            setError("Please log in to view your borrowed books.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            };

            const [issuesResponse, booksResponse] = await Promise.all([
                fetch(`${API_URL}/member/book-issues`, { headers }),
                fetch(`${API_URL}/books`, { headers })
            ]);

            const issuesData = await readResponse(issuesResponse);

            if (!issuesResponse.ok) {
                throw new Error(
                    issuesData.message ||
                    issuesData.error ||
                    "Could not load your borrowing history."
                );
            }

            const booksData = await readResponse(booksResponse);

            if (!booksResponse.ok) {
                throw new Error(
                    booksData.message ||
                    booksData.error ||
                    "Could not load book details."
                );
            }

            if (!Array.isArray(issuesData) || !Array.isArray(booksData)) {
                throw new Error("The backend returned an invalid response.");
            }

            setIssues(issuesData);
            setBooks(booksData);
        } catch (err) {
            console.error("Loading My Books failed:", err);
            setError(err.message || "Unable to load your books.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMyBooks();
    }, [loadMyBooks]);

    // Join issue records with catalogue data using book ID.
    const myBooks = useMemo(() => {
        const bookMap = new Map(
            books.map(book => [String(book.id), book])
        );

        return issues.map(issue => {
            const bookId = issue.book_id ?? issue.bookId;
            const catalogueBook = bookMap.get(String(bookId));

            return {
                ...issue,
                title: catalogueBook?.title || `Book #${bookId ?? "Unknown"}`,
                author: catalogueBook?.author || "Author unavailable",
                issueDate: issue.issueDate ?? issue.issue_date ?? null,
                dueDate: issue.dueDate ?? issue.due_date ?? null,
                returnDate: issue.returnDate ?? issue.return_date ?? null,
                status: String(issue.status || "ISSUED").toUpperCase()
            };
        });
    }, [issues, books]);

    const issuedBooks = myBooks.filter(book => book.status === "ISSUED");
    const returnedBooks = myBooks.filter(book => book.status === "RETURNED");

    const overdueCount = issuedBooks.filter(
        book => getDisplayStatus(book) === "OVERDUE"
    ).length;

    const visibleBooks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return myBooks.filter(book => {
            const displayStatus = getDisplayStatus(book);

            const matchesTab = activeTab === "ISSUED"
                ? displayStatus === "ISSUED" || displayStatus === "OVERDUE"
                : displayStatus === "RETURNED";

            const matchesSearch =
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query);

            return matchesTab && matchesSearch;
        });
    }, [myBooks, activeTab, search]);

    const handleReturn = async (book) => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        if (!window.confirm(`Are you sure you want to return "${book.title}"?`)) {
            return;
        }

        try {
            setReturningId(book.id);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/member/book-issues/${book.id}/return`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                console.error("Return API failed:", {
                    status: response.status,
                    response: data
                });

                throw new Error(
                    data.message ||
                    data.error ||
                    data.title ||
                    `Return failed with status ${response.status}.`
                );
            }

            setMessage(data.message || `"${book.title}" returned successfully.`);
            await loadMyBooks();
        } catch (err) {
            console.error("Returning book failed:", err);
            setError(err.message || "Unable to return this book.");
        } finally {
            setReturningId(null);
        }
    };

    return (
        <div className="my-books-page">
            <div className="my-books-heading">
                <div>
                    <span className="my-books-eyebrow">
                        THE OLD LIBRARY / MEMBER
                    </span>
                    <h1>My Books</h1>
                    <p>Keep track of your borrowed books and return dates.</p>
                </div>

                <div className="my-books-heading-icon">
                    <BookOpen size={27} />
                </div>
            </div>

            <div className="my-books-stats">
                <div className="my-books-stat">
                    <span className="my-books-stat-icon navy">
                        <BookOpen size={20} />
                    </span>
                    <div>
                        <p>Currently Issued</p>
                        <strong>{issuedBooks.length}</strong>
                    </div>
                </div>

                <div className="my-books-stat">
                    <span className="my-books-stat-icon green">
                        <CheckCircle2 size={20} />
                    </span>
                    <div>
                        <p>Returned Books</p>
                        <strong>{returnedBooks.length}</strong>
                    </div>
                </div>

                <div className="my-books-stat">
                    <span className="my-books-stat-icon red">
                        <Clock3 size={20} />
                    </span>
                    <div>
                        <p>Overdue Books</p>
                        <strong>{overdueCount}</strong>
                    </div>
                </div>
            </div>

            <section className="my-books-panel">
                <div className="my-books-panel-heading">
                    <div>
                        <h2>Borrowing History</h2>
                        <p>View and manage your library transactions.</p>
                    </div>

                    <button
                        type="button"
                        onClick={loadMyBooks}
                        disabled={loading}
                        title="Refresh borrowing history"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                <div className="my-books-toolbar">
                    <div className="my-books-tabs">
                        <button
                            type="button"
                            className={activeTab === "ISSUED" ? "active" : ""}
                            onClick={() => setActiveTab("ISSUED")}
                        >
                            Currently Issued
                            <span>{issuedBooks.length}</span>
                        </button>

                        <button
                            type="button"
                            className={activeTab === "RETURNED" ? "active" : ""}
                            onClick={() => setActiveTab("RETURNED")}
                        >
                            Returned Books
                            <span>{returnedBooks.length}</span>
                        </button>
                    </div>

                    <div className="my-books-search">
                        <Search size={17} />
                        <input
                            type="search"
                            placeholder="Search your books..."
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                        />
                    </div>
                </div>

                {message && (
                    <p className="borrow-success" role="status">{message}</p>
                )}

                {error && (
                    <div className="borrow-error" role="alert">
                        <p>{error}</p>
                        <button type="button" onClick={loadMyBooks}>
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="my-books-empty">
                        <RefreshCw size={28} />
                        <h3>Loading your books...</h3>
                    </div>
                ) : !error && visibleBooks.length > 0 ? (
                    <div className="my-books-table-wrap">
                        <table className="my-books-table">
                            <thead>
                            <tr>
                                <th>BOOK TITLE</th>
                                <th>ISSUE DATE</th>
                                <th>DUE DATE</th>
                                <th>RETURN DATE</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                            </thead>

                            <tbody>
                            {visibleBooks.map(book => {
                                const displayStatus = getDisplayStatus(book);
                                const isIssued = book.status === "ISSUED";

                                return (
                                    <tr key={book.id}>
                                        <td>
                                            <div className="my-books-title-cell">
                                                    <span className="my-books-book-icon">
                                                        <BookOpen size={18} />
                                                    </span>
                                                <div>
                                                    <strong>{book.title}</strong>
                                                    <span>{book.author}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{formatDate(book.issueDate)}</td>

                                        <td>
                                                <span className={
                                                          displayStatus === "OVERDUE"
                                                              ? "my-books-due overdue"
                                                              : "my-books-due"
                                                      }>
                                                    <CalendarDays size={14} />
                                                    {formatDate(book.dueDate)}
                                                </span>
                                        </td>

                                        <td>{formatDate(book.returnDate)}</td>

                                        <td>
                                                <span className={`my-books-status ${displayStatus.toLowerCase()}`}>
                                                    {displayStatus}
                                                </span>
                                        </td>

                                        <td>
                                            {isIssued ? (
                                                <button
                                                    type="button"
                                                    className="my-books-return-button"
                                                    disabled={returningId === book.id}
                                                    onClick={() => handleReturn(book)}
                                                >
                                                    <RotateCcw size={15} />
                                                    {returningId === book.id
                                                        ? "Returning..."
                                                        : "Return Book"}
                                                </button>
                                            ) : (
                                                <span>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                ) : !error ? (
                    <div className="my-books-empty">
                        <BookOpen size={32} />
                        <h3>No books found</h3>
                        <p>
                            {activeTab === "ISSUED"
                                ? "You don't have any currently issued books matching this search."
                                : "You don't have any returned books matching this search."}
                        </p>
                    </div>
                ) : null}

                <div className="my-books-note">
                    <Clock3 size={16} />
                    <p>
                        Please return books by their due date. Overdue labels
                        are calculated from the current date.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default MyBooks;
