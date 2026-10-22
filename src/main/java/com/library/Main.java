
package com.library;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.library.dao.*;
import com.library.db.Database;
import com.library.dto.*;
import com.library.exception.EmailAlreadyExistsException;
import com.library.exception.InvalidCredentialsException;
import com.library.exception.ValidationException;
import com.library.model.Book;
import com.library.model.BookIssue;
import com.library.security.JwtService;
import com.library.service.AuthService;
import com.library.service.BookIssueService;
import com.library.service.BookService;
import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.HttpStatus;
import io.javalin.http.UnauthorizedResponse;

import java.util.Map;

public class Main {

    public static void main(String[] args) throws Exception {

        Database.testConnection();

        var dataSource = Database.getDataSource();

        UserDao userDao = new MySqlUserDao(dataSource);
        AuthService authService = new AuthService(userDao);

        String secret = System.getenv().getOrDefault(
                "JWT_SECRET",
                "dev-only-secret-change-me-at-least-32-chars"
        );

        JwtService jwtService = new JwtService(secret);

        BookDao bookDao = new MySqlBookDao(dataSource);
        BookService bookService = new BookService(bookDao);

        BookIssueDao bookIssueDao = new MySqlBookIssueDao(dataSource);
        BookIssueService bookIssueService =
                new BookIssueService(bookIssueDao, bookDao, userDao);

        // Create default admin if one does not exist
        if (userDao.findByEmail("admin@library.local").isEmpty()) {
            authService.admin(
                    "Library Admin",
                    "admin@library.local",
                    "Admin@12345"
            );
        }

        Javalin app = Javalin.create(config -> {

            // CORS configuration
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.allowHost("http://localhost:5173");
                    it.allowCredentials = false;
                });
            });

            // Home
            config.routes.get("/", ctx ->
                    ctx.result("Hello World")
            );

            // Exception handlers
            config.routes.exception(ValidationException.class, (e, ctx) -> {
                ctx.status(400);
                ctx.json(Map.of("error", e.getMessage()));
            });

            config.routes.exception(EmailAlreadyExistsException.class, (e, ctx) -> {
                ctx.status(409);
                ctx.json(Map.of("error", e.getMessage()));
            });

            config.routes.exception(InvalidCredentialsException.class, (e, ctx) -> {
                ctx.status(401);
                ctx.json(Map.of("error", e.getMessage()));
            });

            // Signup
            config.routes.post("/signup", ctx -> {
                SignupRequest req = ctx.bodyAsClass(SignupRequest.class);

                User user = authService.signup(
                        req.getName(),
                        req.getEmail(),
                        req.getPassword()
                );

                ctx.status(201);
                ctx.json(UserResponse.from(user));
            });

            // Login
            config.routes.post("/login", ctx -> {
                LoginRequest req = ctx.bodyAsClass(LoginRequest.class);

                User user = authService.login(
                        req.getEmail(),
                        req.getPassword()
                );

                String token = jwtService.generateToken(user);

                ctx.json(new LoginResponse(
                        token,
                        UserResponse.from(user)
                ));
            });

            // Admin authentication
            config.routes.before("/admin/*", ctx -> {

                if ("OPTIONS".equalsIgnoreCase(ctx.method().name())) {
                    return;
                }

                String header = ctx.header("Authorization");

                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedResponse(
                            "Missing or invalid Authorization header"
                    );
                }

                String token = header.substring(7);

                try {
                    DecodedJWT jwt = jwtService.verifyToken(token);
                    String role = jwt.getClaim("role").asString();

                    if (!"ADMIN".equals(role)) {
                        throw new ForbiddenResponse("Admin access required");
                    }

                    ctx.attribute("userId", jwt.getSubject());
                    ctx.attribute("role", role);

                } catch (JWTVerificationException e) {
                    throw new UnauthorizedResponse("Invalid or expired token");
                }
            });

            // Authentication for /me
            config.routes.before("/me", ctx -> {

                String header = ctx.header("Authorization");

                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedResponse(
                            "Missing or invalid Authorization header"
                    );
                }

                String token = header.substring(7);

                try {
                    DecodedJWT jwt = jwtService.verifyToken(token);

                    ctx.attribute("userId", jwt.getSubject());
                    ctx.attribute("role", jwt.getClaim("role").asString());

                } catch (JWTVerificationException e) {
                    throw new UnauthorizedResponse("Invalid or expired token");
                }
            });

            // Current user
            config.routes.get("/me", ctx -> {
                String userId = ctx.attribute("userId");
                String role = ctx.attribute("role");

                ctx.json(Map.of(
                        "id", userId,
                        "role", role
                ));
            });

            // Admin users
            config.routes.get("/admin/users", ctx -> {
                var users = userDao.findAll()
                        .stream()
                        .map(UserResponse::from)
                        .toList();

                ctx.json(users);
            });

            // Admin dashboard
            config.routes.get("/admin/dashboard", ctx -> {
                int totalUsers = userDao.findAll().size();
                ctx.json(Map.of("totalUsers", totalUsers));
            });

            // All books
            config.routes.get("/books", ctx ->
                    ctx.json(bookService.getAllBooks())
            );

            // Book by ID
            config.routes.get("/books/{id}", ctx -> {
                try {
                    long id = Long.parseLong(ctx.pathParam("id"));

                    var book = bookService.getBookById(id);

                    if (book.isPresent()) {
                        ctx.json(book.get());
                    } else {
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error", "Book not found"));
                    }

                } catch (NumberFormatException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }
            });

            // Add book
            config.routes.post("/admin/books", ctx -> {
                Book book = ctx.bodyAsClass(Book.class);
                Book savedBook = bookService.addBook(book);

                ctx.status(HttpStatus.CREATED);
                ctx.json(savedBook);
            });

            // Delete book
            config.routes.delete("/admin/books/{id}", ctx -> {
                try {
                    long id = Long.parseLong(ctx.pathParam("id"));
                    boolean deleted = bookService.deleteBook(id);

                    if (deleted) {
                        ctx.status(HttpStatus.OK);
                        ctx.json(Map.of("message", "Book deleted successfully"));
                    } else {
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error", "Book not found"));
                    }

                } catch (NumberFormatException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }
            });

            // Update book
            config.routes.put("/admin/books/{id}", ctx -> {
                try {
                    long id = Long.parseLong(ctx.pathParam("id"));
                    Book book = ctx.bodyAsClass(Book.class);

                    boolean updated = bookService.updateBook(id, book);

                    if (updated) {
                        ctx.status(HttpStatus.OK);
                        ctx.json(Map.of("message", "Book updated successfully"));
                    } else {
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error", "Book not found"));
                    }

                } catch (NumberFormatException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }
            });

            // Issue book
            config.routes.post("/admin/book-issues", ctx -> {
                try {
                    IssueBookRequest req = ctx.bodyAsClass(IssueBookRequest.class);

                    BookIssue issue = bookIssueService.bookIssue(
                            req.getEmail(),
                            req.getBookId(),
                            req.getDueDate()
                    );

                    ctx.status(HttpStatus.CREATED);
                    ctx.json(issue);

                } catch (IllegalArgumentException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", e.getMessage()));

                } catch (IllegalStateException e) {
                    ctx.status(HttpStatus.CONFLICT);
                    ctx.json(Map.of("error", e.getMessage()));
                }
            });

            // Return book
            config.routes.post("/admin/book-issues/{id}/return", ctx -> {
                try {
                    long issueId = Long.parseLong(ctx.pathParam("id"));
                    BookIssue issue = bookIssueService.returnBook(issueId);

                    ctx.status(HttpStatus.OK);
                    ctx.json(issue);

                } catch (NumberFormatException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid issue id"));

                } catch (IllegalArgumentException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", e.getMessage()));

                } catch (IllegalStateException e) {
                    ctx.status(HttpStatus.CONFLICT);
                    ctx.json(Map.of("error", e.getMessage()));
                }
            });

            // All book issues
            config.routes.get("/admin/book-issues", ctx ->
                    ctx.json(bookIssueService.getAllIssues())
            );

            // Book issues by user email
            config.routes.get("/admin/book-issues/user", ctx -> {
                try {
                    String email = ctx.queryParam("email");
                    ctx.json(bookIssueService.getIssueByEmail(email));

                } catch (IllegalArgumentException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", e.getMessage()));
                }
            });

        }).start(7070);
    }
}
