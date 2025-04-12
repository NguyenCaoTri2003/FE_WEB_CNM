const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    register: `${API_BASE_URL}/register`,
    registerSendVerification: `${API_BASE_URL}/register/send-verification`,
    registerVerify: `${API_BASE_URL}/register/verify`,
    login: `${API_BASE_URL}/login`,
    profile: `${API_BASE_URL}/profile`,
    upload: `${API_BASE_URL}/upload`,
    
    forgotPassword: `${API_BASE_URL}/forgot-password`,
    resetPassword: `${API_BASE_URL}/reset-password`,
    uploadAvatar: `${API_BASE_URL}/upload-avatar`,
    updatePassword: `${API_BASE_URL}/update-password`,
    profileweb: `${API_BASE_URL}/profileweb`,

}; 