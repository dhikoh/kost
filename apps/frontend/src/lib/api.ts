export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Wrapper for fetch with auto-refresh token support (simplified for now)
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const headers = {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
        'Content-Type': 'application/json',
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        // Simple logout for now if 401
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
    }

    return res;
}
