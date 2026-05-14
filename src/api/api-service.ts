// src/api/api-service.ts

import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { getToken } from "@/app/msal/msal";
import { logger } from '@/lib/default-logger';
import { getDemoAccessToken } from '@/lib/auth/client';

// Create an Axios instance for general API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    const token = getDemoAccessToken() ?? await getToken();
    // logger.debug('api config.baseURL:', config.baseURL);
    // logger.debug('env backend url:', process.env.NEXT_PUBLIC_BACKEND_URL);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      logger.warn('No access token available for API request.');
      // Optionally, you might redirect to login or handle the missing token
    }
    return config;
  },
  async (error) => {
    logger.error('Failed to set access-token for API request.', error);
    return Promise.reject(new Error('Failed to set access-token for API request.'));
  }
);

/**
 * Centralized error handling function
 */
const handleError = async (error: AxiosError): Promise<never> => {
  if (error.response) {
    const { status } = error.response;

    if (status === 401) {
      // Optionally, you can refresh the token here if not already handled
      logger.warn('Unauthorized access - possibly due to an expired token.');
    } else {
      logger.error(`API Error: ${status.toString()}`, error.response.data);
    }
  } else {
    logger.error('API request error:', error.message);
  }

  throw error;
};

// Response interceptor to handle errors centrally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => handleError(error)
);

export default api;
