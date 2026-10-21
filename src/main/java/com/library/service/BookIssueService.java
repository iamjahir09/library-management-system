package com.library.service;

import com.library.User;
import com.library.dao.BookDao;
import com.library.dao.BookIssueDao;
import com.library.dao.UserDao;
import com.library.model.Book;
import com.library.model.BookIssue;

import java.time.LocalDate;
import java.util.List;

public class BookIssueService {
    private final BookIssueDao bookIssueDao;
    private final BookDao bookDao;
    private final UserDao userDao;
    public BookIssueService(BookIssueDao bookIssueDao, BookDao bookDao, UserDao userDao){
        this.bookIssueDao = bookIssueDao;
        this.bookDao = bookDao;
        this.userDao = userDao;
    }

    public BookIssue bookIssue(String email, Long bookId, LocalDate dueDate) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("User email is required.");
        }

        if (bookId == null || bookId <= 0) {
            throw new IllegalArgumentException("Valid book ID is required.");
        }

        User user = userDao.findByEmail(email.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        LocalDate today = LocalDate.now();

        if (dueDate == null || dueDate.isBefore(today)) {
            throw new IllegalArgumentException(
                    "Due date cannot be before today.");
        }

        Book book = bookDao.findById(bookId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Book not found."));

        // Check whether this user already has this book issued.
        List<BookIssue> userIssues =
                bookIssueDao.findByUserId(user.getId());

        boolean alreadyIssued = userIssues.stream()
                .anyMatch(issue ->
                        issue.getBook_id().equals(bookId)
                                && "ISSUED".equals(issue.getStatus()));

        if (alreadyIssued) {
            throw new IllegalStateException(
                    "This user already has this book issued.");
        }

        BookIssue issue = new BookIssue(
                null,
                user.getId(),
                bookId,
                today,
                dueDate,
                null,
                "ISSUED"
        );

        // Record insertion and stock decrement happen in one transaction.
        return bookIssueDao.issueTransactionally(issue);
    }

    public BookIssue returnBook(Long issueId) {

        if (issueId == null || issueId <= 0) {
            throw new IllegalArgumentException(
                    "Valid issue ID is required.");
        }

        // Return record update and stock increment happen in one transaction.
        return bookIssueDao.returnTransactionally(issueId);
    }

    public List<BookIssue> getAllIssues(){
        return bookIssueDao.findAll();
    }

    public List<BookIssue>getIssueByEmail(String email){
        User user = userDao.findByEmail(email.trim()).orElseThrow(()-> new IllegalArgumentException("User not found."));
        return bookIssueDao.findByUserId(user.getId());
    }
}
