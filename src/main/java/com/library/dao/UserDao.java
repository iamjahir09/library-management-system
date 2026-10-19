package com.library.dao;

import com.library.User;

import java.util.Optional;

public interface UserDao {
    User save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);

}
