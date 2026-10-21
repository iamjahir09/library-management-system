package com.library.dao;

import com.library.model.Book;
import java.util.List;
import java.util.Optional;

public interface BookDao {
    Book save (Book book);
    List<Book> findAll();
    Optional<Book> findById(Long id);
    Optional<Book> findByTitle(String title);
    boolean update(Long id, Book book);
    boolean deleteById(Long id);

}
