
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    LibraryBig,
    BookUp,
    ClipboardList,
    Users,
    LogOut,
    Menu,
    X,
    BookOpen,
} from "lucide-react";
import { useState } from "react";
import "./AdminLayout.css";

const menuItems = [
    {
        title: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        end: true,
    },
    {
        title: "Manage Books",
        path: "/admin/books",
        icon: LibraryBig,
    },
    {
        title: "Issue / Return",
        path: "/admin/issue-return",
        icon: BookUp,
    },
    {
        title: "Issue Records",
        path: "/admin/issue-records",
        icon: ClipboardList,
    },
    {
        title: "Registered Users",
        path: "/admin/users",
        icon: Users,
    },
];

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = menuItems.find(item => item.path === location.pathname)?.title || "Admin Panel";

    function handleLogout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        navigate("/login", { replace: true });
    }

    return (
        <div className="admin-layout">
            {sidebarOpen && (
                <button
                    className="sidebar-overlay"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <BookOpen size={27} />
                    </div>

                    <div className="brand-text">
                        <h2>LIBRARY</h2>
                        <span>ADMINISTRATION</span>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="sidebar-section-label">MAIN MENU</div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={20} strokeWidth={1.8} />
                                <span>{item.title}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <div className="admin-profile">
                        <div className="profile-avatar">A</div>
                        <div className="profile-info">
                            <strong>Administrator</strong>
                            <span>Library Admin</span>
                        </div>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <button
                        className="mobile-menu-button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={23} />
                    </button>

                    <div className="topbar-heading">
                        <span>LIBRARY MANAGEMENT SYSTEM</span>
                        <h3>{currentPage}</h3>
                    </div>


                </header>

                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
