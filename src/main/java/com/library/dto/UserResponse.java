
package com.library.dto;

import com.library.Role;
import com.library.User;
import java.time.LocalDateTime;

public class UserResponse {

    private int id;
    private String name;
    private String email;
    private Role role;
    private String created_at;

    public UserResponse(int id, String name, String email,
                        Role role, String created_at) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.created_at = created_at;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getCreated_at() {
        return created_at;
    }

    public static UserResponse from(User user) {
        LocalDateTime createdAt = user.getCreatedAt();

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                createdAt != null ? createdAt.toString() : null
        );
    }
}
