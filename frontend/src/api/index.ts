import { api } from "./client";
import {
  ApiItemResponse,
  ApiListResponse,
  Challan,
  Customer,
  Product,
  StockMovement,
  User,
} from "../types";

// ---------- Auth ----------
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiItemResponse<{ user: User; token: string }>>("/auth/login", { email, password }),
  register: (payload: { name: string; email: string; password: string; role: string }) =>
    api.post<ApiItemResponse<{ user: User; token: string }>>("/auth/register", payload),
  me: () => api.get<ApiItemResponse<User>>("/auth/me"),
};

// ---------- Customers ----------
export const customerApi = {
  list: (params: Record<string, string | number | undefined>) =>
    api.get<ApiListResponse<Customer>>("/customers", { params }),
  get: (id: string) => api.get<ApiItemResponse<Customer>>(`/customers/${id}`),
  create: (payload: Partial<Customer>) => api.post<ApiItemResponse<Customer>>("/customers", payload),
  update: (id: string, payload: Partial<Customer>) =>
    api.put<ApiItemResponse<Customer>>(`/customers/${id}`, payload),
  addFollowUp: (id: string, note: string) =>
    api.post(`/customers/${id}/follow-up`, { note }),
};

// ---------- Products ----------
export const productApi = {
  list: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Product>>("/products", { params }),
  get: (id: string) => api.get<ApiItemResponse<Product>>(`/products/${id}`),
  create: (payload: Partial<Product>) => api.post<ApiItemResponse<Product>>("/products", payload),
  update: (id: string, payload: Partial<Product>) =>
    api.put<ApiItemResponse<Product>>(`/products/${id}`, payload),
  recordMovement: (
    id: string,
    payload: { quantity: number; movementType: "IN" | "OUT"; reason?: string }
  ) => api.post(`/products/${id}/stock-movements`, payload),
  listMovements: (id: string, params: Record<string, string | number | undefined>) =>
    api.get<ApiListResponse<StockMovement>>(`/products/${id}/stock-movements`, { params }),
};

// ---------- Challans ----------
export const challanApi = {
  list: (params: Record<string, string | number | undefined>) =>
    api.get<ApiListResponse<Challan>>("/challans", { params }),
  get: (id: string) => api.get<ApiItemResponse<Challan>>(`/challans/${id}`),
  create: (payload: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    status: "DRAFT" | "CONFIRMED";
  }) => api.post<ApiItemResponse<Challan>>("/challans", payload),
  confirm: (id: string) => api.post<ApiItemResponse<Challan>>(`/challans/${id}/confirm`),
  cancel: (id: string) => api.post<ApiItemResponse<Challan>>(`/challans/${id}/cancel`),
};
