import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((req) => {
  const publicPaths = ["/user/login", "/user/register", "/user/forgot-password", "/user/reset-password", "/user/google-login", "/user/google-register"];
  const isPublic = publicPaths.some((path) => req.url?.includes(path));

  if (!isPublic) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return req;
});

export { API_BASE_URL };
export default API;
