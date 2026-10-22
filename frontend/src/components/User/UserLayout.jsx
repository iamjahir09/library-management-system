
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    BookOpen,
    LibraryBig,
    BookMarked,
    UserRound,
    LogOut,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

import UserQuote from "./UserQuote";
import "./UserQuote.css";
import "./UserLayout.css";

function UserLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("user");

        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            label: "Book Catalogue",
            path: "/user/catalogue",
            icon: <LibraryBig size={19} />,
        },
        {
            label: "My Books",
            path: "/user/my-books",
            icon: <BookMarked size={19} />,
        },
        {
            label: "My Profile",
            path: "/user/profile",
            icon: <UserRound size={19} />,
        },
    ];

    return (
        <div className="user-app">
            {sidebarOpen && (
                <button
                    className="user-sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`user-sidebar ${
                    sidebarOpen ? "user-sidebar-open" : ""
                }`}
            >
                <div className="user-brand">
                    <div className="user-brand-icon">
                        <BookOpen size={30} strokeWidth={1.7} />
                    </div>

                    <h2>THE OLD LIBRARY</h2>
                    <span>MEMBER PORTAL</span>
                </div>

                <div className="user-menu-heading">YOUR LIBRARY</div>

                <nav className="user-navigation">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="user-nav-icon">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="user-sidebar-bottom">
                    <div className="user-sidebar-divider" />

                    <button
                        className="user-logout-button"
                        onClick={logout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>

                    <p>YOUR SPACE. YOUR STORIES.</p>
                </div>
            </aside>

            <div className="user-main">
                <header className="user-topbar">
                    <button
                        className="user-mobile-menu"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle navigation"
                    >
                        {sidebarOpen ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>

                    <div className="user-topbar-title">
                        <span>THE OLD LIBRARY</span>
                        <span className="user-topbar-separator">/</span>
                        <span>MEMBER AREA</span>
                    </div>

                    <button
                        className="user-account-button"
                        onClick={() => navigate("/user/profile")}
                    >
                        <div className="user-avatar">
                            <UserRound size={19} />
                        </div>

                        <div className="user-account-info">
                            <strong>Library Member</strong>
                            <span>MEMBER ACCOUNT</span>
                        </div>

                        <ChevronDown size={16} />
                    </button>
                </header>

                <main className="user-content">
                    <UserQuote />
                    <Outlet />
                </main>

                <footer className="user-footer">
                    <span>THE OLD LIBRARY</span>
                    <span>A little more knowledge, every day.</span>
                </footer>
            </div>
        </div>
    );
}

export default UserLayout;
