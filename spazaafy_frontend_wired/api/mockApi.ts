
// api/mockApi.ts — FULL FILE

import {
  User, UserRole, SpazaShop, ShopDocument, DocumentStatus, Ticket,
  TicketStatus, ChatMessage, SiteVisit, SiteVisitStatus, Province, SiteVisitForm,
  AssistanceRequest, AssistanceStatus
} from '../types';

const RAW_BASE = (import.meta as any)?.env?.VITE_API_BASE;

let apiBase;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    apiBase = RAW_BASE || 'http://localhost:8000/api';
} else {
    apiBase = '/api';
}
export const API_BASE = apiBase.replace(/\/+$/, '');

function parseApiError(errorText: string): string {
    const genericMessage = "An unexpected error occurred. Please check your connection and try again.";

    try {
        const parsed = JSON.parse(errorText);
        
        if (typeof parsed.detail === 'string') {
            return parsed.detail;
        }
        if (Array.isArray(parsed.non_field_errors) && parsed.non_field_errors.length > 0) {
            return parsed.non_field_errors[0];
        }
        if (typeof parsed === 'object' && parsed !== null) {
            const firstErrorKey = Object.keys(parsed)[0];
            if (firstErrorKey && Array.isArray(parsed[firstErrorKey]) && parsed[firstErrorKey].length > 0) {
                return parsed[firstErrorKey][0];
            }
        }
    } catch (e) {
        if (errorText.includes("Not Found")) {
            return "The requested resource could not be found.";
        }
        if (errorText.includes("Server Error")) {
            return "The server encountered an error. Please try again later.";
        }
    }

    return genericMessage;
}

