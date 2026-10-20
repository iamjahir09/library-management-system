
package com.library.dao;

import com.library.Role;
import com.library.User;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MySqlUserDao implements UserDao {

    private final DataSource dataSource;

    public MySqlUserDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 1. Save user
    @Override
    public User save(User user) {
        String sql = """
                INSERT INTO users (name, email, password_hash, role)
                VALUES (?, ?, ?, ?)
                """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getRole().name());

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setId(keys.getInt(1));
                } else {
                    throw new SQLException("User ID was not generated");
                }
            }

            return user;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to save user", e);
        }
    }

    // 2. Find user by email
    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to find user by email", e);
        }
    }

    // 3. Find user by ID
    @Override
    public Optional<User> findById(int id) {
        String sql = "SELECT * FROM users WHERE id = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to find user by ID", e);
        }
    }

    // 4. Find all users
    @Override
    public List<User> findAll() {
        String sql = "SELECT * FROM users ORDER BY id";
        List<User> users = new ArrayList<>();

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                users.add(mapRow(rs));
            }

            return users;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to retrieve users", e);
        }
    }

    // 5. Update user
    @Override
    public Optional<User> update(User user) {
        String sql = """
                UPDATE users
                SET name = ?, email = ?, password_hash = ?, role = ?
                WHERE id = ?
                """;

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getRole().name());
            ps.setInt(5, user.getId());

            int rowsUpdated = ps.executeUpdate();

            if (rowsUpdated > 0) {
                return findById(user.getId());
            }

            return Optional.empty();

        } catch (SQLException e) {
            throw new RuntimeException("Failed to update user", e);
        }
    }

    // 6. Delete user by ID
    @Override
    public Optional<User> deleteById(int id) {
        Optional<User> existingUser = findById(id);

        if (existingUser.isEmpty()) {
            return Optional.empty();
        }

        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rowsDeleted = ps.executeUpdate();

            if (rowsDeleted > 0) {
                return existingUser;
            }

            return Optional.empty();

        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete user", e);
        }
    }

    // Convert database row to User object
    private User mapRow(ResultSet rs) throws SQLException {
        Timestamp timestamp = rs.getTimestamp("created_at");

        LocalDateTime createdAt = timestamp != null
                ? timestamp.toLocalDateTime()
                : LocalDateTime.now();

        return new User(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password_hash"),
                Role.valueOf(rs.getString("role")),
                createdAt
        );
    }
}
