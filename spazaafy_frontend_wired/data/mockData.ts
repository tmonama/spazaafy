import { User, UserRole, SpazaShop, ShopDocument, DocumentStatus, SupportTicket, ChatMessage, Attachment, SiteVisit, SiteVisitStatus, SiteVisitForm } from '../types';

// Create some dummy files for documents
const dummyFile1 = new File([new Blob(["Mock content for Business Registration document for Fresh Finds Spaza."], { type: 'text/plain' })], "business_registration.txt", { type: "text/plain" });
const dummyFile2 = new File([new Blob(["Mock content for Certificate of Acceptability document."], { type: 'text/plain' })], "coa_certificate.txt", { type: "text/plain" });
const dummyFile3 = new File([new Blob(["Mock content for Tax Compliance. This document was rejected."], { type: 'text/plain' })], "tax_compliance.txt", { type: "text/plain" });
const dummyFile4 = new File([new Blob(["Mock content for Business Registration for Soweto Supplies. This is pending review."], { type: 'text/plain' })], "soweto_business_reg.txt", { type: "text/plain" });
const dummyFile5 = new File([new Blob(["Mock content for ID Document for Community Corner."], { type: 'text/plain' })], "id_document.txt", { type: "text/plain" });


let users: User[] = [
    { id: 'user-1', email: 'consumer@spazaafy.com', firstName: 'John', lastName: 'Doe', role: UserRole.CONSUMER, phone: '0821234567' },
    { id: 'user-2', email: 'owner@spazaafy.com', firstName: 'Jane', lastName: 'Smith', role: UserRole.SHOP_OWNER, phone: '0837654321' },
    { id: 'shop-3', email: 'soweto@spazaafy.com', firstName: 'Peter', lastName: 'Jones', role: UserRole.SHOP_OWNER, phone: '0848889999' },
    { id: 'admin-1', email: 'admin@spazaafy.com', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN, phone: '0115556666' },
];

let shops: Omit<SpazaShop, 'distance'>[] = [
    { id: 'user-2', email: 'owner@spazaafy.com', firstName: 'Jane', lastName: 'Smith', role: UserRole.SHOP_OWNER, phone: '0837654321', shopName: 'Fresh Finds Spaza', isVerified: true, location: { lat: -26.2041, lng: 28.0473, address: '123 Main St, Johannesburg' }, registeredAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'shop-3', email: 'soweto@spazaafy.com', firstName: 'Peter', lastName: 'Jones', role: UserRole.SHOP_OWNER, phone: '0848889999', shopName: 'Soweto Supplies', isVerified: false, location: { lat: -26.2662, lng: 27.8536, address: '789 Vilakazi St, Soweto' }, registeredAt: new Date(Date.now() - 0.5 * 365 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'shop-4', email: 'shop4@example.com', firstName: 'Shop', lastName: 'Four', role: UserRole.SHOP_OWNER, phone: '0812223333', shopName: 'Community Corner', isVerified: false, location: { lat: -26.2055, lng: 28.0489, address: '456 Market St, Johannesburg' }, registeredAt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'shop-5', email: 'shop5@example.com', firstName: 'Shop', lastName: 'Five', role: UserRole.SHOP_OWNER, phone: '0814445555', shopName: 'Daily Needs', isVerified: true, location: { lat: -26.1999, lng: 28.0401, address: '101 First Ave, Johannesburg' }, registeredAt: new Date(Date.now() - 0.2 * 365 * 24 * 60 * 60 * 1000).toISOString() },
];

let documents: ShopDocument[] = [
    { id: 'doc-1', shopOwnerId: 'user-2', shopName: 'Fresh Finds Spaza', name: 'Business Registration Certificate', status: DocumentStatus.VERIFIED, submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), file: dummyFile1 },
    { id: 'doc-2', shopOwnerId: 'user-2', shopName: 'Fresh Finds Spaza', name: 'Certificate of Acceptability (Health)', status: DocumentStatus.VERIFIED, submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), file: dummyFile2 },
    { id: 'doc-3', shopOwnerId: 'shop-3', shopName: 'Soweto Supplies', name: 'Tax / SARS Documents', status: DocumentStatus.REJECTED, submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), file: dummyFile3 },
    { id: 'doc-4', shopOwnerId: 'shop-3', shopName: 'Soweto Supplies', name: 'Business Registration Certificate', status: DocumentStatus.PENDING, submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), file: dummyFile4 },
    { id: 'doc-5', shopOwnerId: 'shop-4', shopName: 'Community Corner', name: 'Certified ID/Passport/Permit', status: DocumentStatus.PENDING, submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), file: dummyFile5 },
];

