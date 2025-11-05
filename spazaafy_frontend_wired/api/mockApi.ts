/// <reference types="vite/client" />
// api/mockApi.ts — FULL FILE (wired to live backend) - CORRECTED

import {
  User,
  UserRole,
  SpazaShop,
  ShopDocument,
  DocumentStatus,
  Ticket,
  TicketStatus,
  ChatMessage,
  SiteVisit,
  SiteVisitStatus,
  Province,
  SiteVisitForm 
} from '../types';

const RAW_BASE = (import.meta as any)?.env?.VITE_API_BASE;
const API_BASE =
  (RAW_BASE ? RAW_BASE.replace(/\/+$/, '') : '') ||
  // ✅ if not localhost, force /api instead of localhost
  (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

type LoginResponse = {
  user: any;
  access: string;
  refresh: string;
};

// ==================================================================
// ✅ NEW HELPER FUNCTION FOR CSV DOWNLOADS
// ==================================================================
async function requestAndDownloadCsv(url: string, filename: string) {
  let token = getAccess();
  let headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

  let response = await fetch(`${API_BASE}${url}`, { headers });

  // If the first attempt fails with an expired token, try to refresh and retry
  if (response.status === 401) {
    console.log("Token expired for CSV download, attempting refresh...");
    try {
      await auth.refresh(); // Use the existing refresh logic
      token = getAccess(); // Get the new token
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(`${API_BASE}${url}`, { headers }); // Retry the request
    } catch (error) {
      console.error("Failed to refresh token for CSV download", error);
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  a.remove();
}

// --- (All functions from toUserRole to toMessage remain the same) ---

function toUserRole(apiRole?: string): UserRole {
  const r = String(apiRole || '').toLowerCase();
  if (r === 'owner') return UserRole.SHOP_OWNER;
  if (r === 'consumer') return UserRole.CONSUMER;
  if (r === 'admin') return UserRole.ADMIN;
  return UserRole.CONSUMER;
}

function fromUserRole(role: UserRole): 'OWNER' | 'CONSUMER' | 'ADMIN' {
  if (role === UserRole.SHOP_OWNER) return 'OWNER';
  if (role === UserRole.ADMIN) return 'ADMIN';
  return 'CONSUMER';
}

function toUser(u: any): User {
  return {
    id: String(u.id ?? u.user_id ?? ''),
    email: String(u.email ?? ''),
    firstName: String(u.first_name ?? u.firstName ?? ''),
    lastName: String(u.last_name ?? u.lastName ?? ''),
    phone: u.phone ? String(u.phone) : undefined,
    role: toUserRole(u.role),
  };
}

function toDocStatus(s?: string): DocumentStatus {
  switch (String(s || '').toUpperCase()) {
    case 'VERIFIED':
      return DocumentStatus.VERIFIED;
    case 'REJECTED':
      return DocumentStatus.REJECTED;
    default:
      return DocumentStatus.PENDING;
  }
}

function toVisitStatus(s?: string): SiteVisitStatus {
  switch (String(s || '').toUpperCase()) {
    // ✅ FIX: Map the official backend statuses to frontend enum values
    case 'COMPLETED': // Backend success -> Frontend success
      return SiteVisitStatus.APPROVED;

      case 'SCHEDULED':
      return SiteVisitStatus.SCHEDULED;

    case 'CANCELLED': // Backend failure -> Frontend failure
    case 'REJECTED': // ✅ CRITICAL FIX: Add 'REJECTED' to correctly map the string status
      return SiteVisitStatus.REJECTED;

    case 'EXPIRED':
        return SiteVisitStatus.EXPIRED;
      
    // Map all in-progress/waiting statuses to frontend PENDING
    case 'PENDING':
    case 'IN_PROGRESS':
      return SiteVisitStatus.PENDING;

    default:
      // Fallback for any unknown status
      return SiteVisitStatus.PENDING;
  }
}

// Helper function to shape the visit data
function toVisit(v: any): SiteVisit {
    return {
        id: String(v.id),
        shopId: String(v.shop ?? v.shop_id ?? ''),
        shopName: String(v.shop_name ?? v.shopName ?? v.shop?.name ?? v.shop ?? ''),
        requestedDateTime: String(v.requested_datetime ?? v.requestedDateTime ?? ''),
        status: toVisitStatus(v.status),
        // ✅ FIX: Add updatedAt from the backend's updated_at field.
        updatedAt: String(v.updated_at ?? v.updatedAt ?? v.requested_datetime ?? new Date().toISOString()), 
        applicationForm: v.application_form ? { name: v.application_form.name, url: v.application_form.url, type: v.application_form.type, size: v.application_form.size } : undefined,
        shareCode: String(v.share_code ?? v.shareCode ?? ''),
        shareCodeExpiresAt: String(v.share_code_expires_at ?? v.shareCodeExpiresAt ?? ''),
    };
}



// ✅ THIS IS THE CORRECT, ROBUST toShop FUNCTION WITH LOGGING
function toShop(s: any): SpazaShop {
  // LOG 1: See the raw data from the Django API for a single shop.
  console.log("[mockApi.ts -> toShop] Raw input from backend:", s);

  let latitude = 0;
  let longitude = 0;

  // ✅ FIX: Add logic to parse the "SRID=...;POINT(lng lat)" string format
  if (typeof s.location === 'string') {
    const match = s.location.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (match && match.length === 3) {
      // The POINT format from PostGIS is (longitude latitude)
      longitude = parseFloat(match[1]);
      latitude = parseFloat(match[2]);
    }
  }
  // This logic robustly finds the coordinates from the GeoJSON format.
  else if (s.location && Array.isArray(s.location.coordinates) && s.location.coordinates.length === 2) {
    // GeoJSON format is [longitude, latitude]
    longitude = Number(s.location.coordinates[0]);
    latitude = Number(s.location.coordinates[1]);
  }
  // Fallback for any other potential format, just in case.
  else if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
    latitude = s.latitude;
    longitude = s.longitude;
  }

  const finalShopObject: SpazaShop = {
    id: String(s.id ?? ''), 
    ownerId: String(s.owner ?? s.owner_id ?? ''),
    email: String(s.email ?? ''),
    firstName: String(s.first_name ?? s.firstName ?? ''),
    lastName: String(s.last_name ?? s.lastName ?? ''),
    phone: s.phone ? String(s.phone) : undefined,
    role: UserRole.SHOP_OWNER,
    shopName: String(s.name ?? s.shop_name ?? s.shopName ?? ''),
    isVerified: Boolean(s.verified ?? s.is_verified ?? false),
    location: {
      lat: latitude,
      lng: longitude,
      address: String(s.address ?? ''),
    },
    distance: Number(s.distance ?? 0),
    registeredAt: String(s.registered_at ?? s.created_at ?? new Date().toISOString()),
    province: s.province ? {
        id: s.province.id,
        name: s.province.name
    } : { id: 0, name: 'N/A' }
  };

  // LOG 2: See the final, transformed object. Check if lat/lng are correct here.
  console.log("[mockApi.ts -> toShop] Final transformed SpazaShop object:", finalShopObject);

  return finalShopObject;
}


function toDocument(d: any): ShopDocument {
  const submissionDate = d.created_at || d.submitted_at || d.uploaded_at || null;
  return {
    id: String(d.id),
    shopOwnerId: String(d.shop ?? d.shop_owner ?? d.shopOwnerId ?? d.owner_id ?? ''),
    // ✅ THE FIX: Added d.shop?.name to the fallback chain to capture nested shop object details
    shopName: String(d.shop_details?.name ?? d.shop_name ?? d.shopName ?? d.shop?.name ?? d.shop ?? ''),
    name: String(d.name ?? d.display_name ?? d.document_name ?? ''),
    type: String(d.type ?? d.document_type ?? ''),
    status: toDocStatus(d.status),
    // ✅ THE FIX: Use the robust submissionDate variable
    submittedAt: submissionDate ? String(submissionDate) : null,
    expiryDate: d.expiry_date ? String(d.expiry_date) : null,
    fileUrl: d.file_url ?? d.url ?? d.file ?? undefined,
  };
}

function toTicket(t: any): Ticket {
  // A helper to map any string status to our strict enum
  const toTicketStatus = (s?: string): TicketStatus => {
    const status = String(s || 'OPEN').toUpperCase();
    // Check if the status is a valid key in our enum
    if (Object.values(TicketStatus).includes(status as TicketStatus)) {
      return status as TicketStatus;
    }
    // Fallback for unexpected statuses from the API
    return TicketStatus.OPEN;
  };

  return {
    id: String(t.id),
    shopId: t.shop_id ? String(t.shop_id) : t.shopId ?? undefined,
    shopName: String(t.shop_name ?? t.shopName ?? ''),
    // ✅ FIX: Extract the user ID and name from the new nested object
    // ✅ FIX: Source all user details from the 't.user' object now.
    createdByUserId: String(t.user?.id ?? ''),
    submitterName: `${t.user?.first_name || ''} ${t.user?.last_name || 'Unknown User'}`.trim(),
    submitterRole: toUserRole(t.user?.role),
    submitterEmail: String(t.user?.email ?? ''),

    assignedToUserId: t.assigned_to ? String(t.assigned_to) : t.assignedToUserId ?? null,
    title: String(t.title ?? ''),
    subject: String(t.subject ?? ''),
    description: String(t.description ?? ''),
    status: toTicketStatus(t.status), // ✅ Use the new robust helper
    priority: t.priority ?? undefined,
    createdAt: String(t.created_at ?? t.createdAt ?? new Date().toISOString()),
    updatedAt: String(t.updated_at ?? t.updatedAt ?? new Date().toISOString()),
    lastReplyAt: t.last_reply_at ? String(t.last_reply_at) : t.lastReplyAt ?? null,
    // ✅ Fix attachment shape to match TicketAttachment in types.ts
    attachments: (t.attachments || []).map((a: any) => ({
      id: String(a.id ?? ''),
      filename: String(a.filename ?? a.name ?? ''),
      fileUrl: String(a.fileUrl ?? a.url ?? ''),
    })),
    unreadForAssignee: Boolean(t.unread_for_assignee ?? false),
    unreadForCreator: Boolean(t.unread_for_creator ?? false),
  };
}

function toMessage(m: any): ChatMessage {
  return {
    id: String(m.id ?? ''),
    ticketId: String(m.ticket_id ?? m.ticketId ?? ''),
    senderId: String(m.sender ?? m.sender_id ?? m.senderId ?? ''), // <-- THE FIX
    content: String(m.content ?? ''),
    createdAt: String(m.created_at ?? m.createdAt ?? new Date().toISOString()),
    attachment: m.attachment
      ? {
          name: m.attachment.name,
          url: m.attachment.url,
          type: m.attachment.type,
          size: m.attachment.size,
        }
      : undefined,
  };
}

// ✅ NEW HELPER: Map snake_case server response to camelCase client type
function toSiteVisitForm(f: any): SiteVisitForm {
  return {
    id: f.id,
    visitId: String(f.visit ?? f.visitId ?? ''), 
    submittedAt: String(f.submitted_at ?? f.submittedAt ?? new Date().toISOString()), 

    inspectorName: String(f.inspector_name ?? ''),
    inspectorSurname: String(f.inspector_surname ?? ''),
    contractorCompany: String(f.contractor_company ?? ''),
    
    cleanliness: f.cleanliness,
    inspectorNotes: String(f.inspector_notes ?? f.inspectorNotes ?? ''),
    
    // Boolean fields mapping
    stockRotationObserved: Boolean(f.stock_rotation_observed),
    fireExtinguisherValid: Boolean(f.fire_extinguisher_valid),
    businessLicenceDisplayed: Boolean(f.business_licence_displayed),
    healthCertificateDisplayed: Boolean(f.health_certificate_displayed),
    refundPolicyVisible: Boolean(f.refund_policy_visible),
    salesRecordPresent: Boolean(f.sales_record_present),
    inventorySystemInPlace: Boolean(f.inventory_system_in_place),
    foodLabelsAndExpiryPresent: Boolean(f.food_labels_and_expiry_present),
    pricesVisible: Boolean(f.prices_visible),
    noticesPoliciesDisplayed: Boolean(f.notices_policies_displayed),
    supplierListPresent: Boolean(f.supplier_list_present),
    buildingPlanPresent: Boolean(f.building_plan_present),
    adequateVentilation: Boolean(f.adequate_ventilation),
    healthyStorageGoods: Boolean(f.healthy_storage_goods),
  };
}

// ---------- token helpers ----------
function getAccess() {
  return sessionStorage.getItem('access') || localStorage.getItem('access') || '';
}

// ✅ THIS IS THE MISSING FUNCTION
function getRefresh() { return sessionStorage.getItem('refresh'); }

function setTokens(access: string, refresh: string) {
  sessionStorage.setItem('access', access);
  sessionStorage.setItem('refresh', refresh);
}
function clearTokens() {
  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh');
}

// --- Global variables for handling concurrent refresh requests ---
let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Smart Generic Request Function with Token Refresh Logic ---
async function request<T = any>(url: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  let headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> | undefined) };

  if (withAuth) {
    const token = getAccess();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  const errorText = res.status === 401 ? await res.text().catch(() => '') : '';

  // ✅ FIX 1: Ensure the refresh/redirect block runs ONLY if withAuth is true
  if (!res.ok && res.status === 401 && withAuth && errorText.includes('token_not_valid')) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        headers['Authorization'] = `Bearer ${getAccess()}`;
        return fetch(`${API_BASE}${url}`, { ...options, headers });
      }).then(res => res.json());
    }

    isRefreshing = true;
    const refreshToken = getRefresh();
    if (!refreshToken) {
      clearTokens();
      window.location.href = '/#/login';
      return Promise.reject(new Error('Session expired.'));
    }

    try {
      const refreshRes = await fetch(`${API_BASE}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshRes.ok) { throw new Error('Refresh token is invalid or expired.'); }

      const { access, refresh: newRefresh } = await refreshRes.json();
      setTokens(access, newRefresh || refreshToken);
      headers['Authorization'] = `Bearer ${access}`;
      processQueue(null, access);
      
      // Retry the original request
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });

    } catch (e) {
      processQueue(e as Error, null);
      clearTokens();
      window.location.href = '/#/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
  
  // ✅ CRITICAL FIX: Simplify the final error block to prevent global redirect on public 401
  if (!res.ok) {
    const finalErrorText = await res.text().catch(() => 'Request failed');
    
    // Check if the error is a 401 on an authenticated route
    if (res.status === 401 && withAuth) {
        // This is a protected route with an expired token, force login
        clearTokens();
        window.location.href = '/#/login'; 
        return Promise.reject(new Error('Session expired.'));
    }

    // For all other errors (including the controlled public 401), throw a standard error
    // This allows PublicSiteVisitForm's catch block to handle the error message locally.
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${finalErrorText || 'Request failed'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) { return (await res.json()) as T; }
  return undefined as T;
}

// ---------- API ----------
const auth = {
  async register(payload: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: 'CONSUMER' | 'OWNER' | 'ADMIN';
    shop_name?: string;
    address?: string;
    province?: string;
  }): Promise<LoginResponse & { user: User }> {
    const data = await request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, /*withAuth*/ false);

    setTokens(data.access, data.refresh);
    const shaped = toUser(data.user);
    sessionStorage.setItem('user', JSON.stringify(shaped));
    return { ...data, user: shaped };
  },

  async login(email: string, password: string): Promise<LoginResponse & { user: User }> {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, /*withAuth*/ false);

    setTokens(data.access, data.refresh);
    const shaped = toUser(data.user);
    sessionStorage.setItem('user', JSON.stringify(shaped));
    return { ...data, user: shaped };
  },

  async logout(): Promise<void> {
    clearTokens();
    sessionStorage.removeItem('user');
  },

  async refresh(): Promise<void> {
    const refresh = sessionStorage.getItem('refresh') || '';
    if (!refresh) return;
    try {
      const data = await request<{ access: string; refresh?: string }>(
        '/auth/token/refresh',
        { method: 'POST', body: JSON.stringify({ refresh }) },
        /*withAuth*/ false
      );
      if (data?.access) {
        setTokens(data.access, data.refresh || refresh);
      }
    } catch {
      clearTokens();
      sessionStorage.removeItem('user');
    }
  },

  async requestPasswordReset(email: string): Promise<{ detail: string }> {
    return request<{ detail: string }>('/auth/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, /*withAuth*/ false);
  },

  async confirmPasswordReset(payload: { token: string; password: string; password_confirm: string }): Promise<{ detail: string }> {
    return request<{ detail: string }>('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, /*withAuth*/ false);
  },
};

// ==================================================================
// --- ADD a new 'reports' object ---
// ==================================================================

const reports = {
    // ✅ Use the new helper function
    async exportDashboardCsv() {
        await requestAndDownloadCsv('/reports/dashboard/export-csv/', 'dashboard_summary.csv');
    },
};

// ==================================================================
// ✅ ADD THIS NEW 'users' OBJECT
// ==================================================================

const users = {
  // THIS IS THE MISSING FUNCTION
  async getAll(): Promise<User[]> {
    const data = await request<any[]>('/auth/users/');
    return data.map(toUser);
  },
  
  // THIS IS THE CRITICAL FIX
  async update(userId: string, payload: Partial<User>): Promise<User> {
    // This function now makes a REAL API call to the backend.
    const apiPayload: any = {};
    if (payload.firstName) apiPayload.first_name = payload.firstName;
    if (payload.lastName) apiPayload.last_name = payload.lastName;
    if (payload.phone) apiPayload.phone = payload.phone;

    const data = await request<any>(`/auth/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(apiPayload),
    });
    // It returns the fresh, complete user object from the server.
    return toUser(data);
  },
};

