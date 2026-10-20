import {useEffect, useState} from "react";

function AdminDashboard(){
    const [totalUsers, settotalUsers] = useState(0)
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
    return(
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {loading ? (
                <p>Loading dashboard...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="dashboard-card">
                    <h2>Total Users</h2>
                    <p>{totalUsers}</p>
                </div>
            )}
        </div>
    )
}
export default AdminDashboard;