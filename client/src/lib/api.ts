// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("access_token")

    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        throw new Error("Unauthorized")
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || "Request failed")
    }

    if (response.status === 204) return null as T
    return response.json()
}

const api = {
    get: <T>(url: string) => request<T>(url),
    post: <T>(url: string, data: unknown) =>
        request<T>(url, { method: "POST", body: JSON.stringify(data) }),
    patch: <T>(url: string, data: unknown) =>
        request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
    delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
}

export default api