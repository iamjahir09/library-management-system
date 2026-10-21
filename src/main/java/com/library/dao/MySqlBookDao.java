
package com.library.dao;

import com.library.model.Book;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MySqlBookDao implements BookDao {

    private final DataSource dataSource;

    public MySqlBookDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 1. Save book
    @Override
    public Book save(Book book) {

        String sql = """
                INSERT INTO books
                (title, author, isbn, category, total_copies, available_copies)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getIsbn());
            ps.setString(4, book.getCategory());
            ps.setInt(5, book.getTotal_copies());
            ps.setInt(6, book.getAvailable_copies());

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return new Book(
                            keys.getLong(1),
                            book.getTitle(),
                            book.getAuthor(),
                            book.getIsbn(),
                            book.getCategory(),
                            book.getTotal_copies(),
                            book.getAvailable_copies()
                    );
                }
            }

            throw new SQLException("Book ID was not generated");

        } catch (SQLException e) {
            throw new RuntimeException("Failed to save book", e);
        }
    }

    // 2. Find all books
    @Override
    public List<Book> findAll() {

        String sql = "SELECT * FROM books ORDER BY id";
        List<Book> books = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                books.add(mapRow(rs));
            }

            return books;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve books", e);
        }
    }

    // 3. Find book by ID
    @Override
    public Optional<Book> findById(Long id) {

        String sql = "SELECT * FROM books WHERE id = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }

                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to find book by ID", e);
        }
    }

    // 4. Find book by title
    @Override
    public Optional<Book> findByTitle(String title) {

        String sql = "SELECT * FROM books WHERE title = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, title);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }

                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to find book by title", e);
        }
    }

    // 5. Update book
    @Override
    public boolean update(Long id, Book book) {

        String sql = """
                UPDATE books
                SET title = ?,
                    author = ?,
                    isbn = ?,
                    category = ?,
                    total_copies = ?,
                    available_copies = ?
                WHERE id = ?
                """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getIsbn());
            ps.setString(4, book.getCategory());
            ps.setInt(5, book.getTotal_copies());
            ps.setInt(6, book.getAvailable_copies());
            ps.setLong(7, id);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to update book", e);
        }
    }

    // 6. Delete book by ID
    @Override
    public boolean deleteById(Long id) {

        String sql = "DELETE FROM books WHERE id = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, id);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete book", e);
        }
    }

    // Convert database row to Book object
    private Book mapRow(ResultSet rs) throws SQLException {

        return new Book(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("author"),
                rs.getString("isbn"),
                rs.getString("category"),
                rs.getInt("total_copies"),
                rs.getInt("available_copies")
        );
    }
}
