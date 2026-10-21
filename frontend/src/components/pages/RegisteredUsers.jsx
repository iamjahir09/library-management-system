import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Users } from "lucide-react";
import { apiRequest, formatDate } from "../../api";
import "./RegisteredUsers.css";

function RegisteredUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiRequest("/admin/users");
            setUsers(Array.isArray(data) ? data : data?.users || []);
        } catch (err) {
            setError(err.message || "Could not load registered users.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter(user =>
            [user.name, user.email, user.role, user.id]
                .some(value => String(value ?? "").toLowerCase().includes(term))
        );
    }, [users, search]);

    return (
        <section className="users-page">
            <div className="page-heading-row">
                <div>
                    <p className="page-eyebrow">MEMBER DIRECTORY</p>
                    <h1>Registered Users</h1>
                    <p className="users-subtitle">Browse accounts registered with your library.</p>
                </div>
                <button className="page-refresh-btn" onClick={loadUsers} disabled={loading}><RefreshCw size={15}/> Refresh</button>
            </div>

            <div className="users-summary">
                <span className="users-summary-icon"><Users size={21}/></span>
                <div><span>Total registered accounts</span><strong>{users.length}</strong></div>
            </div>

            {error && <div className="page-alert page-alert-error" role="alert">{error}</div>}

            <div className="users-topbar">
                <label className="users-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or role…"/></label>
            </div>

            <section className="users-table-panel">
                {loading ? <p className="page-empty">Loading registered users…</p> : filteredUsers.length === 0 ? <p className="page-empty">No matching users found.</p> : (
                    <div className="users-table-wrap">
                        <table className="users-table">
                            <thead><tr><th>ID</th><th>Member</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
                            <tbody>{filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td><div className="user-name-cell"><span className="user-avatar">{(user.name || user.email || "U").charAt(0).toUpperCase()}</span><strong>{user.name || "Unnamed user"}</strong></div></td>
                                    <td>{user.email || "—"}</td>
                                    <td><span className={`role-badge ${(user.role || "").toLowerCase()}`}>{user.role || "MEMBER"}</span></td>
                                    <td>{formatDate(user.createdAt || user.created_at)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
                <div className="users-footer"><span>Showing {filteredUsers.length} of {users.length} users</span><span>Library member directory</span></div>
            </section>
        </section>
    );
}

export default RegisteredUsers;
