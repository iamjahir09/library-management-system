package com.library.service;

import com.library.Role;
import com.library.User;
import com.library.dao.UserDao;
import com.library.exception.EmailAlreadyExistsException;
import com.library.exception.ValidationException;
import at.favre.lib.crypto.bcrypt.BCrypt;
public class AuthService {
    private static final String emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private final UserDao userdao;
    public AuthService(UserDao userdao){
        this.userdao = userdao;
    }

    public User signup(String name,String email, String password){

        if(name == null || name.isBlank()){
            throw new ValidationException("Name cannot be empty");
        }

        if(name.length() > 100){
            throw new ValidationException("Name is too long");
        }

        if(email == null || !email.matches(emailRegex)){
            throw new ValidationException("Invalid email format");
        }

        if(password == null || password.length() < 8){
            throw new ValidationException("Password must be at least 8 characters");
        }

        if(userdao.findByEmail(email).isPresent()){
            throw new EmailAlreadyExistsException("Email already registered : "+email);
        }

        String hash = BCrypt.withDefaults().hashToString(12, password.toCharArray());
        User user = new User(name,email,hash, Role.MEMBER);
        return userdao.save(user);
    }
}
