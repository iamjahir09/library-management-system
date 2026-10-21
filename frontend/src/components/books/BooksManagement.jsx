
import { useCallback, useEffect, useMemo, useState } from "react";
import "./BooksManagement.css";

const API = "http://localhost:7070";

const emptyForm = {
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: "1",
    available_copies: "1",
};

function BooksManagement() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const token = sessionStorage.getItem("token");

    const request = useCallback(async (url, options = {}) => {
        const response = await fetch(`${API}${url}`, {
            ...options,
            headers: {
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const text = await response.text();
        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        if (!response.ok) {
            throw new Error(
                data?.error || data?.message || `Request failed (${response.status})`
            );
        }

        return data;
    }, [token]);

    const loadBooks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await request("/books");
            setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Could not load books.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    const filteredBooks = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return books;

        return books.filter((book) =>
            [
                book.title,
                book.author,
                book.isbn,
                book.category,
            ].some((value) => String(value ?? "").toLowerCase().includes(term))
        );
    }, [books, search]);

    const availableCount = books.reduce(
        (sum, book) => sum + Number(book.available_copies ?? 0),
        0
    );

    function changeField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    function openAddForm() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setNotice("");
        setShowForm(true);
    }

    function openEditForm(book) {
        setEditingId(book.id);
        setForm({
            title: book.title ?? "",
            author: book.author ?? "",
            isbn: book.isbn ?? "",
            category: book.category ?? "",
            total_copies: String(book.total_copies ?? 1),
            available_copies: String(book.available_copies ?? 1),
        });
        setError("");
        setNotice("");
        setShowForm(true);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        const total = Number(form.total_copies);
        const available = Number(form.available_copies);

        if (!form.title.trim() || !form.author.trim()) {
            setError("Book title and author are required.");
            return;
        }

        if (
            !Number.isInteger(total) ||
            !Number.isInteger(available) ||
            total < 1 ||
            available < 0 ||
            available > total
        ) {
            setError("Enter valid copy counts. Available copies cannot exceed total copies.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            author: form.author.trim(),
            isbn: form.isbn.trim() || null,
            category: form.category.trim() || null,
            total_copies: total,
            available_copies: available,
        };

        setSaving(true);

        try {
            const url = editingId != null
                ? `/admin/books/${editingId}`
                : "/admin/books";

            await request(url, {
                method: editingId != null ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            setNotice(editingId != null
                ? "Book details updated successfully."
                : "Book added to the catalogue successfully.");

            await loadBooks();
        } catch (err) {
            setError(err.message || "Could not save the book.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(book) {
        const confirmed = window.confirm(
            `Delete "${book.title}" from the catalogue?`
        );

        if (!confirmed) return;

        setError("");
        setNotice("");

        try {
            await request(`/admin/books/${book.id}`, {
                method: "DELETE",
            });

            setNotice("Book deleted successfully.");
            await loadBooks();
        } catch (err) {
            setError(err.message || "Could not delete the book.");
        }
    }

    return (
        <main className="books-page">
            <header className="books-header">
                <div>
                    <p className="books-eyebrow">THE OLD LIBRARY · ARCHIVE</p>
                    <h1>Books Catalogue</h1>
                    <p className="books-subtitle">
                        Curate your collection. Keep knowledge in circulation.
                    </p>
                </div>

                <button className="book-primary-btn" onClick={openAddForm}>
                    <span aria-hidden="true">＋</span> Add a book
                </button>
            </header>

            <section className="book-stats" aria-label="Catalogue statistics">
                <article className="book-stat">
                    <span className="book-stat-label">Titles in catalogue</span>
                    <strong>{books.length}</strong>
                    <span className="book-stat-note">Registered book records</span>
                </article>

                <article className="book-stat">
                    <span className="book-stat-label">Available copies</span>
                    <strong>{availableCount}</strong>
                    <span className="book-stat-note">Ready for readers</span>
                </article>

                <article className="book-stat">
                    <span className="book-stat-label">Categories</span>
                    <strong>
                        {new Set(
                            books.map((book) => book.category?.trim()).filter(Boolean)
                        ).size}
                    </strong>
                    <span className="book-stat-note">Across the collection</span>
                </article>
            </section>

            {error && (
                <div className="books-message books-error" role="alert">
                    {error}
                </div>
            )}

            {notice && (
                <div className="books-message books-success" role="status">
                    {notice}
                </div>
            )}

            {showForm && (
                <section className="book-form-panel" id="book-form">
                    <div className="book-form-heading">
                        <div>
                            <p className="books-eyebrow">
                                {editingId != null ? "EDIT RECORD" : "NEW ENTRY"}
                            </p>
                            <h2>
                                {editingId != null ? "Update book details" : "Add to the collection"}
                            </h2>
                        </div>

                        <button
                            type="button"
                            className="book-close-btn"
                            onClick={() => setShowForm(false)}
                            aria-label="Close form"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="book-form-grid">
                            <label>
                                Book title *
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={changeField}
                                    placeholder="e.g. Effective Java"
                                    required
                                />
                            </label>

                            <label>
                                Author *
                                <input
                                    name="author"
                                    value={form.author}
                                    onChange={changeField}
                                    placeholder="e.g. Joshua Bloch"
                                    required
                                />
                            </label>

                            <label>
                                ISBN
                                <input
                                    name="isbn"
                                    value={form.isbn}
                                    onChange={changeField}
                                    placeholder="ISBN number"
                                />
                            </label>

                            <label>
                                Category
                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={changeField}
                                    placeholder="e.g. Programming"
                                />
                            </label>

                            <label>
                                Total copies *
                                <input
                                    name="total_copies"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.total_copies}
                                    onChange={changeField}
                                    required
                                />
                            </label>

                            <label>
                                Available copies *
                                <input
                                    name="available_copies"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.available_copies}
                                    onChange={changeField}
                                    required
                                />
                            </label>
                        </div>

                        <p className="book-form-hint">
                            Available copies must be between zero and the total number of copies.
                        </p>

                        <div className="book-form-actions">
                            <button
                                type="button"
                                className="book-secondary-btn"
                                onClick={() => setShowForm(false)}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="book-primary-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId != null
                                        ? "Save changes"
                                        : "Add to catalogue"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="book-catalogue-panel">
                <div className="catalogue-toolbar">
                    <div>
                        <p className="books-eyebrow">COLLECTION REGISTER</p>
                        <h2>All books</h2>
                        <p className="catalogue-count">
                            {filteredBooks.length} of {books.length} records
                        </p>
                    </div>

                    <div className="book-search">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            placeholder="Search title, author, ISBN..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search books"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="books-empty">
                        <span className="books-empty-mark">✧</span>
                        <h3>Opening the archive...</h3>
                        <p>Retrieving the collection from the library database.</p>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="books-empty">
                        <span className="books-empty-mark">✧</span>
                        <h3>{search ? "No matching books" : "The catalogue is waiting"}</h3>
                        <p>
                            {search
                                ? "Try another title, author, ISBN or category."
                                : "Add the first book to begin building your collection."}
                        </p>
                        {!search && (
                            <button className="book-primary-btn" onClick={openAddForm}>
                                Add your first book
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="book-table-wrap">
                        <table className="book-table">
                            <thead>
                            <tr>
                                <th>Book details</th>
                                <th>ISBN</th>
                                <th>Category</th>
                                <th>Copies</th>
                                <th>Availability</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredBooks.map((book) => {
                                const available = Number(book.available_copies ?? 0);

                                return (
                                    <tr key={book.id}>
                                        <td>
                                            <div className="book-title-cell">
                                                <span className="book-spine" aria-hidden="true">▤</span>
                                                <span>
                                                        <strong>{book.title}</strong>
                                                        <small>{book.author}</small>
                                                    </span>
                                            </div>
                                        </td>

                                        <td className="book-isbn">
                                            {book.isbn || "—"}
                                        </td>

                                        <td>
                                                <span className="book-category">
                                                    {book.category || "Uncategorised"}
                                                </span>
                                        </td>

                                        <td>
                                            {available} / {book.total_copies}
                                        </td>

                                        <td>
                                                <span className={`book-status ${available > 0 ? "is-available" : "is-unavailable"}`}>

                                                    {available > 0 ? "Available" : "Unavailable"}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="book-row-actions">
                                                <button
                                                    type="button"
                                                    className="book-edit-btn"
                                                    onClick={() => openEditForm(book)}
                                                    aria-label={`Edit ${book.title}`}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="book-delete-btn"
                                                    onClick={() => handleDelete(book)}
                                                    aria-label={`Delete ${book.title}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="catalogue-footer">
                    <span>THE OLD LIBRARY</span>
                    <span>Preserving knowledge, one volume at a time.</span>
                </div>
            </section>
        </main>
    );
}

export default BooksManagement;
