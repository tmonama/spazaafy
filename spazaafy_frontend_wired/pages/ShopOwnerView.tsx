import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SpazaShop, ShopDocument, SiteVisit, SiteVisitStatus } from '../types';
import mockApi from '../api/mockApi';
import Card from '../components/Card';
import DocumentUploadItem from '../components/DocumentUploadItem';
import RequiredDocumentSlot from '../components/RequiredDocumentSlot';
import Button from '../components/Button';
import { REQUIRED_DOCS, NAME_TO_TYPE } from '../constants';

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8000';

function reverseNameFromType(typeCode: string): string {
  const match = Object.entries(NAME_TO_TYPE).find(([, code]) => code === typeCode);
  return match?.[0] || typeCode;
}

function mapVisitStatus(apiStatus: string): SiteVisitStatus {
  switch ((apiStatus || '').toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED': // Add APPROVED as a valid status
      return SiteVisitStatus.APPROVED;
    case 'SCHEDULED':
    case 'IN_PROGRESS':
    case 'PENDING': // Add PENDING as a valid status
      return SiteVisitStatus.PENDING;
    case 'CANCELLED':
    case 'REJECTED': // Add REJECTED as a valid status
      return SiteVisitStatus.REJECTED;
    default:
      return SiteVisitStatus.PENDING;
  }
}

const ShopOwnerView: React.FC = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Omit<SpazaShop, 'distance'> | null>(null);
  const [documents, setDocuments] = useState<ShopDocument[]>([]);
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isOwner = useMemo(() => !!user && user.role === 'shop_owner', [user]);

  const fetchShopData = async () => {
    if (!user) return;
    try {
      // For simplicity, assuming the first shop belongs to the logged-in owner.
      // In a real app, you'd fetch the specific shop for the user.
      const allShops = await mockApi.shops.getAll();
      const myShop = allShops.find(s => s.id === user.id) || allShops?.[0] || null;
      setShop(myShop);
      if (!myShop) return;

      const apiDocs = await mockApi.documents.list();
      const myDocs = apiDocs.filter((d: any) => String(d.shopOwnerId) === String(myShop.id));
      setDocuments(myDocs);

      // ✅ FIX 1: Changed mockApi.siteVisits to mockApi.visits
      const visits = await mockApi.visits.list();
      const myVisitRaw = visits.find((v: any) => String(v.shopId) === String(myShop.id));
      
      const myVisit: SiteVisit | null = myVisitRaw ? {
        ...myVisitRaw,
        status: mapVisitStatus(myVisitRaw.status as any),
      } : null;
      setSiteVisit(myVisit);

    } catch (e) {
      console.error("Failed to fetch shop data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      setLoading(true);
      fetchShopData();
    } else {
      setLoading(false);
    }
  }, [isOwner]);

  const handleDocumentUpload = async (documentName: string, file: File) => {
    if (!user || !shop) return;
    const typeCode = NAME_TO_TYPE[documentName];
    if (!typeCode) return alert(`Unknown document type: ${documentName}`);

    try {
      // ✅ FIX 2: Correctly passing arguments to the upload function
      await mockApi.documents.upload(String(shop.id), { name: documentName, type: typeCode, file });
      await fetchShopData(); 
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Upload failed');
    }
  };

  const handleRequestVisit = async () => {
    if (!user || !shop) return;
    try {
      // ✅ FIX 3: Changed mockApi.siteVisits.create to mockApi.visits.requestVisit
      await mockApi.visits.requestVisit(String(shop.id), new Date().toISOString());
      await fetchShopData();
      alert('Site visit has been requested. An inspector will be in touch.');
    } catch (e) {
      console.error(e);
      alert('Failed to request site visit.');
    }
  };

  if (!isOwner) return <p>Owner view is only available to shop owners.</p>;
  if (loading) return <p>Loading shop details...</p>;
  if (!shop) return <p>No shop found for your account.</p>;

  const submittedDocNames = documents.map((doc) => doc.name);
  const unsubmittedDocs = REQUIRED_DOCS.filter((name) => !submittedDocNames.includes(name));

  return (
    <div className="space-y-8">
      <Card title={`Welcome, ${shop.shopName}`}>
        <p className="text-gray-600 dark:text-gray-400">Manage your shop's compliance and verification status here.</p>
        <div className={`mt-4 p-3 rounded-md text-sm ${shop.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'}`}>
          Verification Status: <span className="font-bold">{shop.isVerified ? 'Verified' : 'Pending Verification'}</span>
        </div>
      </Card>
      <Card title="Required Documents">
        <div className="space-y-3">
          {documents.map((doc) => <DocumentUploadItem key={doc.id} document={doc} />)}
          {unsubmittedDocs.map((name) => (
            <RequiredDocumentSlot key={name} documentName={name} onUpload={handleDocumentUpload} />
          ))}
        </div>
      </Card>
      <Card title="Site Visit for Verification">
        {!siteVisit && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A site visit is required to complete your verification. Please request a visit from an inspector.
            </p>
            <Button onClick={handleRequestVisit}>Request Site Visit</Button>
          </div>
        )}
        {siteVisit && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your site visit status:</p>
            <p className={`font-bold text-lg ${
                siteVisit.status === SiteVisitStatus.PENDING ? 'text-yellow-500'
                : siteVisit.status === SiteVisitStatus.APPROVED ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {siteVisit.status}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShopOwnerView;