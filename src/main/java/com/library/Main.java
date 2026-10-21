package com.library;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.library.dao.*;
import com.library.db.Database;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.SignupRequest;
import com.library.dto.UserResponse;
import com.library.exception.EmailAlreadyExistsException;
import com.library.exception.InvalidCredentialsException;
import com.library.exception.ValidationException;
import com.library.security.JwtService;
import com.library.service.AuthService;
import com.library.service.BookService;
import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.HttpStatus;
import io.javalin.http.UnauthorizedResponse;
import com.library.dao.BookDao;
import com.library.dao.MySqlBookDao;
import com.library.model.Book;
import com.library.service.BookService;
import java.util.Map;

public class Main {

    public static void main(String[] args) throws Exception {
        Database.testConnection();
        var dataSource = Database.getDataSource();
        UserDao userDao = new MySqlUserDao(dataSource);
        AuthService authService = new AuthService(userDao);
        String secret = System.getenv().getOrDefault("JWT_SECRET", "dev-only-secret-change-me-at-least-32-chars");
        JwtService jwtService = new JwtService(secret);
        BookDao bookDao = new MySqlBookDao(dataSource);
        BookService bookService = new BookService(bookDao);

        if (userDao.findByEmail("admin@library.local").isEmpty()) {
            authService.admin(
                    "Library Admin",
                    "admin@library.local",
                    "Admin@12345"
            );
        }

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.allowHost("http://localhost:5173");
                    it.allowCredentials = false;
                });
            });
            config.routes.get("/", ctx -> ctx.result("Hello World"));

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

            config.routes.post("/signup", ctx -> {
                SignupRequest req = ctx.bodyAsClass(SignupRequest.class);
                User user = authService.signup(req.getName(), req.getEmail(), req.getPassword());
                ctx.status(201);
                ctx.json(UserResponse.from(user));
            });

            config.routes.post("/login", ctx -> {
                LoginRequest req = ctx.bodyAsClass(LoginRequest.class);
                User user = authService.login(req.getEmail(), req.getPassword());
                String token = jwtService.generateToken(user);
                ctx.json(new LoginResponse(token, UserResponse.from(user)));
            });

            config.routes.before("/admin/*", ctx->{
                if ("OPTIONS".equalsIgnoreCase(ctx.method().name())) {
                    return;
                }
                String header = ctx.header("Authorization");

                if(header == null || !header.startsWith("Bearer ")){
                    throw new UnauthorizedResponse("Missing or invalid Authorization header");
                }

                String token = header.substring(7);
                try{
                    DecodedJWT jwt = jwtService.verifyToken(token);
                    String role = jwt.getClaim("role").asString();
                    if (!"ADMIN".equals(role)) {
                        throw new ForbiddenResponse(
                                "Admin access required"
                        );
                    }
                    ctx.attribute("userId", jwt.getSubject());
                    ctx.attribute("role", role);
                }catch (JWTVerificationException e) {
                    throw new UnauthorizedResponse(
                            "Invalid or expired token"
                    );
                }
            });

            config.routes.before("/me", ctx -> {
                String header = ctx.header("Authorization");
                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedResponse("Missing or invalid Authorization header");
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

            config.routes.get("/me", ctx -> {
                String userId = ctx.attribute("userId");
                String role = ctx.attribute("role");
                ctx.json(Map.of("id", userId, "role", role));
            });

            config.routes.get("/admin/users", ctx->{
                var users = userDao.findAll().stream().map(UserResponse::from).toList();
                ctx.json(users);
            });

            config.routes.get("/admin/dashboard",ctx -> {
                int totalUsers = userDao.findAll().size();

                ctx.json(Map.of("totalUsers",totalUsers));
            });

            config.routes.get("/books",ctx -> {
                ctx.json(bookService.getAllBooks());
            });

            config.routes.get("/books/{id}",ctx -> {
                try{
                    long id = Long.parseLong(ctx.pathParam("id"));

                    var books = bookService.getBookById(id);
                    if(books.isPresent()){
                        ctx.json(books.get());
                    }else{
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error", "Book not found"));
                    }
                }catch (NumberFormatException e){
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }
            });

            config.routes.post("/admin/books",ctx -> {
                Book book = ctx.bodyAsClass(Book.class);
                Book saveBook = bookService.addBook(book);

                ctx.status(HttpStatus.CREATED);
                ctx.json(saveBook);
            });

            config.routes.delete("admin/books/{id}", ctx -> {
                try{
                    long id = Long.parseLong(ctx.pathParam("id"));
                    boolean deleted = bookService.deleteBook(id);

                    if(deleted){
                        ctx.status(HttpStatus.OK);
                        ctx.json(Map.of("message", "Book deleted successfully"));
                    }
                    else{
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error", "Book not found"));
                    }
                }catch(NumberFormatException e){
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }
            });

            config.routes.put("admin/books/{id}", ctx -> {
                try{
                    long id = Long.parseLong(ctx.pathParam("id"));
                    Book book = ctx.bodyAsClass(Book.class);

                    boolean updated = bookService.updateBook(id,book);

                    if(updated){
                        ctx.status(HttpStatus.OK);
                        ctx.json(Map.of("message", "Book updated successfully"));
                    }
                    else{
                        ctx.status(HttpStatus.NOT_FOUND);
                        ctx.json(Map.of("error","Book not found"));
                    }
                } catch (NumberFormatException e) {
                    ctx.status(HttpStatus.BAD_REQUEST);
                    ctx.json(Map.of("error", "Invalid book ID"));
                }

            });


        }).start(7070);
    }
}