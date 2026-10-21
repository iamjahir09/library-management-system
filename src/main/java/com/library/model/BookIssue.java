package com.library.model;

import java.time.LocalDate;

public class BookIssue {
    private Long id;
    private int user_id;
    private Long book_id;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;

    public BookIssue(){

    }

    public  BookIssue(Long id, int user_id, Long book_id, LocalDate issueDate, LocalDate dueDate, LocalDate returnDate, String status){
        this.id = id;
        this.user_id = user_id;
        this.book_id = book_id;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public int getUser_id() {
        return user_id;
    }

    public Long getBook_id() {
        return book_id;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public String getStatus() {
        return status;
    }
}
