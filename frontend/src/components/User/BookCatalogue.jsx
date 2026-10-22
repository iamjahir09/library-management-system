
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    BookOpen,
    LibraryBig,
    ArrowUpRight,
    SlidersHorizontal
} from "lucide-react";
import "./BookCatalogue.css";

const API_URL = "http://localhost:7070/books";

function BookCatalogue() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [borrowingId, setBorrowingId] = useState(null);
    const [borrowMessage, setBorrowMessage] = useState("");
    const [borrowError, setBorrowError] = useState("");
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`Failed to fetch books (${response.status})`);
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response received from server.");
                }

                setBooks(data);
            } catch (err) {
                console.error("Error fetching books:", err);
                setError(
                    "Unable to load books. Please check whether the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const categories = useMemo(() => {
        return [
            "All Categories",
            ...new Set(
                books
                    .map(book => book.category)
                    .filter(Boolean)
            )
        ];
    }, [books]);

    const filteredBooks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return books.filter(book => {
            const title = String(book.title ?? "").toLowerCase();
            const author = String(book.author ?? "").toLowerCase();
            const isbn = String(book.isbn ?? "");
            const bookCategory = book.category ?? "";

            const matchesSearch =
                title.includes(query) ||
                author.includes(query) ||
                isbn.toLowerCase().includes(query);

            const matchesCategory =
                category === "All Categories" ||
                bookCategory === category;

            return matchesSearch && matchesCategory;
        });
    }, [books, search, category]);


    const handleBorrow = async (book) => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            setBorrowError("Please log in before borrowing a book.");
            setBorrowMessage("");
            return;
        }

        if (Number(book.available_copies ?? 0) <= 0) {
            setBorrowError("This book is currently unavailable.");
            setBorrowMessage("");
            return;
        }

        try {
            setBorrowingId(book.id);
            setBorrowError("");
            setBorrowMessage("");

            const response = await fetch(
                `http://localhost:7070/member/books/${book.id}/borrow`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            // Read the response body only once.
            const responseText = await response.text();

            let data = {};

            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error(
                        `Backend error (${response.status}): ${responseText}`
                    );
                }
            }

            if (!response.ok) {
                console.error("Borrow API failed:", {
                    status: response.status,
                    response: data,
                });

                throw new Error(
                    data.message ||
                    data.error ||
                    data.title ||
                    `Borrow failed with status ${response.status}. Check backend logs.`
                );
            }

            setBorrowMessage(
                data.message || `${book.title} borrowed successfully!`
            );

            // Refresh inventory after a successful borrow.
            const booksResponse = await fetch(API_URL, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!booksResponse.ok) {
                throw new Error(
                    "Book borrowed, but inventory could not be refreshed."
                );
            }

            const updatedBooks = await booksResponse.json();

            if (Array.isArray(updatedBooks)) {
                setBooks(updatedBooks);
            } else {
                throw new Error(
                    "Book borrowed, but the inventory response is invalid."
                );
            }
        } catch (err) {
            console.error("Borrow book error:", err);

            setBorrowError(
                err.message || "Something went wrong while borrowing the book."
            );
        } finally {
            setBorrowingId(null);
        }
    };


    return (
        <div className="catalogue-page">
            <div className="catalogue-heading">
                <div>
                    <span className="catalogue-eyebrow">
                        THE OLD LIBRARY / MEMBER
                    </span>
                    <h1>Book Catalogue</h1>
                    <p>Explore our collection and find your next read.</p>
                </div>

                <div className="catalogue-heading-icon">
                    <LibraryBig size={27} />
                </div>
            </div>

            <section className="catalogue-welcome">
                <div>
                    <span className="catalogue-welcome-label">
                        YOUR NEXT CHAPTER STARTS HERE
                    </span>
                    <h2>A world of knowledge awaits.</h2>
                    <p>Discover books, learn something new, and keep growing.</p>
                </div>
                <BookOpen className="catalogue-welcome-art" size={82} />
            </section>

            <div className="catalogue-summary">
                <div className="catalogue-summary-icon">
                    <BookOpen size={22} />
                </div>
                <div>
                    <span>Books in this collection</span>
                    <strong>{filteredBooks.length} titles</strong>
                </div>
            </div>

            <section className="catalogue-panel">
                <div className="catalogue-panel-heading">
                    <div>
                        <h2>Explore Books</h2>
                        <p>Search by title, author or ISBN.</p>
                    </div>
                    <span className="catalogue-count">
                        {filteredBooks.length} results
                    </span>
                </div>

                <div className="catalogue-toolbar">
                    <div className="catalogue-search">
                        <Search size={19} />
                        <input
                            type="search"
                            placeholder="Search books, authors, ISBN..."
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            aria-label="Search books"
                        />
                    </div>

                    <div className="catalogue-filter">
                        <SlidersHorizontal size={17} />
                        <select
                            value={category}
                            onChange={event => setCategory(event.target.value)}
                            aria-label="Filter by category"
                        >
                            {categories.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="catalogue-empty">
                        <BookOpen size={35} />
                        <h3>Loading books...</h3>
                        <p>Please wait while we load the library collection.</p>
                    </div>
                )}
                {borrowMessage && (
                    <p className="borrow-success" role="status">
                        {borrowMessage}
                    </p>
                )}

                {borrowError && (
                    <p className="borrow-error" role="alert">
                        {borrowError}
                    </p>
                )}
                {!loading && error && (
                    <div className="catalogue-empty">
                        <BookOpen size={35} />
                        <h3>Could not load books</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="catalogue-grid">
                            {filteredBooks.map(book => {
                                const available = Number(book.available_copies ?? 0);
                                const total = Number(book.total_copies ?? 0);

                                const cover = book.isbn
                                    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-M.jpg`
                                    : "";

                                return (
                                    <article
                                        className="catalogue-book-card"
                                        key={book.id}
                                    >
                                        <div className="catalogue-cover-wrap">
                                            <img
                                                className="catalogue-cover"
                                                src={cover}
                                                alt={`${book.title} book cover`}
                                                loading="lazy"
                                                onError={event => {
                                                    event.currentTarget.style.display = "none";
                                                    const fallback =
                                                        event.currentTarget.nextElementSibling;
                                                    if (fallback) {
                                                        fallback.style.display = "flex";
                                                    }
                                                }}
                                            />

                                            <div className="catalogue-cover-fallback">
                                                <BookOpen size={35} />
                                                <span>{book.title}</span>
                                            </div>

                                            <span
                                                className={`catalogue-stock ${
                                                    available === 0 ? "out-of-stock" : ""
                                                }`}
                                            >
                                                {available > 0
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>

                                        <div className="catalogue-book-info">
                                            <span className="catalogue-book-category">
                                                {book.category || "Uncategorized"}
                                            </span>

                                            <h3>{book.title}</h3>
                                            <p className="catalogue-author">
                                                {book.author}
                                            </p>

                                            <div className="catalogue-book-bottom">
                                                <span>
                                                    {available} of {total} available
                                                </span>
                                                <button
                                                    type="button"
                                                    className="catalogue-borrow-button"
                                                    disabled={
                                                        Number(book.available_copies) <= 0 ||
                                                        borrowingId === book.id
                                                    }
                                                    onClick={() => handleBorrow(book)}
                                                >
                                                    {borrowingId === book.id
                                                        ? "Borrowing..."
                                                        : Number(book.available_copies) <= 0
                                                            ? "Unavailable"
                                                            : "Borrow Book"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="catalogue-details-button"
                                                    title="Book details"
                                                    onClick={() =>
                                                        window.alert(
                                                            `${book.title}\n` +
                                                            `Author: ${book.author}\n` +
                                                            `ISBN: ${book.isbn}\n` +
                                                            `Category: ${book.category}\n` +
                                                            `Available: ${available} of ${total}`
                                                        )
                                                    }
                                                >
                                                    <ArrowUpRight size={17} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {filteredBooks.length === 0 && (
                            <div className="catalogue-empty">
                                <BookOpen size={35} />
                                <h3>No books found</h3>
                                <p>Try a different search or category.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("All Categories");
                                    }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default BookCatalogue;
