// --- START OF FILE AdminShopDetailPage.tsx (FINAL FIX) ---

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SpazaShop, ShopDocument, DocumentStatus, UserRole } from '../../types';
import mockApi from '../../api/mockApi';
import { REQUIRED_DOCS, NAME_TO_TYPE } from '../../constants';
import Card from '../../components/Card';
import Button from '../../components/Button';

function reverseNameFromType(typeCode: string): string {
  const match = Object.entries(NAME_TO_TYPE).find(([, code]) => code === typeCode);
  return match?.[0] || typeCode;
}

const AdminShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();

  const [shop, setShop] = useState<SpazaShop | null>(null);
  const [documents, setDocuments] = useState<ShopDocument[]>([]);
  const [siteVisit, setSiteVisit] = useState<any | null>(null); // Use 'any' as SiteVisit is not fully mocked here
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);

  // A single function to refresh all data for this page
  const refreshAllData = async () => {
    if (!shopId) return;

    try {
        // 1) Shop detail
        const currentShop = await mockApi.shops.getById(shopId);
        setShop(currentShop);

        // 2) Documents (filter by this shop FK)
        const allDocs = await mockApi.documents.list();
        const shopDocs = allDocs.filter((d) => String(d.shopOwnerId) === shopId);
        setDocuments(shopDocs);

        // 3) Site visit (if any) - NOTE: This is still a simplified fetch
        const allVisits = await mockApi.visits.list();
        const shopVisit = allVisits.find((v) => String(v.shopId) === shopId) || null;
        setSiteVisit(shopVisit);
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshAllData().finally(() => setLoading(false));
  }, [shopId]);

  const isVerified = useMemo(() => {
    if (shop) return shop.isVerified;
    // Fallback logic if the shop object doesn't have the flag
    return REQUIRED_DOCS.every((friendly) => {
      const doc = documents.find((d) => d.name === friendly);
      return doc?.status === DocumentStatus.VERIFIED;
    });
  }, [shop, documents]);

  const handleVerificationToggle = async () => {
    if (!shopId) return;
    try {
      setBusy(true);

      if (!isVerified) {
        // VERIFY shop
        const missing = REQUIRED_DOCS.filter(docName => !documents.some(d => d.name === docName));
        if (missing.length > 0) {
          alert(`Cannot verify: missing documents:\n- ${missing.join('\n- ')}`);
          return;
        }

        // Verify any required docs that are not yet verified
        for (const doc of documents) {
          if (REQUIRED_DOCS.includes(doc.name) && doc.status !== DocumentStatus.VERIFIED) {
            // ✅ FIX: Use the mockApi.documents.updateStatus with the correct action name
            await mockApi.documents.updateStatus(doc.id, 'verify', 'Admin verified.');
          }
        }
        alert('All required documents are now verified.');
      } else {
        // UNVERIFY shop: Reject the most recently submitted verified doc
        const lastVerifiedDoc = documents
          .filter(d => d.status === DocumentStatus.VERIFIED)
          .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())[0];

        if (!lastVerifiedDoc) {
          alert('No verified document to reject. The shop is already effectively unverified.');
          return;
        }
        // ✅ FIX: Use the mockApi.documents.updateStatus with the correct action name
        await mockApi.documents.updateStatus(lastVerifiedDoc.id, 'reject', 'Admin marked shop as unverified');
        alert('Shop marked as unverified.');
      }

      await refreshAllData(); // Refresh state from API after changes
    } catch (e) {
      console.error(e);
      alert('Failed to update verification status.');
    } finally {
      setBusy(false);
    }
  };


  const filteredDocuments = useMemo(() => {
    // NOTE: This memoized function is not used in this file but kept for consistency
    return documents; 
  }, [documents]);


  if (loading) return <p>Loading shop details...</p>;
  if (!shop) return <p>Shop not found.</p>;

  // --- JSX Below is mostly the same, but now uses type-safe properties ---
  return (
    <div className="space-y-6">
      <Link to="/admin/shops" className="text-primary dark:text-primary-light hover:underline mb-4 inline-block">
        &larr; Back to all shops
      </Link>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{shop.shopName}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{shop.location.address}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Registered on: {new Date(shop.registeredAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end space-y-2">
            <div className={`px-3 py-1.5 text-sm font-semibold rounded-full ${isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isVerified ? 'Verified' : 'Unverified'}
            </div>
            <Button onClick={handleVerificationToggle} size="sm" variant="secondary" disabled={busy}>
              {isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
            </Button>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Owner Information">
          <div className="space-y-2">
            <p><strong>Name:</strong> {shop.firstName} {shop.lastName}</p>
            <p><strong>Email:</strong> <a href={`mailto:${shop.email}`} className="text-primary">{shop.email}</a></p>
            <p><strong>User ID:</strong> <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-1 rounded">{shop.id}</span></p>
          </div>
        </Card>
        <Card title="Verification Status">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Documents Checklist</h4>
            <ul className="space-y-2">
              {REQUIRED_DOCS.map((docName) => {
                const docTypeCode = NAME_TO_TYPE[docName];
                const submittedDoc = documents.find(d => d.type === docTypeCode);
                const status = submittedDoc ? submittedDoc.status : 'Missing';
                const statusColors = {
                  [DocumentStatus.PENDING]: 'text-yellow-500',
                  [DocumentStatus.VERIFIED]: 'text-green-500',
                  [DocumentStatus.REJECTED]: 'text-red-500',
                  'Missing': 'text-gray-500',
                };
                return (
                  <li key={docName} className="flex justify-between items-center text-sm">
                    <span>{docName}</span>
                    <span className={`font-bold ${statusColors[status]}`}>{status}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Site Visit</h4>
            {siteVisit ? (
              <p className="text-sm">Status: <span className="font-bold">{siteVisit.status}</span>
                <Link to={`/admin/site-visits/${siteVisit.id}`} className="ml-2 text-primary text-sm">(View Details)</Link>
              </p>
            ) : (
              <p className="text-sm text-gray-500">No site visit requested.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminShopDetailPage;