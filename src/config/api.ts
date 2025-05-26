import { upload } from "@testing-library/user-event/dist/upload";
import { get } from "axios";

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://zaloapp-production.up.railway.app/api';

export const API_ENDPOINTS = {
    register: `${API_BASE_URL}/register`,
    registerSendVerification: `${API_BASE_URL}/register/send-verification`,
    registerVerify: `${API_BASE_URL}/register/verify`,
    login: `${API_BASE_URL}/login`,
    profile: `${API_BASE_URL}/profile`,
    getProfileByEmail: (email: string) => `${API_BASE_URL}/profile/${email}`,
    upload: `${API_BASE_URL}/upload`,
    
    forgotPassword: `${API_BASE_URL}/forgot-password`,
    resetPassword: `${API_BASE_URL}/reset-password`,
    uploadAvatar: `${API_BASE_URL}/upload-avatar`,
    updatePassword: `${API_BASE_URL}/update-password`,
    profileweb: `${API_BASE_URL}/profileweb`,

    //add friend
    search: `${API_BASE_URL}/search`,
    sendFriendRequest: `${API_BASE_URL}/friend-request/send`,
    respondFriendRequest: `${API_BASE_URL}/friend-request/respond`,
    withdrawFriendRequest: `${API_BASE_URL}/friend-request/withdraw`,
    getFriendRequests: `${API_BASE_URL}/friend-requests`,
    getFriends: `${API_BASE_URL}/friends`,
    unFriend: `${API_BASE_URL}/friends/unfriend`,

    //send message
    sendMessage: `${API_BASE_URL}/messages/send`,
    getMessages: `${API_BASE_URL}/messages/conversation/`,
    markAsRead: (messageId: string) => `${API_BASE_URL}/messages/read/${messageId}`,
    recall: (messageId: string) => `${API_BASE_URL}/messages/recall/${messageId}`,
    deleteMessage: (messageId: string) => `${API_BASE_URL}/messages/deleteweb/${messageId}`,
    hideMessage: (receiverEmail: string) => `${API_BASE_URL}/messages/hide/${receiverEmail}`,
    deleteMessageBoth: (messageId: string) => `${API_BASE_URL}/messages/deleteboth/${messageId}`,
    forwardMessage: (messageId: string) => `${API_BASE_URL}/messages/${messageId}/forward`,

    reaction : `${API_BASE_URL}/messages/reaction`,
    reactionGroup : (groupId: string, messageId: string) => `${API_BASE_URL}/groups/${groupId}/messages/${messageId}/reactions`,

    //upload file
    uploadFile: `${API_BASE_URL}/files/upload`,
    getFile: (fileName: string) => `${API_BASE_URL}/files/${fileName}`,

    //add group
    createGroup: `${API_BASE_URL}/groups`,
    getGroups: `${API_BASE_URL}/groups`,
    getGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}`,
    updateGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}`,
    updateGroupInfo: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/info`,
    getGroupMembers: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/members`,
    addGroupMembers: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/members`,
    removeGroupMembers: (groupId: string, memberId: string) => `${API_BASE_URL}/groups/${groupId}/members/${memberId}`,
    sendMessageGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/messages`,
    getMessagesGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/messages`,
    addAdmin: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/admins`,
    addAdminWeb: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/adminsweb`,

    addDeputy: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/deputies`,
    removeDeputy: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/deputiesweb`,
    removeAdmin: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/adminsweb`,
    recallGroupMessage: (groupId: string, messageId: string) => `${API_BASE_URL}/groups/${groupId}/messages/${messageId}/recall`,
    deleteGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}`,
    leaveGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/leaveweb`,
    toggleMemberInvite: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/toggle-member-invite`,
    forwardMessageGroup: (groupId: string, messageId: string) => `${API_BASE_URL}/groups/${groupId}/messages/${messageId}/forward`,
    deleteMessageGroup: (groupId: string, messageId: string) => `${API_BASE_URL}/groups/${groupId}/messages/${messageId}/user`,
    hideMessageGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/messages/hide`,
    uploadFileGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/upload`,

}; 