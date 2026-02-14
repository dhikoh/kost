import { fetchApi } from './api';

export const updateUserService = async (data: { fullName?: string; phone?: string; password?: string }) => {
    return fetchApi('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const updateTenantService = async (data: { name?: string; address?: string; phone?: string; description?: string }) => {
    return fetchApi('/tenants/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};
