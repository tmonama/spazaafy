// types.ts

export enum UserRole {
  CONSUMER = 'consumer',
  SHOP_OWNER = 'shop_owner',
  ADMIN = 'admin',
}

declare global {
  interface Window {
    google: any;
  }
}

export enum DocumentStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected',
}

export enum SiteVisitStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

// SpazaShop now correctly includes all User properties via `extends`
export interface SpazaShop extends User {
  shopName: string;
  isVerified: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
  registeredAt: string;
}

export interface ShopDocument {
  id: string;
  shopOwnerId: string;
  shopName: string;
  name: string;
  type: string;
  status: DocumentStatus;
  submittedAt: string | null;
  expiryDate: string | null;
  fileUrl?: string;
}

// REMOVED old SupportTicket type. We will only use the new `Ticket` type below.

export interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: string;
  attachment?: Attachment;
}

export interface SiteVisit {
  id: string;
  shopId: string;
  shopName: string;
  requestedDateTime: string;
  status: SiteVisitStatus;
  applicationForm?: Attachment;
}

export interface SiteVisitForm {
  visitId: string;
  cleanliness: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  stockRotationObserved: boolean;
  fireExtinguisherValid: boolean;
  businessLicenceDisplayed: boolean;
  healthCertificateDisplayed: boolean;
  inspectorNotes: string;
  submittedAt: string;
}

export type Theme = 'light' | 'dark';

// --- The single, correct definition for a support ticket ---
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export type TicketAttachment = {
  id: string;
  filename: string;
  fileUrl: string;
};

export type Ticket = {
  id: string;
  shopId?: string;
  shopName?: string;
  createdByUserId: string;
  assignedToUserId?: string | null;
  title: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string | null;
  attachments?: TicketAttachment[];
  unreadForAssignee?: boolean;
  unreadForCreator?: boolean;
};