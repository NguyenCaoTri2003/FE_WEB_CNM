import { get } from "axios";

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

    //add friend
    search: `${API_BASE_URL}/search`,
    sendFriendRequest: `${API_BASE_URL}/friend-request/send`,
    responđFriendRequest: `${API_BASE_URL}/friend-request/respond`,
    withdrawFriendRequest: `${API_BASE_URL}/friend-request/withdraw`,
    friendRequest: `${API_BASE_URL}/friend-requests`,
    getFriends: `${API_BASE_URL}/friends`,

    //send message
    sendMessage: `${API_BASE_URL}/messages/send`,
    getMessages: `${API_BASE_URL}/messages/conversation/`,
    markAsRead: (messageId: string) => `${API_BASE_URL}/messages/read/${messageId}`,
    recall: (messageId: string) => `${API_BASE_URL}/messages/recall/${messageId}`,
    deleteMessage: (messageId: string) => `${API_BASE_URL}/messages/delete/${messageId}`,

    //upload file
    uploadFile: `${API_BASE_URL}/files/upload`,
    getFile: (fileName: string) => `${API_BASE_URL}/files/${fileName}`,

}; 