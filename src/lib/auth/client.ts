'use client';

import axios, { type AxiosResponse } from 'axios';
import { handleLoginRedirect, handleLogout, getToken, msalInstance } from "@/app/msal/msal";
import { logger } from '@/lib/default-logger';
import type { EduquestUser } from "@/types/eduquest-user";
import { type AccountInfo } from "@azure/msal-browser";
import { graphConfig, graphLoginRequest } from "@/app/msal/msal-config";

/**
 * Create a separate Axios instance for AuthClient to avoid circular dependencies.
 */
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Set up the request interceptor to use MSAL's getToken method
authApi.interceptors.request.use(
  async (config) => {
    // logger.debug('auth config.baseURL:', config.baseURL);
    // logger.debug('auth env backend url:', process.env.NEXT_PUBLIC_BACKEND_URL);
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      logger.warn('MSAL: No access token available for Auth API request.');
      // Optionally, you can handle the missing token scenario here
    }
    return config;
  },
  (error) => {
    logger.error('Failed to set access-token for Auth API request.', error);
    return Promise.reject(new Error('Failed to set access-token for Auth API request.'));
  }
);

class AuthClient {

  /**
   * Initiates the sign-in process using MSAL.
   */
  async signInWithMsal(): Promise<{ error?: string }> {
    try {
      msalInstance.setActiveAccount(null);
      await handleLoginRedirect();
      return {};
    } catch (error) {
      const err = error as Error;
      logger.error('Error signing in', err);
      return { error: err.message };
    }
  }

  /**
   * Retrieves the authenticated user and their EduquestUser profile.
   */
  async getUser(): Promise<{
    data: {
      user: AccountInfo | null;
      eduquestUser: EduquestUser | null;
      avatar: string;
    }
    error?: string
  }> {
    const msalUser = msalInstance.getActiveAccount();
    if (!msalUser) {
      logger.warn('MSAL: No active user found');
      return {
        data: {
          user: null,
          eduquestUser: null,
          avatar: ''
        }
      };
    }

    // Check if the email domain is allowed
    if (
      msalUser.username &&
      !msalUser.username.includes('@e.ntu.edu.sg') &&
      !msalUser.username.includes('@ntu.edu.sg') &&
      !msalUser.username.includes('@staff.main.ntu.edu.sg')
    ) {
      logger.debug('User is not from NTU, redirecting to login.');
      return {
        data: {
          user: null,
          eduquestUser: null,
          avatar: ''
        },
        error: 'Please sign in with your NTU email account.'
      };
    }

    // Get the EduquestUser profile
    const eduquestUser = await this.getEduquestUser(msalUser.username);

    const avatar = await this.getUserPhotoAvatar();

    if (eduquestUser === null) {
      return {
        data: {
          user: null,
          eduquestUser: null,
          avatar: ''
        },
        error: 'Failed to fetch user profile.'
      };
    }

    // Return the user and eduquest user
    return { data: { user: msalUser, eduquestUser, avatar } };
  }

  /**
   * Acquires an access token for Microsoft Graph and fetches the user's photo.
   */
  async getUserPhotoAvatar(): Promise<string> {
    try {
      const accessToken = await this.getAccessTokenForGraph();

      if (accessToken) {
        const photoEndpoint = `${graphConfig.graphMeEndpoint}/photo/$value`;

        const response = await fetch(photoEndpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        // If successful, this method returns a 200 OK response code and binary data of the requested photo.
        // If no photo exists, the operation returns 404 Not Found.

        if (response.status === 200) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
        logger.error(`Failed to fetch blob from graph API: ${response.statusText}`);
        return ''; // Return a fallback avatar URL or an empty string
      }
      logger.error('Failed to fetch access token for user photo.');
      return ''; // Return a fallback avatar URL or an empty string
    } catch (error) {
      logger.error('Failed to fetch user photo:', error);
      return ''; // Return a fallback avatar URL or an empty string
    }
  }

  /**
   * Acquires an access token specifically for Microsoft Graph API.
   */
  async getAccessTokenForGraph(): Promise<string | null> {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
      logger.warn("MSAL: No active account found, initiating login.");
      await this.signInWithMsal();
      return null;
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...graphLoginRequest,
        account: activeAccount,
      });
      // test if response throw error
      // throw new Error('test error');
      logger.debug("MSAL: Graph API token acquired silently.");
      return response.accessToken;
    } catch (error) {
      logger.error('MSAL: Error acquiring Graph API token silently:', error);
      return null;
    }
  }

  /**
   * Fetches the EduquestUser profile based on the username.
   */
  async getEduquestUser(username: string): Promise<EduquestUser | null> {
    try {
      const response: AxiosResponse<EduquestUser> = await authApi.get<EduquestUser>(
        `/api/eduquest-users/by_email/?email=${encodeURIComponent(username.toUpperCase())}`
      );
      return response.data;
    } catch (error: unknown) {
      logger.error('Failed to fetch Eduquest User, redirecting to Login page:', error);
      return null;
    }
  }

  /**
   * Initiates the sign-out process using MSAL.
   */
  async signOutMsal(): Promise<{ error?: string }> {
    try {
      handleLogout('redirect');
      return {};
    } catch (error) {
      const err = error as Error;
      logger.error('Error signing out', err);
      return { error: err.message };
    }
  }
}

export const authClient = new AuthClient();
