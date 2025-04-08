const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    register: `${API_BASE_URL}/register`,
    login: `${API_BASE_URL}/login`,
    profile: `${API_BASE_URL}/profile`,
    upload: `${API_BASE_URL}/upload`,
    forgotPassword: `${API_BASE_URL}/forgot-password`,
    resetPassword: `${API_BASE_URL}/reset-password`
}; 