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
} from '../types';

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE?.replace(/\/+$/, '') ||
  'http://localhost:8000/api';

type LoginResponse = {
  user: any;
  access: string;
  refresh: string;
};

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
    case 'APPROVED':
      return DocumentStatus.VERIFIED;
    case 'REJECTED':
      return DocumentStatus.REJECTED;
    default:
      return DocumentStatus.PENDING;
  }
}

function toVisitStatus(s?: string): SiteVisitStatus {
  switch (String(s || '').toUpperCase()) {
    case 'APPROVED':
      return SiteVisitStatus.APPROVED;
    case 'REJECTED':
      return SiteVisitStatus.REJECTED;
    default:
      return SiteVisitStatus.PENDING;
  }
}

function toShop(s: any): SpazaShop {
  return {
    id: String(s.owner_id ?? s.user_id ?? s.id ?? ''),
    email: String(s.email ?? ''),
    firstName: String(s.first_name ?? s.firstName ?? ''),
    lastName: String(s.last_name ?? s.lastName ?? ''),
    phone: s.phone ? String(s.phone) : undefined,
    role: UserRole.SHOP_OWNER,
    shopName: String(s.name ?? s.shop_name ?? s.shopName ?? ''),
    isVerified: Boolean(s.is_verified ?? s.verified ?? false),
    location: {
      lat: Number(s.latitude ?? s.location?.coordinates?.[1] ?? 0),
      lng: Number(s.longitude ?? s.location?.coordinates?.[0] ?? 0),
      address: String(s.address ?? s.location?.address ?? ''),
    },
    distance: Number(s.distance ?? 0),
    registeredAt: String(s.registered_at ?? s.created_at ?? new Date().toISOString()),
  };
}

function toDocument(d: any): ShopDocument {
  return {
    id: String(d.id),
    shopOwnerId: String(d.shop ?? d.shop_owner ?? d.shopOwnerId ?? d.owner_id ?? ''),
    shopName: String(d.shop_details?.name ?? d.shop_name ?? d.shopName ?? ''),
    name: String(d.name ?? d.display_name ?? d.document_name ?? ''),
    type: String(d.type ?? d.document_type ?? ''),
    status: toDocStatus(d.status),
    submittedAt: d.submitted_at ? String(d.submitted_at) : d.created_at ? String(d.created_at) : null,
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
    createdByUserId: String(t.created_by ?? t.createdByUserId ?? ''),
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
    id: String(m.id),
    ticketId: String(m.ticket_id ?? m.ticketId ?? ''),
    senderId: String(m.sender_id ?? m.senderId ?? ''),
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

// ---------- token helpers ----------
function getAccess() {
  return sessionStorage.getItem('access') || localStorage.getItem('access') || '';
}
function setTokens(access: string, refresh: string) {
  sessionStorage.setItem('access', access);
  sessionStorage.setItem('refresh', refresh);
}
function clearTokens() {
  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh');
}

// ---------- generic request ----------
async function request<T = any>(
  url: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (withAuth) {
    const token = getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text || 'Request failed'}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return (await res.json()) as T;
  // allow empty body
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
};

// ==================================================================
// ✅ ADD THIS NEW 'users' OBJECT
// ==================================================================
const users = {
  async update(userId: string, payload: Partial<User>): Promise<User> {
    // This would be a PATCH request to `/users/${userId}` in a real API
    console.log(`Mock API: Updating user ${userId}`, payload);
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...payload };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    return toUser(updatedUser);
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
  async update(shopId: string, payload: Partial<SpazaShop>): Promise<SpazaShop> {
    // This would be a PATCH request to `/shops/${shopId}` in a real API
    console.log(`Mock API: Updating shop ${shopId}`, payload);
    const currentShop = await toShop(request<any>(`/shops/${shopId}/`));
    const updatedShop = { ...currentShop, ...payload };
    // We can't update the backend, so we just return the merged object
    return updatedShop;
  }
};

const documents = {
  async list(): Promise<ShopDocument[]> {
    const data = await request<any[]>('/compliance/documents/');
    return data.map(toDocument);
  },
  async upload(shopOwnerId: string, payload: { name: string; type: string; file: File; expiry_date?: string | null }) {
    const form = new FormData();
    form.append('shop_owner', shopOwnerId);
    form.append('name', payload.name);
    form.append('type', payload.type);
    form.append('file', payload.file);
    if (payload.expiry_date) form.append('expiry_date', payload.expiry_date);

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
  async verify(id: string, action: 'verify' | 'reject', notes?: string) {
    await request(`/compliance/documents/${id}/${action}/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
};

const visits = {
  async requestVisit(shopId: string, requestedDateTime: string): Promise<SiteVisit> {
    const data = await request<any>('/visits/', {
      method: 'POST',
      body: JSON.stringify({ shop_id: shopId, requested_datetime: requestedDateTime }),
    });
    return {
      id: String(data.id),
      shopId: String(data.shop_id ?? shopId),
      shopName: String(data.shop_name ?? ''),
      requestedDateTime: String(data.requested_datetime ?? requestedDateTime),
      status: toVisitStatus(data.status),
      applicationForm: data.application_form
        ? {
            name: data.application_form.name,
            url: data.application_form.url,
            type: data.application_form.type,
            size: data.application_form.size,
          }
        : undefined,
    };
  },
  async list(): Promise<SiteVisit[]> {
    const data = await request<any[]>('/visits/');
    return data.map((v) => ({
      id: String(v.id),
      shopId: String(v.shop_id ?? ''),
      shopName: String(v.shop_name ?? ''),
      requestedDateTime: String(v.requested_datetime ?? v.requestedDateTime ?? ''),
      status: toVisitStatus(v.status),
      applicationForm: v.application_form
        ? {
            name: v.application_form.name,
            url: v.application_form.url,
            type: v.application_form.type,
            size: v.application_form.size,
          }
        : undefined,
    }));
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
    form.append('ticket_id', ticketId);
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
};

const site = {
  async health() {
    return request<{ status: string }>('/site/health', { method: 'GET' }, false);
  },
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
};

export default mockApi;