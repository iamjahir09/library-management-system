
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";

import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import BooksManagement from "./components/books/BooksManagement";
import IssueReturn from "./components/pages/IssueReturn";
import IssueRecords from "./components/pages/IssueRecords";
import RegisteredUsers from "./components/pages/RegisteredUsers";

import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import UserLayout from "./components/User/UserLayout";
import BookCatalogue from "./components/User/BookCatalogue";
import MyBooks from "./components/User/MyBooks";
import MyProfile from "./components/User/MyProfile";

function ProtectedAdminRoute() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "ADMIN") {
        return <Navigate to={role === "USER" ? "/user" : "/login"} replace />;
    }

    return <Outlet />;
}
function ProtectedUserRoute() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role" || "").trim().toUpperCase();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "MEMBER") {
        return <Navigate to={role === "ADMIN" ? "/admin" : "/login"} replace />;
    }

    return <Outlet />;
}
function PublicRoute() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token && role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    if (token && role === "MEMBER") {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
                <Route element={<ProtectedAdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="books" element={<BooksManagement />} />
                        <Route path="issue-return" element={<IssueReturn />} />
                        <Route path="issue-records" element={<IssueRecords />} />
                        <Route path="users" element={<RegisteredUsers />} />
                    </Route>
                </Route>
                <Route element={<ProtectedUserRoute />}>
                    <Route path="/user" element={<UserLayout />}>
                        <Route index element={<Navigate to="catalogue" replace />} />
                        <Route path="catalogue" element={<BookCatalogue />} />
                        <Route path="my-books" element={<MyBooks />} />
                        <Route path="profile" element={<MyProfile />} />
                    </Route>
                </Route>
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