function toAssistanceRequest(r: any): AssistanceRequest {
    return {
        id: String(r.id),
        referenceCode: String(r.reference_code),
        shopName: String(r.shop_name),
        ownerName: `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim(),
        ownerEmail: String(r.user?.email || ''),
        ownerPhone: String(r.user?.phone || ''),
        assistanceType: String(r.assistance_type),
        comments: String(r.comments),
        status: r.status as AssistanceStatus,
        createdAt: String(r.created_at || new Date().toISOString())
    };
}

type LoginResponse = {
  user: any;
  access: string;
  refresh: string;
};

async function requestAndDownloadCsv(url: string, filename: string) {
  let token = getAccess();
  let headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
  let response = await fetch(`${API_BASE}${url}`, { headers });

  if (response.status === 401) {
    console.log("Token expired for CSV download, attempting refresh...");
    try {
      await auth.refresh();
      token = getAccess();
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(`${API_BASE}${url}`, { headers });
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

function toUserRole(apiRole?: string): UserRole {
  const r = String(apiRole || '').toLowerCase();
  if (r === 'owner') return UserRole.SHOP_OWNER;
  if (r === 'consumer') return UserRole.CONSUMER;
  if (r === 'admin') return UserRole.ADMIN;
  return UserRole.CONSUMER;
}

function toUser(u: any): User {
  return {
    id: String(u.id ?? u.user_id ?? ''),
    email: String(u.email ?? ''),
    firstName: String(u.first_name ?? u.firstName ?? ''),
    lastName: String(u.last_name ?? u.lastName ?? ''),
    phone: u.phone ? String(u.phone) : undefined,
    role: toUserRole(u.role),
    dateJoined: u.date_joined ?? u.dateJoined ?? undefined,
  };
}

function toDocStatus(s?: string): DocumentStatus {
  switch (String(s || '').toUpperCase()) {
    case 'VERIFIED': return DocumentStatus.VERIFIED;
    case 'REJECTED': return DocumentStatus.REJECTED;
    default: return DocumentStatus.PENDING;
  }
}

function toVisitStatus(s?: string): SiteVisitStatus {
  switch (String(s || '').toUpperCase()) {
    case 'COMPLETED': return SiteVisitStatus.APPROVED;
    case 'SCHEDULED': return SiteVisitStatus.SCHEDULED;
    case 'CANCELLED': 
    case 'REJECTED': return SiteVisitStatus.REJECTED;
    case 'EXPIRED': return SiteVisitStatus.EXPIRED;
    case 'PENDING':
    case 'IN_PROGRESS': return SiteVisitStatus.PENDING;
    default: return SiteVisitStatus.PENDING;
  }
}

function toVisit(v: any): SiteVisit {
    return {
        id: String(v.id),
        shopId: String(v.shop ?? v.shop_id ?? ''),
        shopName: String(v.shop_name ?? v.shopName ?? v.shop?.name ?? v.shop ?? ''),
        requestedDateTime: String(v.requested_datetime ?? v.requestedDateTime ?? ''),
        status: toVisitStatus(v.status),
        updatedAt: String(v.updated_at ?? v.updatedAt ?? v.requested_datetime ?? new Date().toISOString()), 
        applicationForm: v.application_form ? { name: v.application_form.name, url: v.application_form.url, type: v.application_form.type, size: v.application_form.size } : undefined,
        shareCode: String(v.share_code ?? v.shareCode ?? ''),
        shareCodeExpiresAt: String(v.share_code_expires_at ?? v.shareCodeExpiresAt ?? ''),
    };
}

function toShop(s: any): SpazaShop {
  let latitude = 0, longitude = 0;
  if (typeof s.location === 'string') {
    const match = s.location.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (match?.length === 3) {
      longitude = parseFloat(match[1]);
      latitude = parseFloat(match[2]);
    }
  } else if (s.location?.coordinates?.length === 2) {
    longitude = Number(s.location.coordinates[0]);
    latitude = Number(s.location.coordinates[1]);
  } else if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
    latitude = s.latitude;
    longitude = s.longitude;
  }
  return {
    id: String(s.id ?? ''), 
    ownerId: String(s.owner ?? s.owner_id ?? ''),
    email: String(s.email ?? ''),
    firstName: String(s.first_name ?? s.firstName ?? ''),
    lastName: String(s.last_name ?? s.lastName ?? ''),
    phone: s.phone ? String(s.phone) : undefined,
    role: UserRole.SHOP_OWNER,
    shopName: String(s.name ?? s.shop_name ?? s.shopName ?? ''),
    isVerified: Boolean(s.verified ?? s.is_verified ?? false),
    location: { lat: latitude, lng: longitude, address: String(s.address ?? '') },
    distance: Number(s.distance ?? 0),
    registeredAt: String(s.registered_at ?? s.created_at ?? new Date().toISOString()),
    province: s.province ? { id: s.province.id, name: s.province.name } : { id: 0, name: 'N/A' }
  };
}

function toDocument(d: any): ShopDocument {
  const submissionDate = d.created_at || d.submitted_at || d.uploaded_at || null;
  return {
    id: String(d.id),
    shopOwnerId: String(d.shop ?? d.shop_owner ?? d.shopOwnerId ?? d.owner_id ?? ''),
    shopName: String(d.shop_details?.name ?? d.shop_name ?? d.shopName ?? d.shop?.name ?? d.shop ?? ''),
    name: String(d.name ?? d.display_name ?? d.document_name ?? ''),
    type: String(d.type ?? d.document_type ?? ''),
    status: toDocStatus(d.status),
    submittedAt: submissionDate ? String(submissionDate) : null,
    expiryDate: d.expiry_date ? String(d.expiry_date) : null,
    fileUrl: d.fileUrl || undefined, 
  };
}

function toTicket(t: any): Ticket {
  const toTicketStatus = (s?: string): TicketStatus => {
    const status = String(s || 'OPEN').toUpperCase();
    return Object.values(TicketStatus).includes(status as TicketStatus) ? status as TicketStatus : TicketStatus.OPEN;
  };
  return {
    id: String(t.id),
    shopId: t.shop_id ? String(t.shop_id) : t.shopId ?? undefined,
    shopName: String(t.shop_name ?? t.shopName ?? t.user?.spazashop?.name ?? ''),
    createdByUserId: String(t.user?.id ?? ''),
    submitterName: `${t.user?.first_name || ''} ${t.user?.last_name || 'Unknown User'}`.trim(),
    submitterRole: toUserRole(t.user?.role),
    submitterEmail: String(t.user?.email ?? ''),
    assignedToUserId: t.assigned_to ? String(t.assigned_to) : t.assignedToUserId ?? null,
    title: String(t.title ?? ''),
    subject: String(t.subject ?? ''),
    description: String(t.description ?? ''),
    status: toTicketStatus(t.status), 
    priority: t.priority ?? undefined,
    createdAt: String(t.created_at ?? t.createdAt ?? new Date().toISOString()),
    updatedAt: String(t.updated_at ?? t.updatedAt ?? new Date().toISOString()),
    lastReplyAt: t.last_reply_at ? String(t.last_reply_at) : t.lastReplyAt ?? null,
    attachments: (t.attachments || []).map((a: any) => ({ id: String(a.id ?? ''), filename: String(a.filename ?? a.name ?? ''), fileUrl: String(a.fileUrl ?? a.url ?? '') })),
    unreadForAssignee: Boolean(t.unread_for_assignee ?? false),
    unreadForCreator: Boolean(t.unread_for_creator ?? false),
  };
}

function toMessage(m: any): ChatMessage {
  let attachment = undefined;

  if (typeof m.attachment === 'string') {
      // ✅ FIX: Extract actual filename from S3 URL
      let fileName = 'Attachment';
      try {
          // Try to parse as URL to handle query params cleanly
          const urlParts = m.attachment.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          // Remove query params if present (e.g. ?AWSAccessKeyId=...)
          fileName = lastPart.split('?')[0];
          fileName = decodeURIComponent(fileName);
      } catch (e) {
          console.warn("Could not parse attachment filename", e);
      }

      attachment = { 
          name: fileName || 'Attachment', 
          url: m.attachment, 
          type: 'application/octet-stream', 
          size: 0 
      };
  } else if (m.attachment) {
      // Handle object format
      attachment = { 
          name: m.attachment.name, 
          url: m.attachment.url, 
          type: m.attachment.type, 
          size: m.attachment.size 
      };
  }

  return {
    id: String(m.id ?? ''),
    ticketId: String(m.ticket_id ?? m.ticketId ?? ''),
    senderId: String(m.sender ?? m.sender_id ?? m.senderId ?? ''),
    content: String(m.content ?? ''),
    createdAt: String(m.created_at ?? m.createdAt ?? new Date().toISOString()),
    attachment: attachment,
  };
}

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

function getAccess() { return sessionStorage.getItem('access') || localStorage.getItem('access') || ''; }
function getRefresh() { return sessionStorage.getItem('refresh'); }
function setTokens(access: string, refresh: string) {
  sessionStorage.setItem('access', access);
  sessionStorage.setItem('refresh', refresh);
}
function clearTokens() {
  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh');
}

// ✅ NEW HELPER: Detects if we are in Admin or Standard mode and redirects accordingly
function handleSessionExpiry() {
    clearTokens();
    // Check if the current URL is an admin URL
    if (window.location.hash.includes('/admin') || window.location.pathname.includes('/admin')) {
        window.location.href = '/#/admin/login';
    } else {
        window.location.href = '/#/login';
    }
}

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) { prom.reject(error); } else { prom.resolve(token); }
  });
  failedQueue = [];
};

async function request<T = any>(url: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  let headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> | undefined) };
  if (withAuth) {
    const token = getAccess();
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
  }
  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const errorText = res.status === 401 ? await res.text().catch(() => '') : '';

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
      handleSessionExpiry(); // ✅ USE HELPER
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
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch (e) {
      processQueue(e as Error, null);
      handleSessionExpiry(); // ✅ USE HELPER
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
  
  if (!res.ok) {
    const finalErrorText = await res.text().catch(() => 'Request failed');
    if (res.status === 401 && withAuth) {
        handleSessionExpiry(); // ✅ USE HELPER
        return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    const cleanMessage = parseApiError(finalErrorText);
    throw new Error(cleanMessage);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) { return (await res.json()) as T; }
  return undefined as T;
}

async function requestWithFile<T = any>(url: string, options: Omit<RequestInit, 'headers' | 'body'> & { body: FormData }): Promise<T> {
  let headers: Record<string, string> = {};
  const token = getAccess();
  if (token) { headers['Authorization'] = `Bearer ${token}`; }
  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const errorText = res.status === 401 ? await res.text().catch(() => '') : '';
  if (!res.ok && res.status === 401 && errorText.includes('token_not_valid')) {
    console.log('Token expired on file upload, attempting refresh...');
    try {
      await auth.refresh();
      const newToken = getAccess();
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch (e) {
      handleSessionExpiry(); // ✅ USE HELPER
      return Promise.reject(new Error('Session expired.'));
    }
  }
  if (!res.ok) {
    const finalErrorText = await res.text().catch(() => 'Request failed');
    const cleanMessage = parseApiError(finalErrorText);
    throw new Error(cleanMessage);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return undefined as T;
}

const auth = {
    async register(payload: any): Promise<{ detail: string }> {
        const data = await request<{ detail: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, false);
        return data;
    },
    async login(email: string, password: string): Promise<LoginResponse & { user: User }> {
        const data = await request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }, false);
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
            const data = await request<{ access: string; refresh?: string }>('/auth/token/refresh', { method: 'POST', body: JSON.stringify({ refresh }) }, false);
            if (data?.access) {
                setTokens(data.access, data.refresh || refresh);
            }
        } catch {
            clearTokens();
            sessionStorage.removeItem('user');
        }
    },
    async confirmEmailVerification(token: string): Promise<{ detail: string }> {
        return request<{ detail: string }>('/auth/verify-email/confirm/', {
            method: 'POST',
            body: JSON.stringify({ token }),
        }, false);
    },
    async requestPasswordReset(email: string): Promise<{ detail: string }> {
        return request<{ detail: string }>('/auth/password-reset/request/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }, false);
    },
    async confirmPasswordReset(payload: { token: string; password: string; password_confirm: string }): Promise<{ detail: string }> {
        return request<{ detail: string }>('/auth/password-reset/confirm/', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, false);
    },
    async requestAdminCode(email: string): Promise<void> {
        await request('/auth/request-admin-code', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }, false);
    },
    async registerAdminVerified(payload: { email: string; password: string, code: string, first_name: string, last_name: string }): Promise<{ user: User }> {
        const data = await request<{ user: any }>('/auth/register-admin-verified', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, false);
        const shaped = toUser(data.user);
        return { user: shaped };
    },

    async deleteAccount(): Promise<void> {
      // This uses your existing request helper and JWT auth
      await request('/auth/delete-account/', {
        method: 'DELETE',
      });
    },
};

const reports = {
    async exportDashboardCsv() {
        await requestAndDownloadCsv('/reports/dashboard/export-csv/', 'dashboard_summary.csv');
    },
};

const users = {
  async getAll(): Promise<User[]> {
    const data = await request<any[]>('/auth/users/');
    return data.map(toUser);
  },
  async update(userId: string, payload: Partial<User>): Promise<User> {
    const apiPayload: any = {};
    if (payload.firstName) apiPayload.first_name = payload.firstName;
    if (payload.lastName) apiPayload.last_name = payload.lastName;
    if (payload.phone) apiPayload.phone = payload.phone;
    const data = await request<any>(`/auth/users/${userId}/`, { method: 'PATCH', body: JSON.stringify(apiPayload) });
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
  async update(shopId: string, payload: Partial<SpazaShop> & { name?: string; address?: string; latitude?: number; longitude?: number }): Promise<SpazaShop> {
    const apiPayload: any = {};
    if (payload.firstName) apiPayload.first_name = payload.firstName;
    if (payload.lastName) apiPayload.last_name = payload.lastName;
    if (payload.phone) apiPayload.phone = payload.phone;
    if (payload.name) apiPayload.name = payload.name;
    if (payload.address) apiPayload.address = payload.address;
    if (payload.latitude !== undefined) apiPayload.latitude = payload.latitude;
    if (payload.longitude !== undefined) apiPayload.longitude = payload.longitude;
    const data = await request<any>(`/shops/${shopId}/`, { method: 'PATCH', body: JSON.stringify(apiPayload) });
    return toShop(data);
  },
  async exportCsv() { await requestAndDownloadCsv('/shops/export_csv/', 'spaza_shops.csv'); },
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
    form.append('file', payload.file, payload.file.name); 
    if (payload.expiry_date) { form.append('expiry_date', payload.expiry_date); }
    const json = await requestWithFile<any>('/compliance/documents/', { method: 'POST', body: form });
    return toDocument(json);
  },
  async updateStatus(id: string, action: 'verify' | 'reject', data?: { notes?: string; expiry_date?: string | null }) {
    await request(`/compliance/documents/${id}/${action}/`, { method: 'POST', body: JSON.stringify(data || {}) });
  },
  async exportCsv() { await requestAndDownloadCsv('/compliance/documents/export_csv/', 'documents.csv'); },
};

const SITE_VISIT_API_MAP: Record<string, string> = {
    'APPROVED': 'COMPLETED', 'REJECTED': 'CANCELLED', 'PENDING': 'PENDING', 'SCHEDULED': 'SCHEDULED',
};

function toApiPayload(clientPayload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>): any {
    return {
        inspector_name: clientPayload.inspectorName, inspector_surname: clientPayload.inspectorSurname, contractor_company: clientPayload.contractorCompany,
        cleanliness: clientPayload.cleanliness, inspector_notes: clientPayload.inspectorNotes, stock_rotation_observed: clientPayload.stockRotationObserved,
        fire_extinguisher_valid: clientPayload.fireExtinguisherValid, business_licence_displayed: clientPayload.businessLicenceDisplayed,
        health_certificate_displayed: clientPayload.healthCertificateDisplayed, refund_policy_visible: clientPayload.refundPolicyVisible,
        sales_record_present: clientPayload.salesRecordPresent, inventory_system_in_place: clientPayload.inventorySystemInPlace,
        food_labels_and_expiry_present: clientPayload.foodLabelsAndExpiryPresent, prices_visible: clientPayload.pricesVisible,
        notices_policies_displayed: clientPayload.noticesPoliciesDisplayed, supplier_list_present: clientPayload.supplierListPresent,
        building_plan_present: clientPayload.buildingPlanPresent, adequate_ventilation: clientPayload.adequateVentilation,
        healthy_storage_goods: clientPayload.healthyStorageGoods,
    };
}

const visits = {
    async list(): Promise<SiteVisit[]> {
        const data = await request<any[]>('/visits/');
        return data.map(toVisit);
    },
    async getById(id: string, withAuth = true): Promise<SiteVisit> {
        const data = await request<any>(`/visits/${id}/`, {}, withAuth); 
        return toVisit(data);
    },
    async requestVisit(shopId: string, requestedDateTime: string): Promise<SiteVisit> {
        const data = await request<any>('/visits/', { method: 'POST', body: JSON.stringify({ shop: shopId, requested_datetime: requestedDateTime }) });
        return toVisit(data);
    },
    async schedule(visitId: string, requestedDateTime: string): Promise<SiteVisit> {
        const data = await request<any>(`/visits/${visitId}/`, { method: 'PATCH', body: JSON.stringify({ requested_datetime: requestedDateTime, status: SITE_VISIT_API_MAP['SCHEDULED'] }) });
        return toVisit(data);
    },
    async updateStatus(visitId: string, status: SiteVisitStatus) {
        const apiStatus = SITE_VISIT_API_MAP[status.toUpperCase()] || status.toUpperCase();
        const data = await request<any>(`/visits/${visitId}/status/`, { method: 'POST', body: JSON.stringify({ status: apiStatus }) });
        return toVisit(data);
    },
    toVisitStatus,
    async getFormByVisitId(visitId: string): Promise<SiteVisitForm | null> {
        const forms = await request<any[]>(`/visits/forms/?visit=${visitId}`);
        return (forms?.length > 0) ? toSiteVisitForm(forms[0]) : null;
    },
    async createForm(visitId: string, payload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>, isPublic = false): Promise<SiteVisitForm> {
        const apiPayload = { ...toApiPayload(payload), visit: visitId };
        const data = await request<any>(`/visits/forms/`, { method: 'POST', body: JSON.stringify(apiPayload) }, !isPublic);
        return toSiteVisitForm(data);
    },
    async updateForm(formId: string, payload: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>): Promise<SiteVisitForm> {
        const apiPayload = toApiPayload(payload);
        const data = await request<any>(`/visits/forms/${formId}/`, { method: 'PUT', body: JSON.stringify(apiPayload) });
        return toSiteVisitForm(data);
    },
    async exportCsv() { await requestAndDownloadCsv('/visits/export_csv/', 'site_visits.csv'); },
    async generateShareCode(visitId: string): Promise<SiteVisit> {
        const data = await request<any>(`/visits/${visitId}/generate_share_code/`, { method: 'POST' });
        return toVisit(data);
    },
};

// ✅ ADD THIS TYPE DEFINITION
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const tickets = {
  async list(): Promise<Ticket[]> {
    const data = await request<any[]>('/support/tickets/');
    return data.map(toTicket);
  },
  async getById(id: string): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${id}/`);
    return toTicket(data);
  },
  async create(payload: any): Promise<Ticket> {
    const form = new FormData();
    Object.keys(payload).forEach(key => {
        if (key === 'attachments' && payload.attachments) {
            for (const f of payload.attachments) form.append('attachments', f);
        } else if (payload[key] !== undefined) {
            form.append(key, payload[key]);
        }
    });
    const json = await requestWithFile<any>('/support/tickets/', { method: 'POST', body: form });
    return toTicket(json);
  },
  async postMessage(ticketId: string, payload: { content: string; attachment?: File }): Promise<ChatMessage> {
    const form = new FormData();
    form.append('ticket', ticketId);
    form.append('content', payload.content);
    if (payload.attachment) form.append('attachment', payload.attachment);
    const json = await requestWithFile<any>(`/support/tickets/${ticketId}/messages/`, { method: 'POST', body: form });
    return toMessage(json);
  },
  async listMessages(ticketId: string): Promise<ChatMessage[]> {
    const data = await request<any[]>(`/support/tickets/${ticketId}/messages/`);
    return data.map(toMessage);
  },
  async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${ticketId}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
    return toTicket(data);
  },
  async updatePriority(ticketId: string, priority: Priority): Promise<Ticket> {
    const data = await request<any>(`/support/tickets/${ticketId}/`, { method: 'PATCH', body: JSON.stringify({ priority }) });
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
    const data = await request<Province[]>('/core/provinces/');
    return data;
  }
};

