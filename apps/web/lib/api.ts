const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let cachedToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token") || cachedToken;
  }
  return cachedToken;
}

export function setAuthToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function clearAuthToken() {
  cachedToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

let authPromise: Promise<string | null> | null = null;

async function ensureToken(): Promise<string | null> {
  const existing = getAuthToken();
  if (existing) return existing;

  if (!authPromise) {
    authPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/demo-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            setAuthToken(data.access_token);
            return data.access_token;
          }
        }
      } catch (e) {
        console.warn("Auto-login failed:", e);
      } finally {
        authPromise = null;
      }
      return null;
    })();
  }
  return authPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAuthToken();

  if (!token && !endpoint.includes("/auth/")) {
    token = await ensureToken();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });


  if (response.status === 401 && !endpoint.includes("/auth/")) {
    // Retry once with fresh demo token if 401 occurs
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.access_token);
        headers["Authorization"] = `Bearer ${data.access_token}`;
        const retryRes = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
          ...options,
          headers,
        });
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({ detail: retryRes.statusText }));
          throw new Error(errData.detail || `HTTP Error ${retryRes.status}`);
        }
        return retryRes.json();
      }
    } catch (e) {
      clearAuthToken();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Server error (${response.status})`);
  }

  return response.json();
}

// Data Types
export type Product = {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  description: string;
  delivery_info: string;
  variants: string[];
  faq: { question: string; answer: string }[];
  status: string;
};

export type Campaign = {
  id: string;
  product_id: string;
  name: string;
  keyword: string;
  normalized_keyword: string;
  instagram_url?: string;
  first_dm_message: string;
  auto_dm_enabled: boolean;
  status: string;
};

export type Lead = {
  id: string;
  customer_name: string;
  phone: string;
  instagram_username: string;
  product_id: string;
  campaign_id: string;
  status: string;
  source_comment?: string;
  ai_summary?: string;
};

export type DashboardSummary = {
  today_leads: number;
  total_leads: number;
  active_campaigns: number;
  top_product: string;
  instagram_status: string;
  telegram_status: string;
  ai_conversations: number;
};

export type TelegramSettings = {
  bot_username?: string;
  chat_id?: string;
  notification_enabled: boolean;
  last_test_status?: string;
};

export type InstagramSettings = {
  instagram_account_id?: string;
  instagram_username?: string;
  page_id?: string;
  token_status: "not_connected" | "active" | "invalid" | "expired";
  connected_at?: string;
};

export type InstagramSettingsInput = {
  instagram_account_id: string;
  page_id?: string;
  access_token: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "ai" | "system";
  message_text: string;
};

export type Conversation = {
  id: string;
  instagram_username: string;
  lead_id?: string;
  product_id?: string;
  campaign_id?: string;
  status: string;
  messages: Message[];
};

// API Functions
export const api = {
  loginDemo: () => request<{ access_token: string }>("/auth/demo-login", { method: "POST" }),
  getDashboard: () => request<DashboardSummary>("/dashboard"),
  getProducts: () => request<Product[]>("/products"),
  createProduct: (data: Omit<Product, "id">) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<{ status: string }>(`/products/${id}`, { method: "DELETE" }),

  getCampaigns: () => request<Campaign[]>("/campaigns"),
  createCampaign: (data: Omit<Campaign, "id" | "normalized_keyword">) =>
    request<Campaign>("/campaigns", { method: "POST", body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: Partial<Campaign>) =>
    request<Campaign>(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => request<{ status: string }>(`/campaigns/${id}`, { method: "DELETE" }),

  getLeads: () => request<Lead[]>("/leads"),
  updateLeadStatus: (id: string, status: string) =>
    request<Lead>(`/leads/${id}?status=${encodeURIComponent(status)}`, { method: "PATCH" }),

  getConversation: (id: string) => request<Conversation>(`/conversations/${id}`),

  getTelegramSettings: () => request<TelegramSettings>("/integrations/telegram"),
  saveTelegramSettings: (data: TelegramSettings) =>
    request<{ status: string }>("/integrations/telegram", { method: "POST", body: JSON.stringify(data) }),
  testTelegram: () => request<{ status: string; message_preview: string }>("/integrations/telegram/test", { method: "POST" }),

  getInstagramSettings: () => request<InstagramSettings>("/integrations/instagram"),
  saveInstagramSettings: (data: InstagramSettingsInput) =>
    request<InstagramSettings>("/integrations/instagram", { method: "POST", body: JSON.stringify(data) }),
  testInstagram: () => request<{ status: string; instagram_username?: string }>("/integrations/instagram/test", { method: "POST" }),
  connectInstagram: () => request<{ status: string; oauth_url?: string; next?: string }>("/integrations/instagram/connect"),

  runTestWebhook: (commentText: string) =>
    request<{ status: string; campaign_id?: string; product_id?: string; private_reply_preview?: string; reason?: string }>(
      "/webhooks/instagram",
      {
        method: "POST",
        body: JSON.stringify({
          comment_id: `cmt_${Date.now()}`,
          comment_text: commentText,
          instagram_user_id: `user_${Date.now()}`,
          instagram_username: "test_customer",
        }),
      }
    ),
};
