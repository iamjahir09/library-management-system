const API_BASE = "http://localhost:7070";

export async function apiRequest(path, options = {}) {
    const token = sessionStorage.getItem("token");
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const raw = await response.text();
    let data = null;
    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch {
            data = raw;
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.error || data?.message || `Request failed (${response.status})`
        );
    }

    return data;
}

export function formatDate(value) {
    if (!value) return "—";
    const date = String(value).slice(0, 10);
    const parts = date.split("-");
    return parts.length === 3 ? `${parts[2]} ${parts[1]} ${parts[0]}` : date;
}

export function getIssueStatus(issue) {
    if (issue.status === "RETURNED") return "RETURNED";
    if (issue.dueDate && String(issue.dueDate).slice(0, 10) < new Date().toISOString().slice(0, 10)) {
        return "OVERDUE";
    }
    return issue.status || "ISSUED";
}
