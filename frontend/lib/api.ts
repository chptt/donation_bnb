import axios from "axios";
import { API_URL } from "./constants";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cg_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("cg_token");
      localStorage.removeItem("cg_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  linkWallet: (walletAddress: string) => api.put("/auth/link-wallet", { walletAddress }),
};

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const campaignApi = {
  getAll: (params?: Record<string, string>) => api.get("/campaigns", { params }),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  getMine: () => api.get("/campaigns/user/my-campaigns"),
  create: (data: FormData) =>
    api.post("/campaigns", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, data: FormData | Record<string, unknown>) =>
    api.put(`/campaigns/${id}`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),
  syncOnChain: (data: { campaignId: string; blockchainCampaignId: number; txHash: string; ipfsURI?: string }) =>
    api.post("/campaigns/sync-onchain", data),
};

// ─── Donations ───────────────────────────────────────────────────────────────
export const donationApi = {
  sync: (data: {
    txHash: string;
    campaignId: string;
    blockchainCampaignId: number;
    amount: string;
    amountWei: string;
    walletAddress: string;
  }) => api.post("/donations/sync", data),
  getHistory: () => api.get("/donations/user/history"),
  getCampaignDonations: (campaignId: string) => api.get(`/donations/campaign/${campaignId}`),
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardApi = {
  getCampaigns: (params?: { sortBy?: string; limit?: number }) =>
    api.get("/leaderboard/campaigns", { params }),
  getDonors: (params?: { limit?: number }) => api.get("/leaderboard/donors", { params }),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get("/dashboard/summary"),
  getActivity: () => api.get("/dashboard/activity"),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: FormData | Record<string, unknown>) =>
    api.put("/users/profile", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),
};
