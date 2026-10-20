package com.library;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.library.dao.InMemoryUserDao;
import com.library.dao.UserDao;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.SignupRequest;
import com.library.dto.UserResponse;
import com.library.exception.EmailAlreadyExistsException;
import com.library.exception.InvalidCredentialsException;
import com.library.exception.ValidationException;
import com.library.security.JwtService;
import com.library.service.AuthService;
import io.javalin.Javalin;
import io.javalin.http.UnauthorizedResponse;

import java.util.Map;

public class Main {

    public static void main(String[] args) {
        UserDao userDao = new InMemoryUserDao();
        AuthService authService = new AuthService(userDao);
        String secret = System.getenv().getOrDefault("JWT_SECRET", "dev-only-secret-change-me-at-least-32-chars");
        JwtService jwtService = new JwtService(secret);

        Javalin app = Javalin.create(config -> {

            config.routes.get("/", ctx -> ctx.result("Hello World"));

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

        }).start(7070);
    }
}