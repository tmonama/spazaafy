// types.ts

export enum UserRole {
  CONSUMER = 'consumer',
  SHOP_OWNER = 'shop_owner',
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  TECH_ADMIN = "TECH_ADMIN",
  HR_ADMIN = "HR_ADMIN",
  LEGAL_ADMIN = "LEGAL_ADMIN",
  FIELD_ADMIN = "FIELD_ADMIN",
  SUPPORT_ADMIN = "SUPPORT_ADMIN",
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
  SCHEDULED = 'Scheduled',
  EXPIRED = 'Expired', 
}

export type Department =
  | "TECH"
  | "HR"
  | "LEGAL"
  | "SUPPORT"
  | "FIELD"
  | "FINANCE"
  | "EXECUTIVE"
  | "SALES"
  | "MARKETING";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  dateJoined?: string;
  department?: Department | null;
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
  ownerId: string;
  province: Province; // <-- ADD THIS LINE
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
  uploadLat?: number;
  uploadLng?: number;
  uploadAccuracy?: number; 
  rejectionReason?: string;
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
  updatedAt: string; 
  applicationForm?: Attachment;

  shareCode?: string; // Optional: The generated code
  shareCodeExpiresAt?: string; // Optional: When the code expires
}

export interface SiteVisitForm {
  id: string;
  visitId: string;
  inspectorName: string;
  inspectorSurname: string;
  contractorCompany: string;
  cleanliness: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  stockRotationObserved: boolean;
  fireExtinguisherValid: boolean;
  businessLicenceDisplayed: boolean;
  healthCertificateDisplayed: boolean;

  refundPolicyVisible: boolean;
  salesRecordPresent: boolean;
  inventorySystemInPlace: boolean;
  foodLabelsAndExpiryPresent: boolean;
  pricesVisible: boolean;
  noticesPoliciesDisplayed: boolean;
  supplierListPresent: boolean;
  buildingPlanPresent: boolean;
  adequateVentilation: boolean;
  healthyStorageGoods: boolean;
  
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

  // ✅ ADD THESE NEW OPTIONAL FIELDS
  submitterName?: string;
  submitterRole?: UserRole;
  submitterEmail?: string;
};

export interface Province {
  id: number; 
  name: string;
}

export type AssistanceStatus = 'PENDING' | 'REFERRED' | 'IN_PROGRESS' | 'COMPLETED' | 'COMMISSION_PAID' | 'CANCELLED';

export interface AssistanceRequest {
  id: string;
  referenceCode: string;
  shopName: string;
  ownerName: string; // derived from user.first_name + user.last_name
  ownerEmail: string;
  ownerPhone?: string;
  assistanceType: string;
  comments: string;
  status: AssistanceStatus;
  createdAt: string;
}