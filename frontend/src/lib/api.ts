const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "https://samadhan-setu-u8da.onrender.com/api"
    : process.env.NODE_ENV === "production"
    ? "https://samadhan-setu-u8da.onrender.com/api"
    : "http://localhost:8000/api");

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("samadhan_token");
  }
  return null;
}

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const data = await res.json();
      errorDetail = data.detail || JSON.stringify(data);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => fetcher("/health"),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData: any) =>
    fetcher("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  getMe: () => fetcher("/auth/me"),
  getDemoUsers: () => fetcher("/auth/demo-users"),

  // Citizen
  submitReport: (reportData: any) =>
    fetcher("/citizen/reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    }),
  getCitizenReports: () => fetcher("/citizen/reports"),
  trackReport: (trackingNumber: string) => fetcher(`/citizen/track/${trackingNumber}`),
  getReportDetail: (id: number) => fetcher(`/citizen/reports/${id}`),

  // HEI
  getInstitutes: () => fetcher("/hei/institutes"),
  getAssignedReports: () => fetcher("/hei/assigned-reports"),
  submitProposal: (proposalData: any) =>
    fetcher("/hei/proposals", {
      method: "POST",
      body: JSON.stringify(proposalData),
    }),
  getProposals: () => fetcher("/hei/proposals"),
  updateReportStatus: (reportId: number, status: string) =>
    fetcher(`/hei/reports/${reportId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Industry
  getSolutions: (filters?: { domain?: string; district?: string; status_filter?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.domain) params.append("domain", filters.domain);
    if (filters?.district) params.append("district", filters.district);
    if (filters?.status_filter) params.append("status_filter", filters.status_filter);
    if (filters?.search) params.append("search", filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetcher(`/industry/solutions${queryString}`);
  },
  submitIndustryOffer: (offerData: any) =>
    fetcher("/industry/offers", {
      method: "POST",
      body: JSON.stringify(offerData),
    }),
  getMyOffers: () => fetcher("/industry/my-offers"),

  // Government
  getGovtAnalytics: () => fetcher("/govt/analytics"),
  getAllGovtReports: (filters?: { domain?: string; district?: string; status_filter?: string; is_duplicate?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.domain) params.append("domain", filters.domain);
    if (filters?.district) params.append("district", filters.district);
    if (filters?.status_filter) params.append("status_filter", filters.status_filter);
    if (filters?.is_duplicate !== undefined) params.append("is_duplicate", String(filters.is_duplicate));
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetcher(`/govt/reports${queryString}`);
  },
  overrideHEI: (reportId: number, data: { hei_id: number; reason?: string }) =>
    fetcher(`/govt/override-hei/${reportId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAuditLogs: () => fetcher("/govt/audit-logs"),

  // Notifications
  getNotifications: () => fetcher("/notifications"),
  markNotificationRead: (id: number) =>
    fetcher(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  // Media Upload
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed.");
    return res.json();
  },

  // AI Chatbot
  sendChatMessage: (message: string, history: { role: string; content: string }[]) =>
    fetcher("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
