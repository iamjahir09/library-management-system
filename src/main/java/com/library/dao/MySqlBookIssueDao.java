
package com.library.dao;

import com.library.model.BookIssue;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MySqlBookIssueDao implements BookIssueDao {

    private final DataSource dataSource;

    public MySqlBookIssueDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public BookIssue save(BookIssue issue) {
        String sql = """
            INSERT INTO book_issue
            (user_id, book_id, issue_date, due_date, return_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, issue.getUser_id());
            ps.setLong(2, issue.getBook_id());
            ps.setDate(3, Date.valueOf(issue.getIssueDate()));
            ps.setDate(4, Date.valueOf(issue.getDueDate()));

            if (issue.getReturnDate() == null) {
                ps.setNull(5, Types.DATE);
            } else {
                ps.setDate(5, Date.valueOf(issue.getReturnDate()));
            }

            ps.setString(6, issue.getStatus());
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return new BookIssue(
                            keys.getLong(1),
                            issue.getUser_id(),
                            issue.getBook_id(),
                            issue.getIssueDate(),
                            issue.getDueDate(),
                            issue.getReturnDate(),
                            issue.getStatus()
                    );
                }
            }

            throw new SQLException("Issue ID was not generated.");

        } catch (SQLException e) {
            throw new RuntimeException("Failed to save book issue.", e);
        }
    }

    @Override
    public List<BookIssue> findAll() {
        String sql = "SELECT * FROM book_issue ORDER BY id DESC";
        List<BookIssue> issues = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                issues.add(mapRow(rs));
            }

            return issues;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch book issues.", e);
        }
    }

    @Override
    public Optional<BookIssue> findById(Long id) {
        String sql = "SELECT * FROM book_issue WHERE id = ?";

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
            throw new RuntimeException("Failed to find book issue.", e);
        }
    }

    @Override
    public List<BookIssue> findByUserId(Integer userId) {
        String sql = """
            SELECT * FROM book_issue
            WHERE user_id = ?
            ORDER BY id DESC
            """;

        List<BookIssue> issues = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    issues.add(mapRow(rs));
                }
            }

            return issues;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch member issues.", e);
        }
    }

    @Override
    public List<BookIssue> findByStatus(String status) {
        String sql = """
            SELECT * FROM book_issue
            WHERE status = ?
            ORDER BY id DESC
            """;

        List<BookIssue> issues = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, status);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    issues.add(mapRow(rs));
                }
            }

            return issues;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch issues by status.", e);
        }
    }

    @Override
    public boolean update(BookIssue issue) {
        String sql = """
            UPDATE book_issue
            SET user_id = ?, book_id = ?, issue_date = ?,
                due_date = ?, return_date = ?, status = ?
            WHERE id = ?
            """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, issue.getUser_id());
            ps.setLong(2, issue.getBook_id());
            ps.setDate(3, Date.valueOf(issue.getIssueDate()));
            ps.setDate(4, Date.valueOf(issue.getDueDate()));

            if (issue.getReturnDate() == null) {
                ps.setNull(5, Types.DATE);
            } else {
                ps.setDate(5, Date.valueOf(issue.getReturnDate()));
            }

            ps.setString(6, issue.getStatus());
            ps.setLong(7, issue.getId());

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to update book issue.", e);
        }
    }

    private BookIssue mapRow(ResultSet rs) throws SQLException {
        Date returnDate = rs.getDate("return_date");

        return new BookIssue(
                rs.getLong("id"),
                rs.getInt("user_id"),
                rs.getLong("book_id"),
                rs.getDate("issue_date").toLocalDate(),
                rs.getDate("due_date").toLocalDate(),
                returnDate == null ? null : returnDate.toLocalDate(),
                rs.getString("status")
        );
    }


    @Override
    public BookIssue issueTransactionally(BookIssue issue) {
        String lockSql = """
        SELECT total_copies, available_copies
        FROM books
        WHERE id = ?
        FOR UPDATE
        """;

        String duplicateSql = """
        SELECT id FROM book_issue
        WHERE user_id = ? AND book_id = ? AND status = 'ISSUED'
        LIMIT 1
        """;

        String insertSql = """
        INSERT INTO book_issue
        (user_id, book_id, issue_date, due_date, return_date, status)
        VALUES (?, ?, ?, ?, ?, 'ISSUED')
        """;

        String stockSql = """
        UPDATE books
        SET available_copies = available_copies - 1
        WHERE id = ? AND available_copies > 0
        """;

        try (Connection con = dataSource.getConnection()) {
            con.setAutoCommit(false);

            try {
                // Lock the book row
                try (PreparedStatement ps = con.prepareStatement(lockSql)) {
                    ps.setLong(1, issue.getBook_id());

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new IllegalArgumentException("Book not found.");
                        }

                        if (rs.getInt("available_copies") <= 0) {
                            throw new IllegalStateException(
                                    "No copies available.");
                        }
                    }
                }

                // Prevent duplicate active issue for the same member
                try (PreparedStatement ps = con.prepareStatement(duplicateSql)) {
                    ps.setInt(1, issue.getUser_id());
                    ps.setLong(2, issue.getBook_id());

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            throw new IllegalStateException(
                                    "This member already has this book issued.");
                        }
                    }
                }

                // Insert issue record
                long issueId;

                try (PreparedStatement ps = con.prepareStatement(
                        insertSql, Statement.RETURN_GENERATED_KEYS)) {

                    ps.setInt(1, issue.getUser_id());
                    ps.setLong(2, issue.getBook_id());
                    ps.setDate(3, Date.valueOf(issue.getIssueDate()));
                    ps.setDate(4, Date.valueOf(issue.getDueDate()));
                    ps.setNull(5, Types.DATE);

                    ps.executeUpdate();

                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) {
                            throw new SQLException("Issue ID was not generated.");
                        }
                        issueId = keys.getLong(1);
                    }
                }

                // Decrease available copies
                try (PreparedStatement ps = con.prepareStatement(stockSql)) {
                    ps.setLong(1, issue.getBook_id());

                    if (ps.executeUpdate() != 1) {
                        throw new IllegalStateException(
                                "Could not update book availability.");
                    }
                }

                con.commit();

                return new BookIssue(
                        issueId,
                        issue.getUser_id(),
                        issue.getBook_id(),
                        issue.getIssueDate(),
                        issue.getDueDate(),
                        null,
                        "ISSUED"
                );

            } catch (Exception e) {
                try {
                    con.rollback();
                } catch (SQLException rollbackError) {
                    e.addSuppressed(rollbackError);
                }
                throw e;
            } finally {
                try {
                    con.setAutoCommit(true);
                } catch (SQLException ignored) {
                    // Connection will be closed by try-with-resources.
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to issue book.", e);
        }
    }


    @Override
    public BookIssue returnTransactionally(Long issueId) {
        String lockSql = """
        SELECT id, user_id, book_id, issue_date, due_date,
               return_date, status
        FROM book_issue
        WHERE id = ?
        FOR UPDATE
        """;

        String returnSql = """
        UPDATE book_issue
        SET status = 'RETURNED', return_date = ?
        WHERE id = ? AND status = 'ISSUED'
        """;

        String stockSql = """
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = ? AND available_copies < total_copies
        """;

        try (Connection con = dataSource.getConnection()) {
            con.setAutoCommit(false);

            try {
                BookIssue issue;

                // Lock the issue record
                try (PreparedStatement ps = con.prepareStatement(lockSql)) {
                    ps.setLong(1, issueId);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new IllegalArgumentException(
                                    "Issue record not found.");
                        }

                        Date returned = rs.getDate("return_date");

                        issue = new BookIssue(
                                rs.getLong("id"),
                                rs.getInt("user_id"),
                                rs.getLong("book_id"),
                                rs.getDate("issue_date").toLocalDate(),
                                rs.getDate("due_date").toLocalDate(),
                                returned == null ? null : returned.toLocalDate(),
                                rs.getString("status")
                        );
                    }
                }

                if (!"ISSUED".equals(issue.getStatus())) {
                    throw new IllegalStateException(
                            "This book has already been returned.");
                }

                // Update issue status
                try (PreparedStatement ps = con.prepareStatement(returnSql)) {
                    ps.setDate(1, Date.valueOf(LocalDate.now()));
                    ps.setLong(2, issueId);

                    if (ps.executeUpdate() != 1) {
                        throw new IllegalStateException(
                                "Could not update return record.");
                    }
                }

                // Restore one available copy
                try (PreparedStatement ps = con.prepareStatement(stockSql)) {
                    ps.setLong(1, issue.getBook_id());

                    if (ps.executeUpdate() != 1) {
                        throw new IllegalStateException(
                                "Could not restore book availability.");
                    }
                }

                con.commit();

                return new BookIssue(
                        issue.getId(),
                        issue.getUser_id(),
                        issue.getBook_id(),
                        issue.getIssueDate(),
                        issue.getDueDate(),
                        LocalDate.now(),
                        "RETURNED"
                );

            } catch (Exception e) {
                try {
                    con.rollback();
                } catch (SQLException rollbackError) {
                    e.addSuppressed(rollbackError);
                }
                throw e;
            } finally {
                try {
                    con.setAutoCommit(true);
                } catch (SQLException ignored) {
                    // Connection will be closed by try-with-resources.
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to return book.", e);
        }
    }

}
