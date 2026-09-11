import axios from "axios";
import { resolveApiBase, resolveAssetUrl } from "./urls";

export const api = axios.create({
  baseURL: resolveApiBase(import.meta.env.VITE_API_BASE_URL, window.location.origin),
});

export const assetUrl = value => resolveAssetUrl(value, api.defaults.baseURL);

// Initialize auth token from localStorage on app load
export function initializeAuthToken() {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

// Set or clear auth token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("token");
  }
}

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = /\/auth\/login\/?(?:\?|$)/.test(error.config?.url || "");
    if (error.response?.status === 401 && !isLoginRequest) {
      // Clear auth on unauthorized response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;
      // Reload page to trigger auth context update
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);
