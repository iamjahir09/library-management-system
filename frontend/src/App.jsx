import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";
import ManageBooks from "./components/books/ManageBooks";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import BooksManagement from "./components/books/BooksManagement";
import IssueReturn from "./components/pages/IssueReturn";
import IssueRecords from "./components/pages/IssueRecords";
import RegisteredUsers from "./components/pages/RegisteredUsers";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function ProtectedAdminRoute() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) return <Navigate to="/login" replace />;
    if (role && role !== "ADMIN") return <Navigate to="/" replace />;

    return <Outlet />;
}

function PublicRoute() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token) return <Navigate to={role === "ADMIN" ? "/admin" : "/login"} replace />;
    return <Outlet />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />

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
                        <Route path="books" element={<ManageBooks />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
