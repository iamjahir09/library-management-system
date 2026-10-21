
package com.library.dao;

import com.library.model.BookIssue;

import java.util.List;
import java.util.Optional;

public interface BookIssueDao {

    BookIssue save(BookIssue bookIssue);

    List<BookIssue> findAll();

    Optional<BookIssue> findById(Long id);

    List<BookIssue> findByUserId(Integer userId);

    List<BookIssue> findByStatus(String status);

    boolean update(BookIssue bookIssue);
    BookIssue issueTransactionally(BookIssue issue);

    BookIssue returnTransactionally(Long issueId);
}
