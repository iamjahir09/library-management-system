package com.library.dto;

import com.library.Role;
import com.library.User;

public class UserResponse {
    private int id;
    private String name;
    private String email;
    private Role role;

    public UserResponse(int id, String name, String email, Role role){
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
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

    public static UserResponse from(User user){
         return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
