import axios from "axios";
import { clearStoredUser, getStoredToken } from "../utils/authSession";

function isPrivateOrLocalHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    if (configuredBaseUrl.startsWith("/")) {
      return configuredBaseUrl.replace(/\/+$/, "") || "/api";
    }

    try {
      const parsedUrl = new URL(configuredBaseUrl);
      const currentHostname =
        typeof window !== "undefined" ? window.location.hostname : "";
      const currentProtocol =
        typeof window !== "undefined" ? window.location.protocol : "";
      const configuredHostname = parsedUrl.hostname;

      if (
        currentHostname &&
        isPrivateOrLocalHost(configuredHostname) &&
        configuredHostname !== currentHostname
      ) {
        return "/api";
      }

      if (
        currentProtocol === "https:" &&
        parsedUrl.protocol === "http:" &&
        isPrivateOrLocalHost(configuredHostname)
      ) {
        return "/api";
      }
    } catch {
      return "/api";
    }

    const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(
      configuredBaseUrl
    );

    if (!import.meta.env.DEV && isLocalhostUrl) {
      return "/api";
    }

    return configuredBaseUrl.replace(/\/+$/, "");
  }

  return "/api";
}

const API_BASE_URL = getApiBaseUrl();

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((req) => {
  const publicPaths = [
    "/user/login",
    "/user/register",
    "/user/forgot-password",
    "/user/reset-password",
    "/user/google-login",
    "/user/google-register",
    "/auth/linkedin",
    "/auth/linkedin/callback",
  ];
  const isPublic = publicPaths.some((path) => req.url?.includes(path));

  if (!isPublic) {
    const token = getStoredToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldClearSession =
      error.response?.status === 401 && !error.config?.skipSessionClearOn401;

    if (shouldClearSession) {
      clearStoredUser();
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default API;
