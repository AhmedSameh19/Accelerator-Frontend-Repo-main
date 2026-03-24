// @ts-ignore
import Cookies from 'js-cookie';
import { GetTokenResponse } from './auth-types';
import axios, { AxiosResponse } from 'axios';
// @ts-ignore
import { getFriendlyErrorMessage } from '../../utils/errorHandler';
import { CRM_ACCESS_TOKEN_KEY,PERSONID,USEREMAIL,USERLC,TOKEN_EXPIRY_KEY,REFRESH_TOKEN_KEY , USERNAME,USERROLE} from '../../utils/tokenKeys';

const AUTH_CLIENT_ID = '0Bwg6JeTDUb6h0O9SHNkOwepr3W34gcwVjj_VsLr9vs';
const AUTH_CLIENT_SECRET = 'Phri0eCQcwTjnnkji4wFLUJhSQ6qbJwTsqWc6tFCL7M';
const AUTH_REDIRECT_URI = process.env.REACT_APP_AUTH_REDIRECT_URI as string;
const GIS_AUTH_ENDPOINT = process.env.REACT_APP_GIS_AUTH_ENDPOINT as string;
const normalizeBaseUrl = (input?: string) => {
    if (!input) return '';
    return input.endsWith('/') ? input.slice(0, -1) : input;
};
const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE)
    || normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL)
    || 'https://api-accelerator.aiesec.org.eg';
const AIESEC_API_URL = process.env.REACT_APP_AIESEC_API_URL as string;
const CLIENT_ID = '0Bwg6JeTDUb6h0O9SHNkOwepr3W34gcwVjj_VsLr9vs';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI as string;

export const getLoginUrl = (): string => {
    return `${AIESEC_API_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
};

export const isLoggedIn = async (): Promise<boolean> => {
    try {
        const response = await axios.get('/api/auth/check');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        const { token, user } = response.data || {};

        // IMPORTANT: Save only the JWT token string, not the whole response object
        if (token) {
            const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';
            Cookies.set(CRM_ACCESS_TOKEN_KEY, token, {
                sameSite: 'Lax',
                secure: isSecureContext,
                expires: 7
            });
        }

        return { token, user };
    } catch (error: any) {
        error.friendlyMessage = getFriendlyErrorMessage(error);
        throw error;
    }
};



export const refreshAccessToken = async (): Promise<boolean> => {
    try {
        const response = await axios.post('/api/auth/refresh');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};



export const logout = async (): Promise<void> => {
    try {
        // First, notify the backend to clear the server-side session
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`);
        } catch (error) {
            console.error('Error notifying backend of logout:', error);
            // Continue with client-side cleanup even if backend call fails
        }

        // Clear all authentication cookies
        Cookies.remove(CRM_ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        Cookies.remove(TOKEN_EXPIRY_KEY);
        Cookies.remove(PERSONID);
        Cookies.remove(USEREMAIL);
        Cookies.remove(USERNAME);
        Cookies.remove(USERLC);
        Cookies.remove(USERROLE);
        
        // Clear localStorage
        window.localStorage.clear();
        
        // Clear sessionStorage
        window.sessionStorage.clear();
        
        // Clear all cookies in the domain (fallback method)
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Redirect to login page
        window.location.href = '/login';
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect to login even if there's an error
        window.location.href = '/login';
    }
};

export function initiateAiesecLogin(): void {
    // Store the current URL as redirect_uri
    const currentPath = window.location.pathname;
    document.cookie = `redirect_uri=${currentPath}; path=/; secure; samesite=strict`;

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: AUTH_CLIENT_ID!,
        redirect_uri: `${window.location.origin}/api/auth/callback`,
        scope: 'basic',
    });

    window.location.href = `${GIS_AUTH_ENDPOINT}/oauth/authorize?${params.toString()}`;
}

// Helper function for authenticated API requests
export const authenticatedRequest = async <T>(request: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> => {
    try {
        return await request();
    } catch (error: any) {
        if (error.response?.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return await request();
            } else {
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }
        }
        throw error;
    }
};

// --- Admin/User Management Stubs ---
export const getAllPendingUsers = async () => {
  // TODO: Implement API call to fetch pending users
  return [];
};

export const approveUser = async (userId: string) => {
  // TODO: Implement API call to approve user
};

export const rejectUser = async (userId: string) => {
  // TODO: Implement API call to reject user
};

export const updateUserRole = async (userId: string, newRole: string) => {
  // TODO: Implement API call to update user role
};

export const signup = async (signupData: any) => {
  // TODO: Implement API call to sign up user
};
