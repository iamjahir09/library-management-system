package com.library.service;

import com.library.dao.BookDao;
import com.library.model.Book;

import java.util.List;
import java.util.Optional;

public class BookService {
    private final BookDao bookDao;

    public BookService(BookDao bookDao){
        this.bookDao = bookDao;
    }

    public Book addBook(Book book){
        validateBook(book);

        if(book.getTotal_copies() < 1){
            throw new IllegalArgumentException("Total copies must be at least 1");
        }

        if(book.getAvailable_copies() < 0 || book.getTotal_copies() <book.getAvailable_copies()){
            throw new IllegalArgumentException("Available copies must be between 0 and total copies");
        }

        return bookDao.save(book);
    }

    public List<Book> getAllBooks(){
        return bookDao.findAll();
    }

    public Optional<Book> getBookById(Long id){
        if(id == null || id<=0){
            throw new IllegalArgumentException("Invalid book ID");
        }
        return bookDao.findById(id);
    }

    public Optional<Book> getBookByTitle(String title){
        if(title == null || title.isBlank()){
            throw new IllegalArgumentException("Book title cannot be empty");
        }
        return bookDao.findByTitle(title.trim());
    }

    public boolean updateBook(Long id, Book book){
        if(id ==null || id<=0){
            throw new IllegalArgumentException("Invalid book ID");
        }
        validateBook(book);

        if(book.getTotal_copies() < 1){
            throw new IllegalArgumentException("Total copies must be at least 1");
        }

        if(book.getAvailable_copies()<0 || book.getTotal_copies() < book.getAvailable_copies()){
            throw new IllegalArgumentException("Available copies must be between 0 and total copies");
        }

        return bookDao.update(id, book);
    }

    public boolean deleteBook(Long id){
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid book ID");
        }

        return bookDao.deleteById(id);
    }
    private void validateBook(Book book){
        if(book == null){
            throw new IllegalArgumentException("Book cannot be null");
        }

        if(book.getTitle() == null || book.getTitle().isBlank()){
            throw new IllegalArgumentException("Book title is required");
        }

        if(book.getAuthor() == null || book.getAuthor().isBlank()){
            throw new IllegalArgumentException("Book author is required");
        }

        if(book.getIsbn() != null && book.getIsbn().isBlank()){
            throw new IllegalArgumentException("ISBN must be null or a non-empty value");
        }


    }
}
