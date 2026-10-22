
import { useMemo, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    Clock3,
    CheckCircle2,
    Search,
    RotateCcw
} from "lucide-react";
import "./MyBooks.css";

const sampleIssues = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        issueDate: "2026-10-12",
        dueDate: "2026-10-26",
        returnDate: null,
        status: "ISSUED"
    },
    {
        id: 2,
        title: "Operating System Concepts",
        author: "Abraham Silberschatz",
        issueDate: "2026-10-10",
        dueDate: "2026-10-24",
        returnDate: null,
        status: "ISSUED"
    },
    {
        id: 3,
        title: "Design Patterns",
        author: "Erich Gamma",
        issueDate: "2026-10-01",
        dueDate: "2026-10-15",
        returnDate: null,
        status: "ISSUED"
    },
    {
        id: 4,
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        issueDate: "2026-09-10",
        dueDate: "2026-09-24",
        returnDate: "2026-09-22",
        status: "RETURNED"
    }
];

function formatDate(date) {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function MyBooks() {
    const [activeTab, setActiveTab] = useState("ISSUED");
    const [search, setSearch] = useState("");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDisplayStatus = (book) => {
        if (book.status === "RETURNED") return "RETURNED";

        const due = new Date(`${book.dueDate}T00:00:00`);
        return due < today ? "OVERDUE" : "ISSUED";
    };

    const issuedBooks = sampleIssues.filter(book => book.status === "ISSUED");
    const returnedBooks = sampleIssues.filter(book => book.status === "RETURNED");

    const visibleBooks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sampleIssues.filter(book => {
            const matchesTab = book.status === activeTab;
            const matchesSearch =
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query);

            return matchesTab && matchesSearch;
        });
    }, [activeTab, search]);

    const overdueCount = issuedBooks.filter(
        book => getDisplayStatus(book) === "OVERDUE"
    ).length;

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
                        <p>View the status of your library transactions.</p>
                    </div>
                </div>

                <div className="my-books-toolbar">
                    <div className="my-books-tabs">
                        <button
                            className={activeTab === "ISSUED" ? "active" : ""}
                            onClick={() => setActiveTab("ISSUED")}
                        >
                            Currently Issued
                            <span>{issuedBooks.length}</span>
                        </button>

                        <button
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

                <div className="my-books-table-wrap">
                    <table className="my-books-table">
                        <thead>
                        <tr>
                            <th>BOOK TITLE</th>
                            <th>ISSUE DATE</th>
                            <th>DUE DATE</th>
                            <th>RETURN DATE</th>
                            <th>STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {visibleBooks.map(book => {
                            const displayStatus = getDisplayStatus(book);

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
                                            <span className={displayStatus === "OVERDUE" ? "my-books-due overdue" : "my-books-due"}>
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
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {visibleBooks.length === 0 && (
                    <div className="my-books-empty">
                        <RotateCcw size={32} />
                        <h3>No books found</h3>
                        <p>There are no matching records in this tab.</p>
                    </div>
                )}

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