const shops = {
  async getAll(): Promise<SpazaShop[]> {
    const data = await request<any[]>('/shops/');
    return data.map(toShop);
  },
  async getById(id: string): Promise<SpazaShop> {
    const data = await request<any>(`/shops/${id}/`);
    return toShop(data);
  },
  // ==================================================================
  // ✅ ADD THIS MISSING 'update' METHOD
  // ==================================================================
  // THIS IS THE OTHER CRITICAL FIX
  // ✅ THIS IS THE FIX
   async update(shopId: string, payload: Partial<SpazaShop> & { name?: string; address?: string; latitude?: number; longitude?: number }): Promise<SpazaShop> {
    const apiPayload: any = {};
    if (payload.firstName) apiPayload.first_name = payload.firstName;
    if (payload.lastName) apiPayload.last_name = payload.lastName;
    if (payload.phone) apiPayload.phone = payload.phone;
    if (payload.name) apiPayload.name = payload.name;
    if (payload.address) apiPayload.address = payload.address;
    if (payload.latitude !== undefined) apiPayload.latitude = payload.latitude;
    if (payload.longitude !== undefined) apiPayload.longitude = payload.longitude;

    console.log("[mockApi] Sending this payload to the backend:", apiPayload);

    const data = await request<any>(`/shops/${shopId}/`, {
      method: 'PATCH',
      body: JSON.stringify(apiPayload),
    });
    
    return toShop(data);
  },

  // ✅ Use the new helper function
    async exportCsv() {
        await requestAndDownloadCsv('/shops/export_csv/', 'spaza_shops.csv');
    },
};

