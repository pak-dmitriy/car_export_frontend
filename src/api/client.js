const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    constructor(status, message, fieldErrors) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors || null;
    }
}

export function imageUrl(path) {
    if (!path) return '';
    return path.startsWith('http') ? path : API_URL + path;
}

export async function apiRequest(path, { method = 'GET', body, params } = {}) {
    const url = new URL(API_URL + path);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, value);
            }
        });
    }

    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    const isForm = body instanceof FormData;
    if (body && !isForm) headers['Content-Type'] = 'application/json';

    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch {
        throw new ApiError(0, 'Server is not available');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, data?.message || 'Something went wrong', data?.fieldErrors);
    }
    return data;
}