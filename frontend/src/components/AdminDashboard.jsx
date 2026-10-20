import {useEffect, useState} from "react";
import "./AdminDashboard.css";
function AdminDashboard(){
    const [totalUsers, settotalUsers] = useState(0)
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        async function fetchDashboard(){
            try{
                const token = sessionStorage.getItem("token");
                if(!token){
                    throw new Error("Please login first");
                }
                const response = await fetch("http://localhost:7070/admin/dashboard", {
                    method: "GET",
                    headers : {
                        Authorization: `Bearer ${token}`
                    }
                });

                if(!response.ok){
                    throw new Error(`Request failed: ${response.status}`);
                }

                const userResponse = await fetch("http://localhost:7070/admin/users",{
                    headers :  {
                        Authorization: `Bearer ${token}`
                    }
                });
                if(!userResponse.ok){
                    throw new Error(`Users request failed: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                console.log("Users API response:", userData);
                setUsers(
                    Array.isArray(userData)
                        ? userData
                        : Array.isArray(userData.users)
                            ? userData.users
                            : []
                );

                const data = await response.json();
                settotalUsers(data.totalUsers);

            }catch (error) {
                setError(error.message);
                console.error("Dashboard fetch failed:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    },[]);
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="dashboard-card">
                <h2>Total Users</h2>
                <p>{totalUsers}</p>
            </div>

            <div className="users-section">
                <h2>Registered Users</h2>

                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
export default AdminDashboard;