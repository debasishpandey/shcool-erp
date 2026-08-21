import api from './api';
import type { Tenant, TenantCreateRequest, TenantUpdateRequest } from '../types';

export const tenantService = {
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get('/tenants');
    return response.data.data;
  },

  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data.data;
  },

  createTenant: async (data: TenantCreateRequest): Promise<Tenant> => {
    const response = await api.post('/tenants', data);
    return response.data.data;
  },

  updateTenant: async (id: number, data: TenantUpdateRequest): Promise<Tenant> => {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data.data;
  },

  updateTenantStatus: async (id: number, active: boolean): Promise<Tenant> => {
    const response = await api.patch(`/tenants/${id}/status?active=${active}`);
    return response.data.data;
  },

  createSchoolAdmin: async (tenantId: number, data: import('../types').SchoolAdminCreateRequest): Promise<import('../types').UserResponse> => {
    const response = await api.post(`/tenants/${tenantId}/admin`, data);
    return response.data.data;
  }
};