const documents = {
  async list(): Promise<ShopDocument[]> {
    const data = await request<any[]>('/compliance/documents/');
    return data.map(toDocument);
  },
  
  async upload(shopId: string, payload: { name: string; type: string; file: File; expiry_date?: string | null }) {
    const form = new FormData();
    form.append('shop', shopId); 
    form.append('type', payload.type);
    form.append('name', payload.name); 
    form.append('file', payload.file);
    if (payload.expiry_date) {
      form.append('expiry_date', payload.expiry_date);
    }

    const token = getAccess();
    const res = await fetch(`${API_BASE}/compliance/documents/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    const json = await res.json();
    return toDocument(json);
  },

  // ✅ THE FIX: The function now accepts a data object with notes and an optional expiry_date
  async updateStatus(id: string, action: 'verify' | 'reject', data?: { notes?: string; expiry_date?: string | null }) {
    await request(`/compliance/documents/${id}/${action}/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // ✅ Use the new helper function
    async exportCsv() {
        await requestAndDownloadCsv('/compliance/documents/export_csv/', 'documents.csv');
    },
};

// ✅ FIX 1: Use the exact SiteVisitStatus TextChoices from Django models.py
const SITE_VISIT_API_MAP: Record<string, string> = {
    'APPROVED': 'COMPLETED', // Maps frontend success to backend COMPLETED
    'REJECTED': 'CANCELLED',  // Maps frontend failure to backend CANCELLED (best guess)
    'PENDING': 'PENDING',
    'SCHEDULED': 'SCHEDULED', // Added for the new requirement
};

// ✅ NEW HELPER: Map client camelCase payload to snake_case API payload
function toApiPayload(clientPayload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>): any {
    return {
        inspector_name: clientPayload.inspectorName,
        inspector_surname: clientPayload.inspectorSurname,
        contractor_company: clientPayload.contractorCompany,

        cleanliness: clientPayload.cleanliness,
        inspector_notes: clientPayload.inspectorNotes,
        
        
        // Convert camelCase booleans to snake_case
        stock_rotation_observed: clientPayload.stockRotationObserved,
        fire_extinguisher_valid: clientPayload.fireExtinguisherValid,
        business_licence_displayed: clientPayload.businessLicenceDisplayed,
        health_certificate_displayed: clientPayload.healthCertificateDisplayed,
        refund_policy_visible: clientPayload.refundPolicyVisible,
        sales_record_present: clientPayload.salesRecordPresent,
        inventory_system_in_place: clientPayload.inventorySystemInPlace,
        food_labels_and_expiry_present: clientPayload.foodLabelsAndExpiryPresent,
        prices_visible: clientPayload.pricesVisible,
        notices_policies_displayed: clientPayload.noticesPoliciesDisplayed,
        supplier_list_present: clientPayload.supplierListPresent,
        building_plan_present: clientPayload.buildingPlanPresent,
        adequate_ventilation: clientPayload.adequateVentilation,
        healthy_storage_goods: clientPayload.healthyStorageGoods,
    };
}


// ==================================================================
// ✅ THIS IS THE CORRECTED 'visits' OBJECT
// ==================================================================
const visits = {
    // 1. ADD BACK THE MISSING LIST FUNCTION
    async list(): Promise<SiteVisit[]> {
        const data = await request<any[]>('/visits/');
        return data.map(toVisit);
    },
    
    // ✅ NEW FIX: Function to get a single visit by ID
    async getById(id: string, withAuth: boolean = true): Promise<SiteVisit> {
        console.log(`[visits.getById] Called with id: ${id}, withAuth: ${withAuth}`);
        const data = await request<any>(`/visits/${id}/`, {}, withAuth); 
        return toVisit(data);
    },

    // 2. ADD BACK THE MISSING REQUEST VISIT FUNCTION
    async requestVisit(shopId: string, requestedDateTime: string): Promise<SiteVisit> {
        const data = await request<any>('/visits/', {
            method: 'POST',
            body: JSON.stringify({ shop: shopId, requested_datetime: requestedDateTime }),
        });
        return toVisit(data);
    },

    async schedule(visitId: string, requestedDateTime: string): Promise<SiteVisit> {
        // Send a PATCH request to update the date/time and set status to SCHEDULED
        const data = await request<any>(`/visits/${visitId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                requested_datetime: requestedDateTime,
                status: SITE_VISIT_API_MAP['SCHEDULED'] // Set status to SCHEDULED on scheduling
            }),
        });
        return toVisit(data);
    },

    // ✅ FIX 2: Use the dedicated /status/ action endpoint for status updates
    async updateStatus(visitId: string, status: SiteVisitStatus) {
        // Find the correct status string to send to the API.
        const apiStatus = SITE_VISIT_API_MAP[status.toUpperCase()] || status.toUpperCase();
        
        const data = await request<any>(`/visits/${visitId}/status/`, {
            method: 'POST',
            body: JSON.stringify({ status: apiStatus }),
        });

        return toVisit(data);
    },

    toVisitStatus,

    async getFormByVisitId(visitId: string): Promise<SiteVisitForm | null> {
    // This new function fetches the form associated with a visit.
    const forms = await request<any[]>(`/visits/forms/?visit=${visitId}`);
    if (forms && forms.length > 0) {
      return toSiteVisitForm(forms[0]);
    }
    return null;
  },

  async createForm(visitId: string, payload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>, isPublic: boolean = false): Promise<SiteVisitForm> {
    // NOTE: In a real app, you might need to convert payload to snake_case before sending.
    // Assuming the server can handle camelCase for now.
    // ✅ FIX: Convert client payload to snake_case first
     // ✅ FIX: Pass `!isPublic` as the `withAuth` flag.
    // If isPublic is true, withAuth will be false.
    const apiPayload = { ...toApiPayload(payload), visit: visitId };
    const data = await request<any>(`/visits/forms/`, { 
        method: 'POST',
        body: JSON.stringify(apiPayload),
    }, !isPublic);
    return toSiteVisitForm(data);
  },
  
  async updateForm(formId: string, payload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>): Promise<SiteVisitForm> {
    // We don't need to send the visitId when updating, as the form ID is in the URL.
    const apiPayload = toApiPayload(payload);
    const data = await request<any>(`/visits/forms/${formId}/`, {
      method: 'PUT', // Use PUT for a full update
      // ✅ CORRECTED LINE: Pass the snake_case apiPayload
      body: JSON.stringify(apiPayload), 
    });
    return toSiteVisitForm(data);
  },

  // ✅ Use the new helper function
    async exportCsv() {
        await requestAndDownloadCsv('/visits/export_csv/', 'site_visits.csv');
    },

    async generateShareCode(visitId: string): Promise<SiteVisit> {
        // This assumes a backend endpoint exists to generate and save the code/expiry
        const data = await request<any>(`/visits/${visitId}/generate_share_code/`, { 
            method: 'POST' 
        });
        return toVisit(data);
    },

};

const tickets = {
  async list(): Promise<Ticket[]> {
    const data = await request<any[]>('/support/tickets/');
    return data.map(toTicket);
  },
  async getById(id: string): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${id}/`);
    return toTicket(data);
  },
  async create(payload: {
    shop_owner_id?: string;
    title: string;
    subject: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    attachments?: File[];
  }): Promise<Ticket> {
    const form = new FormData();
    if (payload.shop_owner_id) form.append('shop_owner_id', payload.shop_owner_id);
    form.append('title', payload.title);
    form.append('subject', payload.subject);
    form.append('description', payload.description);
    if (payload.priority) form.append('priority', payload.priority);
    for (const f of payload.attachments || []) form.append('attachments', f);

    const token = getAccess();
    const res = await fetch(`${API_BASE}/support/tickets/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    const json = await res.json();
    return toTicket(json);
  },
  async postMessage(ticketId: string, payload: { content: string; attachment?: File }): Promise<ChatMessage> {
    const form = new FormData();
    form.append('ticket', ticketId);
    form.append('content', payload.content);
    if (payload.attachment) form.append('attachment', payload.attachment);

    const token = getAccess();
    const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    const json = await res.json();
    return toMessage(json);
  },
  async listMessages(ticketId: string): Promise<ChatMessage[]> {
    const data = await request<any[]>(`/support/tickets/${ticketId}/messages/`);
    return data.map(toMessage);
  },

  // THIS IS THE MISSING FUNCTION
  async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${ticketId}/`, {
      method: 'PATCH', // Use PATCH for partial updates
      body: JSON.stringify({ status }),
    });
    return toTicket(data);
  },

  async updatePriority(ticketId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${ticketId}/`, {
      method: 'PATCH', // Use PATCH for partial updates
      body: JSON.stringify({ priority }),
    });
    return toTicket(data);
  },
};

const site = {
  async health() {
    return request<{ status: string }>('/site/health', { method: 'GET' }, false);
  },
};

const core = {
  async getProvinces(): Promise<Province[]> {
    const data = await request<Province[]>('/provinces/');
    return data;
  }
};

// ==================================================================
// ✅ ADD 'users' TO THE EXPORTED OBJECT
// ==================================================================
const mockApi = {
  auth,
  users, // <-- ADD THIS LINE
  shops,
  documents,
  tickets,
  visits,
  site,
  core,
  reports
};

export default mockApi;