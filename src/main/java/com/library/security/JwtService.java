package com.library.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.library.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class JwtService {
    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public JwtService(String secret) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm).build();
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return JWT.create()
                .withSubject(String.valueOf(user.getId()))
                .withClaim("role", user.getRole().name())
                .withIssuedAt(now)
                .withExpiresAt(now.plus(1, ChronoUnit.DAYS))
                .sign(algorithm);
    }

    public DecodedJWT verifyToken(String token) {
        return verifier.verify(token);
    }
}