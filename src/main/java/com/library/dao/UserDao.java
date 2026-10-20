package com.library.dao;
import java.util.*;
import com.library.User;

import java.util.Optional;

public interface UserDao {
    User save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    List<User> findAll();
    Optional<User> update(User user);
    Optional<User> deleteById(int id);
}
