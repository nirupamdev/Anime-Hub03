
export async function adminLogin(email: string, password: string): Promise<string> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  
  localStorage.setItem("admin_token", data.token);
  return data.token;
}

export function isAdminAuthenticated(): boolean {
  return !!localStorage.getItem("admin_token");
}

export function logoutAdmin() {
  localStorage.removeItem("admin_token");
}

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}

async function authenticatedFetch(url: string, options: any = {}) {
  const token = getAdminToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });
  if (!res.ok) {
    if (res.status === 401) logoutAdmin();
    const data = await res.json();
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}

// Anime Management
export const adminGetAnimes = () => authenticatedFetch("/api/admin/animes");
export const adminCreateAnime = (anime: any) => authenticatedFetch("/api/admin/animes", { method: "POST", body: JSON.stringify(anime) });
export const adminUpdateAnime = (id: string, updates: any) => authenticatedFetch(`/api/admin/animes/${id}`, { method: "PUT", body: JSON.stringify(updates) });
export const adminDeleteAnime = (id: string) => authenticatedFetch(`/api/admin/animes/${id}`, { method: "DELETE" });
export const adminBulkDeleteAnimes = (ids: string[]) => authenticatedFetch("/api/admin/animes/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) });
export const adminBulkStatusAnimes = (ids: string[], status: string) => authenticatedFetch("/api/admin/animes/bulk-status", { method: "POST", body: JSON.stringify({ ids, status }) });

// Page Management
export const adminGetPages = () => authenticatedFetch("/api/admin/pages");
export const adminCreatePage = (page: any) => authenticatedFetch("/api/admin/pages", { method: "POST", body: JSON.stringify(page) });
export const adminUpdatePage = (id: string, updates: any) => authenticatedFetch(`/api/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(updates) });
export const adminDeletePage = (id: string) => authenticatedFetch(`/api/admin/pages/${id}`, { method: "DELETE" });
export const adminBulkDeletePages = (ids: string[]) => authenticatedFetch("/api/admin/pages/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) });

// Taxonomy
export const adminGetTaxonomies = () => authenticatedFetch("/api/admin/taxonomies");
export const adminCreateTaxonomy = (tax: any) => authenticatedFetch("/api/admin/taxonomies", { method: "POST", body: JSON.stringify(tax) });
export const adminDeleteTaxonomy = (id: string) => authenticatedFetch(`/api/admin/taxonomies/${id}`, { method: "DELETE" });

// Comments
export const adminGetComments = () => authenticatedFetch("/api/admin/comments");
export const adminUpdateComment = (id: string, updates: any) => authenticatedFetch(`/api/admin/comments/${id}`, { method: "PUT", body: JSON.stringify(updates) });
export const adminDeleteComment = (id: string) => authenticatedFetch(`/api/admin/comments/${id}`, { method: "DELETE" });

// Analytics
export const adminGetAnalytics = () => authenticatedFetch("/api/admin/analytics");

// Activities
export const adminGetActivities = () => authenticatedFetch("/api/admin/activities");