let tickets: SupportTicket[] = [
    { id: 't-1', userId: 'user-1', title: 'Login Issue', description: 'Cannot reset my password.', status: 'Closed', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
    { id: 't-2', userId: 'user-2', title: 'Document Upload Failed', description: 'My COA document fails to upload.', status: 'Open', createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
];

let messages: ChatMessage[] = [
    { id: 'msg-1', ticketId: 't-2', senderId: 'user-2', content: 'Hello, I am having trouble uploading my Certificate of Acceptability. The system gives an error every time.', createdAt: new Date(Date.now() - 23*60*60*1000).toISOString() },
    { id: 'msg-2', ticketId: 't-2', senderId: 'admin-1', content: 'Hi Jane, sorry to hear that. Could you please describe the error message you are seeing or provide a screenshot?', createdAt: new Date(Date.now() - 22*60*60*1000).toISOString() },
    { id: 'msg-3', ticketId: 't-2', senderId: 'user-2', content: 'Sure, here is the screenshot of the error.', createdAt: new Date(Date.now() - 21*60*60*1000).toISOString(), attachment: { name: 'error_screenshot.png', type: 'image/png', size: 102400, url: '#' } },
];

let siteVisits: SiteVisit[] = [
    { id: 'sv-1', shopId: 'shop-3', shopName: 'Soweto Supplies', requestedDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: SiteVisitStatus.PENDING },
    { id: 'sv-2', shopId: 'shop-4', shopName: 'Community Corner', requestedDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: SiteVisitStatus.APPROVED },
    { id: 'sv-3', shopId: 'shop-5', shopName: 'Daily Needs', requestedDateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: SiteVisitStatus.FAILED },
];

let siteVisitForms: SiteVisitForm[] = [
    { visitId: 'sv-2', cleanliness: 'Good', stockRotationObserved: true, fireExtinguisherValid: true, businessLicenceDisplayed: false, healthCertificateDisplayed: true, inspectorNotes: 'Business licence was not displayed. Owner says it is being renewed.', submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { visitId: 'sv-3', cleanliness: 'Poor', stockRotationObserved: false, fireExtinguisherValid: false, businessLicenceDisplayed: false, healthCertificateDisplayed: false, inspectorNotes: 'Premises are not clean. Expired stock on shelves. No compliance documents visible.', submittedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
];


// In-memory database simulation
export const MOCK_DB = {
    users: {
        findAll: () => [...users],
        findBy: (field: keyof User, value: any) => users.find(u => u[field] === value),
        create: (details: Omit<User, 'id'> & { shopName?: string; address?: string }) => {
            const newUser: User = { 
                id: `user-${Date.now()}`,
                email: details.email,
                firstName: details.firstName,
                lastName: details.lastName,
                role: details.role,
                phone: details.phone,
            };
            users.push(newUser);

            if (details.role === UserRole.SHOP_OWNER && details.shopName && details.address) {
                const newShop: Omit<SpazaShop, 'distance'> = {
                    ...newUser,
                    shopName: details.shopName,
                    isVerified: false,
                    location: {
                        lat: -26.2041, // Default to Johannesburg
                        lng: 28.0473,
                        address: details.address,
                    },
                    registeredAt: new Date().toISOString()
                };
                shops.push(newShop);
            }

            return newUser;
        },
        update: (userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) => {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...data };
                // Also update the corresponding shop entry if it exists
                const shopIndex = shops.findIndex(s => s.id === userId);
                if (shopIndex !== -1) {
                    shops[shopIndex] = { ...shops[shopIndex], ...data };
                }
                return users[userIndex];
            }
            return null;
        }
    },
    shops: {
        findAll: () => [...shops],
        findById: (shopId: string) => shops.find(s => s.id === shopId),
        updateVerificationStatus: (shopId: string, isVerified: boolean) => {
            const index = shops.findIndex(s => s.id === shopId);
            if (index !== -1) {
                shops[index].isVerified = isVerified;
                return shops[index];
            }
            return null;
        },
        update: (shopId: string, data: Partial<Pick<SpazaShop, 'shopName' | 'location'>>) => {
            const shopIndex = shops.findIndex(s => s.id === shopId);
            if (shopIndex !== -1) {
                if (data.location) {
                    shops[shopIndex].location = { ...shops[shopIndex].location, ...data.location };
                }
                if (data.shopName) {
                    shops[shopIndex].shopName = data.shopName;
                }
                return shops[shopIndex];
            }
            return null;
        }
    },
    documents: {
        findAll: () => [...documents],
        findByShopOwnerId: (shopOwnerId: string) => documents.filter(d => d.shopOwnerId === shopOwnerId),
        updateStatus: (docId: string, status: DocumentStatus) => {
            const index = documents.findIndex(d => d.id === docId);
            if (index !== -1) {
                documents[index].status = status;
                return documents[index];
            }
            return null;
        },
        create: (doc: Omit<ShopDocument, 'id' | 'status' | 'submittedAt'> & { file: File }) => {
            const newDoc: ShopDocument = {
                id: `doc-${Date.now()}`,
                name: doc.name,
                shopOwnerId: doc.shopOwnerId,
                shopName: doc.shopName,
                status: DocumentStatus.PENDING,
                submittedAt: new Date().toISOString(),
                file: doc.file,
            };
            documents.push(newDoc);
            return newDoc;
        }
    },
    tickets: {
        findAll: () => [...tickets],
        findById: (ticketId: string) => tickets.find(t => t.id === ticketId),
        updateStatus: (ticketId: string, status: 'Open' | 'Closed') => {
            const index = tickets.findIndex(t => t.id === ticketId);
            if (index !== -1) {
                tickets[index].status = status;
                return tickets[index];
            }
            return null;
        },
    },
    messages: {
        findByTicketId: (ticketId: string) => messages.filter(m => m.ticketId === ticketId),
        create: (data: Omit<ChatMessage, 'id' | 'createdAt'>) => {
            const newMessage: ChatMessage = {
                ...data,
                id: `msg-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            messages.push(newMessage);
            return newMessage;
        }
    },
    siteVisits: {
        findAll: () => [...siteVisits],
        findById: (id: string) => siteVisits.find(v => v.id === id),
        findByShopId: (shopId: string) => siteVisits.find(v => v.shopId === shopId),
        create: (data: Omit<SiteVisit, 'id' | 'status'>) => {
            const newVisit: SiteVisit = {
                ...data,
                id: `sv-${Date.now()}`,
                status: SiteVisitStatus.PENDING
            };
            // Remove any previous visit requests for this shop
            siteVisits = siteVisits.filter(v => v.shopId !== data.shopId);
            siteVisits.push(newVisit);
            return newVisit;
        },
        updateStatus: (id: string, status: SiteVisitStatus) => {
            const index = siteVisits.findIndex(v => v.id === id);
            if (index !== -1) {
                siteVisits[index].status = status;
                return siteVisits[index];
            }
            return null;
        },
        addApplicationForm: (visitId: string, file: File) => {
            const index = siteVisits.findIndex(v => v.id === visitId);
            if (index !== -1) {
                const attachment: Attachment = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: URL.createObjectURL(file), // Create a blob URL for viewing
                };
                siteVisits[index].applicationForm = attachment;
                return siteVisits[index];
            }
            return null;
        }
    },
    siteVisitForms: {
        findByVisitId: (visitId: string) => siteVisitForms.find(f => f.visitId === visitId),
        createOrUpdate: (data: Omit<SiteVisitForm, 'submittedAt'>) => {
            const index = siteVisitForms.findIndex(f => f.visitId === data.visitId);
            const newForm: SiteVisitForm = {
                ...data,
                submittedAt: new Date().toISOString(),
            };
            if (index !== -1) {
                siteVisitForms[index] = newForm;
            } else {
                siteVisitForms.push(newForm);
            }
            return newForm;
        }
    }
};