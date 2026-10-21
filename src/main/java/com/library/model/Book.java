package com.library.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String category;
    private int total_copies;
    private int available_copies;

    public Book(){

    }
    public Book(Long id,String title,String author,String isbn,String category,int total_copies,int available_copies){
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.total_copies = total_copies;
        this.available_copies = available_copies;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getCategory() {
        return category;
    }

    public int getTotal_copies() {
        return total_copies;
    }

    public int getAvailable_copies() {
        return available_copies;
    }
}
