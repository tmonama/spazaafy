import { API_BASE } from './mockApi'; 

// Helper for standard JSON requests
async function request(url: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    
    // Handle Errors
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }

    // Handle 204 No Content (Common for DELETE)
    if (res.status === 204) {
        return {};
    }

    // Handle JSON parsing safely
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}

// Helper for File Uploads (FormData)
async function requestWithFile(url: string, options: RequestInit = {}) {
    // Note: We do NOT set 'Content-Type' here, the browser sets it with the boundary for FormData
    const res = await fetch(`${API_BASE}${url}`, options);
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export const hrApi = {
    // --- Public ---
    submitJobRequest: async (data: any) => {
        return request('/hr/public/request-hiring/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    
    // Uses requestWithFile for FormData
    submitApplication: async (formData: FormData) => {
        return requestWithFile('/hr/public/apply/', {
            method: 'POST',
            body: formData 
        });
    },

    signupTraining: async (data: any) => {
        return request('/hr/public/training-signup/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    getPublicJobDetails: async (id: string) => {
        return request(`/hr/public/jobs/${id}/`);
    },

    getPublicTrainingDetails: async (id: string) => {
        return request(`/hr/public/training/${id}/`);
    },

    // --- Admin (Hiring) ---
    getHiringRequests: async (token: string) => {
        return request('/hr/admin/hiring/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    openApplications: async (id: string, days: number, description: string, token: string) => {
        return request(`/hr/admin/hiring/${id}/open_applications/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ days, job_description: description })
        });
    },
    getApplications: async (token: string) => {
        return request('/hr/admin/applications/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    scheduleInterview: async (appId: string, date_time: string, type: string, location: string, notes: string, token: string) => {
        return request(`/hr/admin/applications/${appId}/schedule_interview/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ date_time, type, location, notes })
        });
    },
    selectCandidate: async (appId: string, token: string) => {
        return request(`/hr/admin/applications/${appId}/select_candidate/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    getHiringRequestById: async (id: string, token: string) => {
        return request(`/hr/admin/hiring/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    bulkUpdateApplications: async (ids: string[], status: string, token: string) => {
        return request(`/hr/admin/applications/bulk_update_status/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ids, status })
        });
    },

    // --- Admin (Employees) ---
    getEmployees: async (token: string) => {
        return request('/hr/admin/employees/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    updateHiringRequest: async (id: string, data: any, token: string) => {
        return request(`/hr/admin/hiring/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    // Uses requestWithFile for FormData
    createEmployee: async (formData: FormData, token: string) => {
        return requestWithFile('/hr/admin/employees/', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
    },

    updateEmployeeStatus: async (id: string, status: string, token: string, extraData: any = {}) => {
        return request(`/hr/admin/employees/${id}/update_status/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status, ...extraData })
        });
    },

    // ✅ Deletion fixed by updated 'request' function
    deleteEmployee: async (id: string, token: string) => {
        return request(`/hr/admin/employees/${id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    getEmployeeById: async (id: string, token: string) => {
        return request(`/hr/admin/employees/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Uses requestWithFile for FormData
    uploadEmployeePhoto: async (id: string, file: File, token: string) => {
        const formData = new FormData();
        formData.append('photo', file);
        return requestWithFile(`/hr/admin/employees/${id}/upload_photo/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, 
            body: formData
        });
    },

    // --- Terminations & Promotions ---
    initiateTermination: async (id: string, reason: string, token: string) => {
        return request(`/hr/admin/employees/${id}/initiate_termination/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reason })
        });
    },
    finalizeTermination: async (id: string, token: string) => {
        return request(`/hr/admin/employees/${id}/finalize_termination/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    promoteTransferEmployee: async (id: string, data: { type: 'PROMOTION' | 'TRANSFER', department: string, role_title: string, reason: string }, token: string) => {
        return request(`/hr/admin/employees/${id}/promote_transfer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    // --- Admin (Training) ---
    getTrainings: async (token: string) => {
        return request('/hr/admin/training/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    createTraining: async (data: any, token: string) => {
        return request('/hr/admin/training/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },
    updateTrainingSession: async (id: string, data: any, token: string) => {
        return request(`/hr/admin/training/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },
    markAttendance: async (sessionId: string, employeeIds: string[], token: string) => {
        return request(`/hr/admin/training/${sessionId}/mark_attendance/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ employee_ids: employeeIds })
        });
    },
    getTrainingById: async (id: string, token: string) => {
        return request(`/hr/admin/training/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // --- Admin (Complaints) ---
    getComplaints: async (token: string) => {
        return request('/hr/admin/complaints/', { headers: { Authorization: `Bearer ${token}` } });
    },

    getComplaintById: async (id: string, token: string) => {
        return request(`/hr/admin/complaints/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    markComplaintInvestigating: async (id: string, token: string) => {
        return request(`/hr/admin/complaints/${id}/mark_investigating/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Uses requestWithFile for FormData
    closeComplaint: async (id: string, formData: FormData, token: string) => {
        return requestWithFile(`/hr/admin/complaints/${id}/close_complaint/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, 
            body: formData
        });
    },

    // --- Admin (Announcements) ---
    getAnnouncements: async (token: string) => {
        return request('/hr/admin/announcements/', {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    createAnnouncement: async (data: { title: string; content: string }, token: string) => {
        return request('/hr/admin/announcements/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },

    updateAnnouncement: async (id: string, data: { title: string; content: string }, token: string) => {
        return request(`/hr/admin/announcements/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    },
    
    deleteAnnouncement: async (id: string, token: string) => {
        return request(`/hr/admin/announcements/${id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};