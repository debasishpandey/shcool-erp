import api from './api';
import type { StudentResponse, StudentCreateRequest, StudentUpdateRequest } from '../types';

export const studentService = {
  getAllStudents: async (): Promise<StudentResponse[]> => {
    const response = await api.get('/students');
    return response.data.data; // Assuming backend wraps in standard format: { status, message, data }
  },

  getStudentById: async (id: number): Promise<StudentResponse> => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },

  createStudent: async (data: StudentCreateRequest): Promise<StudentResponse> => {
    const response = await api.post('/students', data);
    return response.data.data;
  },

  updateStudent: async (id: number, data: StudentUpdateRequest): Promise<StudentResponse> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data.data;
  },

  deactivateStudent: async (id: number): Promise<void> => {
    await api.patch(`/students/${id}/deactivate`);
  }
};
