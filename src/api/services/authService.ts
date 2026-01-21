// @ts-ignore
import Cookies from 'js-cookie';
import { GetTokenResponse } from './auth-types';
import axios, { AxiosResponse } from 'axios';
import { CRM_ACCESS_TOKEN_KEY, EXPA_ACCESS_TOKEN_KEY, EXPA_REFRESH_TOKEN_KEY } from '../../utils/tokenKeys';

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
    || 'http://localhost:5002';
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
};

export function isAccessTokenPresent(): boolean {
    const accessToken = Cookies.get(EXPA_ACCESS_TOKEN_KEY);
    return !!(accessToken && accessToken !== '' && accessToken !== null);
}

export async function getAccessTokenFromOauth(code: string): Promise<GetTokenResponse> {
    const requestData = {
        grant_type: 'authorization_code',
        client_id: AUTH_CLIENT_ID,
        client_secret: AUTH_CLIENT_SECRET,
        redirect_uri: AUTH_REDIRECT_URI,
        code: code
    };

    try {
        const response = await fetch(`${GIS_AUTH_ENDPOINT}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.status !== 200) {
            const error = await response.json();
            console.error(error);
            throw new Error('Error getting access token');
        }

        const tokenResponse: GetTokenResponse = await response.json();

        // Store tokens in cookies with proper typing
        Cookies.set(EXPA_ACCESS_TOKEN_KEY, tokenResponse.access_token, {
            expires: new Date(new Date().getTime() + tokenResponse.expires_in * 1000)
        });
        Cookies.set(EXPA_REFRESH_TOKEN_KEY, tokenResponse.refresh_token);

        return tokenResponse;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const refreshAccessToken = async (): Promise<boolean> => {
    try {
        const response = await axios.post('/api/auth/refresh');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

export function getAccessToken(): string {
    const accessToken = Cookies.get(EXPA_ACCESS_TOKEN_KEY);
    if (accessToken) {
        return accessToken;
    }
    throw new Error('No access token found');
}

export const logout = async (): Promise<void> => {
    try {
        await axios.post('/api/auth/logout');
        // Log out from EXPA as well
        window.location.href = 'https://auth.aiesec.org/users/sign_out?redirect_to=https://accelerator.aiesec.org.eg/login';
    } catch (error) {
        console.error('Error during logout:', error);
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
