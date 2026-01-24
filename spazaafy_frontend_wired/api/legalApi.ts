import { API_BASE } from './mockApi'; // Or wherever your base is defined

export const legalApi = {
  submitRequest: async (formData: FormData) => {
    // Note: Use FormData for file uploads
    const res = await fetch(`${API_BASE}/legal/submit/`, {
        method: 'POST',
        body: formData, // No Content-Type header; browser sets boundary
    });
    if (!res.ok) throw new Error("Submission failed");
    return res.json();
  },

  // Admin methods (requiring auth token)
  getAllRequests: async (token: string) => {
    const res = await fetch(`${API_BASE}/legal/admin/requests/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  updateStatus: async (id: string, status: string, note: string, token: string) => {
    const res = await fetch(`${API_BASE}/legal/admin/requests/${id}/update_status/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, note })
    });
    return res.json();
  },

  // ✅ NEW: Submit Amendment
  submitAmendment: async (token: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}/legal/public/upload-amendment/${token}/`, {
        method: 'PUT', // Uses PUT as per GenericAPIView logic for updates, or PATCH
        body: formData, // Browser handles boundary
    });
    if (!res.ok) throw new Error("Upload failed. Link may be expired.");
    return res.json();
  }
};