/**
 * Client-side utility for interacting with the Admin Backend API (localhost:5000)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5000";

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (response.status === 401) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("admin_token");
        }
    }

    if (!response.ok) {
        const error = new Error(data.message || "Something went wrong with the Admin API");
        (error as any).status = response.status;
        throw error;
    }

    return data;
}

export function setAdminToken(token: string) {
    if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", token);
    }
}

export function logoutAdmin() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
    }
}
