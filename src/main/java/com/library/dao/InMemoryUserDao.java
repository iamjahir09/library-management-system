package com.library.dao;

import com.library.User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class InMemoryUserDao implements UserDao{
    private Map<Integer, User> users = new HashMap<>();
    private int nextId = 1;
    @Override
    public User save(User user){
        user.setId(nextId);
        users.put(user.getId(), user);
        nextId++;
        return user;
    }

    @Override
    public Optional<User> findByEmail(String email){
        for(User user : users.values()){
            if(user.getEmail().equalsIgnoreCase(email)){
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> findById(int id){
        return Optional.ofNullable(users.get(id));
    }
}
