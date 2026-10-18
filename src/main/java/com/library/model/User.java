package com.library.model;

import java.time.LocalDateTime;

public class User {
    private int id;
    private String name;
    private String email;
    private String passwordHash;
    private Role role;
    private LocalDateTime createdAt;


    public User(String name, String email, String passwordHash, Role role){
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public User(int id, String name, String email, String passwordHash, Role role, LocalDateTime createdAt){
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "User{id=" + id +
                ", name=" + name +
                ", email=" + email +
                ", role=" + role +
                ", createdAt=" + createdAt + "}";
    }
}
