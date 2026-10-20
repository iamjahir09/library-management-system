package com.library.exception;

public class InvalidCredentialsException extends LibraryException{
    public InvalidCredentialsException(){
        super("Invalid email or password");
    }
}
