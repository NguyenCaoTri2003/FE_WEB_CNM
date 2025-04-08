export interface User {
    email: string;
    username: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ErrorResponse {
    message: string;
} 