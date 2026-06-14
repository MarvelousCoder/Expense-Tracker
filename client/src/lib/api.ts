// src/lib/api.ts

// NOTE: 1st Update
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// async function request<T>(
//     endpoint: string,
//     options: RequestInit = {}
// ): Promise<T> {
//     const token = localStorage.getItem("access_token")

//     const config: RequestInit = {
//         ...options,
//         headers: {
//             "Content-Type": "application/json",
//             ...(token && { Authorization: `Bearer ${token}` }),
//             ...options.headers,
//         },
//     }

//     const response = await fetch(`${BASE_URL}${endpoint}`, config)

//     if (response.status === 401) {
//         localStorage.removeItem("access_token")
//         localStorage.removeItem("refresh_token")
//         window.location.href = "/login"
//         throw new Error("Unauthorized")
//     }

//     if (!response.ok) {
//         const error = await response.json().catch(() => ({}))
//         throw new Error(error.detail || "Request failed")
//     }

//     if (response.status === 204) return null as T
//     return response.json()
// }

// const api = {
//     get: <T>(url: string) => request<T>(url),
//     post: <T>(url: string, data: unknown) =>
//         request<T>(url, { method: "POST", body: JSON.stringify(data) }),
//     patch: <T>(url: string, data: unknown) =>
//         request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
//     delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
// }

// export default api

// NOTE: 2nd change

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

let isRefreshing = false
let failedQueue: Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token)
    })
    failedQueue = []
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
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

    // Silent token refresh on 401
    if (response.status === 401 && retry) {
        const refreshToken = localStorage.getItem("refresh_token")

        if (!refreshToken) {
            localStorage.removeItem("access_token")
            window.location.href = "/login"
            throw new Error("Unauthorized")
        }

        if (isRefreshing) {
            // Queue this request while refresh is in progress
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then((token) => {
                return request<T>(endpoint, options, false)
            })
        }

        isRefreshing = true

        try {
            const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            if (!refreshResponse.ok) throw new Error("Refresh failed")

            const data = await refreshResponse.json()
            localStorage.setItem("access_token", data.access_token)
            localStorage.setItem("refresh_token", data.refresh_token)

            processQueue(null, data.access_token)
            return request<T>(endpoint, options, false)

        } catch (err) {
            processQueue(err as Error)
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            window.location.href = "/login"
            throw err
        } finally {
            isRefreshing = false
        }
    }

    if (response.status === 204) return null as T
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || error.message || "Request failed")
    }

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