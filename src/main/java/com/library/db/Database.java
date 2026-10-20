
package com.library.db;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

public class Database {

    private static final HikariDataSource dataSource =
            createDataSource();

    private static HikariDataSource createDataSource() {
        HikariConfig config = new HikariConfig();

        String host = System.getenv()
                .getOrDefault("DB_HOST", "localhost");
        String port = System.getenv()
                .getOrDefault("DB_PORT", "3306");
        String database = System.getenv()
                .getOrDefault("DB_NAME", "library_management_system");
        String username = System.getenv()
                .getOrDefault("DB_USER", "root");
        String password = System.getenv("DB_PASSWORD");

        if (password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "Please set the DB_PASSWORD environment variable."
            );
        }

        config.setJdbcUrl(
                "jdbc:mysql://" + host + ":" + port + "/" + database
                        + "?useSSL=false&allowPublicKeyRetrieval=true"
                        + "&serverTimezone=UTC"
        );

        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setPoolName("LibraryConnectionPool");

        return new HikariDataSource(config);
    }

    public static DataSource getDataSource() {
        return dataSource;
    }

    public static void close() {
        dataSource.close();
    }

    public static void testConnection() throws Exception {
        try (var connection = getDataSource().getConnection()) {
            System.out.println("MySQL connected successfully!");

            try (var statement = connection.createStatement();
                 var result = statement.executeQuery("SELECT DATABASE()")) {

                if (result.next()) {
                    System.out.println(
                            "Database: " + result.getString(1)
                    );
                }
            }
        }
    }
}
