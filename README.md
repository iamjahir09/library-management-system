# Library Management System

A full-stack Library Management System built to simplify book catalogue
management, member registration, and book issue/return operations. It
provides separate experiences for administrators and members, using a
React frontend and a Java backend.

## Features

### Authentication and Access Control

-   Member registration and login.
-   Administrator login.
-   Role-based navigation for administrators and members.
-   Protected frontend routes and authorization for administrative
    backend endpoints.

### Administrator

-   View dashboard statistics.
-   Add, update, and delete books.
-   View registered members.
-   Issue books to members and process returns.
-   View book issue records.
-   Refresh dashboard data.

### Member

-   Browse the book catalogue.
-   Search and filter books.
-   Borrow books through the member interface.
-   Access personal book-related and profile pages.

### User Interface

-   React-based interface with separate administrator and member
    layouts.
-   Library-inspired styling.
-   Responsive navigation and page layouts.

## Technology Stack

  Layer               Technologies
  ------------------- --------------------------------
  Frontend            React, Vite, React Router, CSS
  Backend             Java, Javalin
  Database            MySQL
  API communication   HTTP APIs
  Icons               Lucide React

> This project uses Java + Javalin and does not require Spring Boot.

## Project Structure

The exact folder names may vary slightly depending on your local project
layout.

``` text
library-management-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
└── backend/
    ├── src/
    │   └── ...
    └── ...
```

-   **Frontend:** React pages, navigation, forms, dashboard, and
    catalogue interface.
-   **Backend:** Java application, API routes, authentication, services,
    and data-access logic.
-   **Database:** Stores book, user, and issue/return records.

## Prerequisites

Install the following before running the project:

-   Java Development Kit (JDK) compatible with the backend project.
-   Node.js and npm.
-   MySQL Server.
-   Git (optional, for cloning and version control).

## Getting Started

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd library-management-system
```

Replace `<YOUR_REPOSITORY_URL>` with your GitHub repository URL.

### 2. Configure the database

1.  Start MySQL.
2.  Create a database for the project.
3.  Update the backend database configuration with your local MySQL
    host, port, database name, username, and password.
4.  Ensure the required tables are created using the SQL scripts or
    database initialization code included in the backend project.

Do not commit database passwords, API keys, or other secrets to GitHub.

### 3. Run the backend

Open the backend project in your IDE and run its main application class
(`Main.java`).

The current development setup uses port **7070** for the Java API. If
your local configuration differs, use the configured port in the
frontend API settings as well.

### 4. Run the frontend

Open a terminal in the frontend directory:

``` bash
npm install
npm run dev
```

Vite typically serves the development frontend at
`http://localhost:5173`.

### 5. Open the application

Open the local URL printed by Vite in your browser. Make sure MySQL and
the Java backend are running before testing API-dependent features.

## Main API Areas

The backend includes endpoints for the following operations. Refer to
the Java route configuration for exact request formats, HTTP methods,
and authentication requirements.

  Area                   Purpose
  ---------------------- ----------------------------------------------
  `/books`               Retrieve the book catalogue
  `/admin/users`         Retrieve registered users for administrators
  `/admin/dashboard`     Retrieve dashboard data
  `/admin/books`         Create and manage books
  `/admin/book-issues`   Manage and view book issue records
  `/member/...`          Member book-related operations

Administrative endpoints require valid administrator authorization.
Check the backend source for the complete route list and supported HTTP
methods.

## Testing Checklist

The following workflows have been manually tested in the development
environment:

-   [x] Administrator login and logout.
-   [x] Member registration and login.
-   [x] Add, update, and delete books as an administrator.
-   [x] View books in the member catalogue.
-   [x] Issue and return books.
-   [x] Confirm available-copy counts update after a return.
-   [x] Refresh dashboard statistics.
-   [x] Confirm protected routes cannot be accessed after logout.
-   [x] Verify unauthorized access to protected administrative endpoints
    is rejected.

## Security Notes

-   Keep credentials and secrets out of source control.
-   Use strong, unique passwords for database accounts.
-   Review authorization checks for every protected backend endpoint.
-   For production deployment, configure environment-specific settings,
    HTTPS, secure token handling, and appropriate CORS origins.
-   Change any development-only default credentials before exposing the
    application beyond a local environment.

## Future Improvements

Potential enhancements include automated tests, deployment
configuration, overdue notifications, fine calculation, and reporting
exports.

## Author

**Jahir Shaikh**

------------------------------------------------------------------------

If you encounter setup issues, verify that MySQL is running, the backend
database configuration is correct, and the frontend is calling the
correct backend URL.
