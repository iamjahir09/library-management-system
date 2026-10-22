
import { useMemo, useState } from "react";
import {
    Search,
    BookOpen,
    LibraryBig,
    ArrowUpRight,
    SlidersHorizontal
} from "lucide-react";
import "./BookCatalogue.css";

const sampleBooks = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        isbn: "9780132350884",
        available: 3,
        total: 5,
        cover: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg"
    },
    {
        id: 2,
        title: "Operating System Concepts",
        author: "Abraham Silberschatz",
        category: "Computer Science",
        isbn: "9781119800361",
        available: 2,
        total: 4,
        cover: "https://covers.openlibrary.org/b/isbn/9781119800361-M.jpg"
    },
    {
        id: 3,
        title: "Design Patterns",
        author: "Erich Gamma",
        category: "Software Engineering",
        isbn: "9780201633610",
        available: 4,
        total: 6,
        cover: "https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg"
    },
    {
        id: 4,
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Algorithms",
        isbn: "9780262046305",
        available: 2,
        total: 4,
        cover: "https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg"
    },
    {
        id: 5,
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        category: "Database",
        isbn: "9780078022159",
        available: 0,
        total: 5,
        cover: "https://covers.openlibrary.org/b/isbn/9780078022159-M.jpg"
    },
    {
        id: 6,
        title: "The Pragmatic Programmer",
        author: "David Thomas",
        category: "Programming",
        isbn: "9780135957059",
        available: 2,
        total: 3,
        cover: "https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg"
    }
];

function BookCatalogue() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");

    const categories = [
        "All Categories",
        ...new Set(sampleBooks.map(book => book.category))
    ];

    const filteredBooks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sampleBooks.filter(book => {
            const matchesSearch =
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.isbn.includes(query);

            const matchesCategory =
                category === "All Categories" ||
                book.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [search, category]);

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

                <div className="catalogue-grid">
                    {filteredBooks.map(book => (
                        <article className="catalogue-book-card" key={book.id}>
                            <div className="catalogue-cover-wrap">
                                <img
                                    className="catalogue-cover"
                                    src={book.cover}
                                    alt={`${book.title} book cover`}
                                    loading="lazy"
                                    onError={event => {
                                        event.currentTarget.style.display = "none";
                                        event.currentTarget.nextElementSibling.style.display = "flex";
                                    }}
                                />
                                <div className="catalogue-cover-fallback">
                                    <BookOpen size={35} />
                                    <span>{book.title}</span>
                                </div>
                                <span className={`catalogue-stock ${book.available === 0 ? "out-of-stock" : ""}`}>
                                    {book.available > 0 ? "Available" : "Unavailable"}
                                </span>
                            </div>

                            <div className="catalogue-book-info">
                                <span className="catalogue-book-category">
                                    {book.category}
                                </span>
                                <h3>{book.title}</h3>
                                <p className="catalogue-author">{book.author}</p>

                                <div className="catalogue-book-bottom">
                                    <span>
                                        {book.available} of {book.total} available
                                    </span>
                                    <button
                                        type="button"
                                        className="catalogue-details-button"
                                        title="Book details"
                                        onClick={() => window.alert(
                                            `${book.title}\nAuthor: ${book.author}\nISBN: ${book.isbn}\nAvailable: ${book.available}`
                                        )}
                                    >
                                        <ArrowUpRight size={17} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
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
            </section>
        </div>
    );
}

export default BookCatalogue;