const assistance = {
    // For Shop Owner (Existing)
    async request(payload: { assistance_type: string; comments: string; consent: boolean }): Promise<{ detail: string; reference_code: string }> {
        return request('/support/request-assistance/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    // ✅ For Admin (New)
    async listAll(): Promise<AssistanceRequest[]> {
        // You'll need to create this endpoint in Django later or use a generic ViewSet
        // Assuming: GET /api/support/assistance-requests/
        const data = await request<any[]>('/support/assistance-requests/'); 
        return data.map(toAssistanceRequest);
    },

    async updateStatus(id: string, status: AssistanceStatus): Promise<AssistanceRequest> {
        // Assuming: PATCH /api/support/assistance-requests/{id}/
        const data = await request<any>(`/support/assistance-requests/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return toAssistanceRequest(data);
    },

    async getById(id: string): Promise<AssistanceRequest> {
        const data = await request<any>(`/support/assistance-requests/${id}/`);
        return toAssistanceRequest(data);
    },

    // New: Bulk Refer
    async refer(ids: string[], partnerName: string, partnerEmail: string): Promise<void> {
        await request('/support/assistance-requests/refer/', {
            method: 'POST',
            body: JSON.stringify({ 
                ids, 
                partner_name: partnerName, 
                partner_email: partnerEmail 
            })
        });
    },

    // ✅ New Bulk Status Update
    async bulkUpdateStatus(ids: string[], status: AssistanceStatus): Promise<void> {
        await request('/support/assistance-requests/bulk_update_status/', {
            method: 'POST',
            body: JSON.stringify({ ids, status })
        });
    }
};

const mockApi = { auth, users, shops, documents, tickets, visits, site, core, reports, assistance };

export default mockApi;