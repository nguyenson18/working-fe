import axios from "axios";
import { notifier } from "./notifier";
import { getApiErrorMessage } from "./apiError";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = String(err.config?.url || "");

    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401) {
      // ✅ Login/Register sai -> chỉ báo lỗi, KHÔNG reload/redirect
      if (isAuthEndpoint) {
        notifier(getApiErrorMessage(err));
        return Promise.reject(err);
      }

      // ✅ Các API khác: token hết hạn
      localStorage.removeItem("accessToken");
      notifier("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }
      return Promise.reject(err);
    }

    
    return Promise.reject(err);
  }
);
