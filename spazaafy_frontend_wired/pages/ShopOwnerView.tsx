// src/pages/ShopOwnerView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { addMonths, isAfter } from 'date-fns'; 
import { SpazaShop, ShopDocument, SiteVisit, SiteVisitStatus, DocumentStatus } from '../types';
import mockApi from '../api/mockApi';
import Card from '../components/Card';
import DocumentUploadItem from '../components/DocumentUploadItem';
import RequiredDocumentSlot from '../components/RequiredDocumentSlot';
import Button from '../components/Button';
import { REQUIRED_DOCS, NAME_TO_TYPE } from '../constants';
import { useNavigate } from 'react-router-dom';

const ShopOwnerView: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [shop, setShop] = useState<SpazaShop | null>(null);
  const [documents, setDocuments] = useState<ShopDocument[]>([]);
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New state to show feedback during location fetch/upload
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const navigate = useNavigate();

  const isOwner = useMemo(() => !!user && user.role === 'OWNER', [user]);

  const { isShopUnverifiedDueToCompliance, complianceMessage } = useMemo(() => {
    if (!shop) {
      return { isShopUnverifiedDueToCompliance: false, complianceMessage: '' };
    }
    const now = new Date();
    let unverifiedStatus = false;
    let messages: string[] = [];
    if (siteVisit && siteVisit.status === SiteVisitStatus.APPROVED) {
      const siteVisitExpiryDate = addMonths(new Date(siteVisit.updatedAt), 6);
      const gracePeriodEnd = addMonths(siteVisitExpiryDate, 1);
      if (isAfter(now, siteVisitExpiryDate)) {
        messages.push(t('shopOwnerDashboard.complianceMessages.visitExpired', { date: siteVisitExpiryDate.toLocaleDateString() }));
      }
      if (isAfter(now, gracePeriodEnd)) {
        unverifiedStatus = true;
        messages.push(t('shopOwnerDashboard.complianceMessages.visitGracePeriodPassed'));
      }
    }
    const expiredDocs = documents.filter(d => d.status === DocumentStatus.VERIFIED && d.expiryDate && isAfter(now, new Date(d.expiryDate)));
    if (expiredDocs.length > 0) {
        messages.push(t('shopOwnerDashboard.complianceMessages.docsExpired', { count: expiredDocs.length }));
        const gracePeriodViolated = expiredDocs.some(d => {
            const docExpiryDate = new Date(d.expiryDate as string);
            const docGracePeriodEnd = addMonths(docExpiryDate, 1);
            return isAfter(now, docGracePeriodEnd);
        });
        if (gracePeriodViolated) {
            unverifiedStatus = true;
            messages.push(t('shopOwnerDashboard.complianceMessages.docsGracePeriodPassed'));
        }
    }
    return { isShopUnverifiedDueToCompliance: unverifiedStatus, complianceMessage: messages.join(' ') };
  }, [shop, siteVisit, documents, t]);

  const { isEligibleForNewRequest, eligibilityMessage } = useMemo(() => {
    const now = new Date();
    if (!siteVisit) {
      return { isEligibleForNewRequest: true, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.required') };
    } 
    if (siteVisit.status === SiteVisitStatus.PENDING || siteVisit.status === SiteVisitStatus.SCHEDULED) {
      return { isEligibleForNewRequest: false, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.pending') };
    } 
    if (siteVisit.status === SiteVisitStatus.APPROVED) {
      const expiryDate = addMonths(new Date(siteVisit.updatedAt), 6);
      if (isAfter(now, expiryDate)) {
        return { isEligibleForNewRequest: true, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.expired', { date: expiryDate.toLocaleDateString() }) };
      } else {
        return { isEligibleForNewRequest: false, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.approved', { date: expiryDate.toLocaleDateString() }) };
      }
    } 
    if (siteVisit.status === SiteVisitStatus.REJECTED) {
      const reApplyDate = addMonths(new Date(siteVisit.updatedAt), 1);
      if (isAfter(now, reApplyDate)) {
        return { isEligibleForNewRequest: true, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.rejectedEligible') };
      } else {
        return { isEligibleForNewRequest: false, eligibilityMessage: t('shopOwnerDashboard.eligibilityMessages.rejectedIneligible', { date: reApplyDate.toLocaleDateString() }) };
      }
    }
    return { isEligibleForNewRequest: false, eligibilityMessage: '' };
  }, [siteVisit, t]);

  const fetchShopData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allShops = await mockApi.shops.getAll();
      const myShop = allShops.find(s => s.ownerId === user.id);
      if (!myShop) {
        setShop(null);
        setLoading(false);
        return; 
      }
      setShop(myShop); 
      const [apiDocs, apiVisits] = await Promise.all([
        mockApi.documents.list(),
        mockApi.visits.list()
      ]);
      const myDocs = apiDocs.filter(d => String(d.shopOwnerId) === String(myShop.id));
      setDocuments(myDocs);
      const myShopVisits = apiVisits.filter(v => String(v.shopId) === String(myShop.id));
      if (myShopVisits.length > 0) {
        const activeVisit = myShopVisits.find(v => v.status === SiteVisitStatus.PENDING || v.status === SiteVisitStatus.SCHEDULED);
        if (activeVisit) {
          setSiteVisit(activeVisit);
        } else {
          myShopVisits.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setSiteVisit(myShopVisits[0]);
        }
      } else {
        setSiteVisit(null);
      }
    } catch (e: any) {
      console.error("Failed to fetch shop data:", e);
      if (e.message.includes('Session expired')) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchShopData();
    } else {
      setLoading(false);
    }
  }, [isOwner]);

  const getBrowserLocation = (): Promise<{lat: number, lng: number, accuracy: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported by this browser.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn("Location access denied or failed:", error.message);
          resolve(null); // Proceed without location
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  // ✅ MODIFIED: Upload handler with Strict Location Check
  const handleDocumentUpload = async (documentName: string, file: File) => {
    if (!user || !shop) return;
    const typeCode = NAME_TO_TYPE[documentName];
    if (!typeCode) return alert(t('shopOwnerDashboard.alerts.unknownDocType', { docName: documentName }));
    
    setIsUploading(true);
    setUploadMessage("Getting your location for verification...");

    try {
      // 1. Try to get location
      const location = await getBrowserLocation();
      
      // ✅ STRICT CHECK: If no location, Stop and Alert User
      if (!location) {
          alert("Document upload failed. Please ensure location services are turned on in your browser and system settings, then try again.");
          setIsUploading(false);
          setUploadMessage("");
          return; // <--- This prevents the API call that causes 400
      }
      
      setUploadMessage("Uploading document...");

      // 2. Upload with optional location data
      await mockApi.documents.upload(String(shop.id), { 
        name: documentName, 
        type: typeCode, 
        file,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy
      });
      
      await fetchShopData();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t('shopOwnerDashboard.alerts.uploadFailed'));
    } finally {
      setIsUploading(false);
      setUploadMessage("");
    }
  };

  const handleRequestVisit = async () => {
    if (!user || !shop) return;
    try {
      await mockApi.visits.requestVisit(String(shop.id), new Date().toISOString()); 
      await fetchShopData();
      alert(t('shopOwnerDashboard.alerts.visitRequestSuccess'));
    } catch (e) {
      console.error(e);
      alert(t('shopOwnerDashboard.alerts.visitRequestFailed'));
    }
  };

  if (loading) {
      return <p className="text-center p-8">{t('shopOwnerDashboard.loading')}</p>;
  }

  // Show overlay/indicator when uploading
  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">{uploadMessage}</p>
      </div>
    );
  }

  if (!shop) {
      return <p className="text-center p-8">{t('shopOwnerDashboard.noShop')}</p>;
  }

  const displayedVerificationStatus = shop.isVerified 
      ? t('shopOwnerDashboard.verificationStatus.verified') 
      : t('shopOwnerDashboard.verificationStatus.pending');
  const statusColorClass = shop.isVerified 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' 
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200';
  
  const shouldShowComplianceAlert = !shop.isVerified && isShopUnverifiedDueToCompliance;

  return (
    <div className="space-y-8">
      <Card title={t('shopOwnerDashboard.welcome', { shopName: shop.shopName })}>
        <p className="text-gray-600 dark:text-gray-400">{t('shopOwnerDashboard.description')}</p>
        
        <div className={`mt-4 p-3 rounded-md text-sm ${statusColorClass}`}>
          {t('shopOwnerDashboard.verificationStatus.label')} <span className="font-bold">{displayedVerificationStatus}</span>
        </div>

        {shouldShowComplianceAlert && (
            <div className="mt-4 p-3 rounded-md text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 font-semibold">
                ⚠️ {t('shopOwnerDashboard.complianceAlert', { message: complianceMessage })}
            </div>
        )}
      </Card>
      <Card title={t('shopOwnerDashboard.requiredDocs')}>
        <div className="space-y-3">
          {REQUIRED_DOCS.map((docName) => {
            const docTypeCode = NAME_TO_TYPE[docName];
            const submittedDoc = documents.find(d => d.type === docTypeCode);
            
            let isDocumentExpired = false;
            if (submittedDoc && submittedDoc.status === DocumentStatus.VERIFIED && submittedDoc.expiryDate) {
                isDocumentExpired = isAfter(new Date(), new Date(submittedDoc.expiryDate));
            }

            const isSlotOccupied = submittedDoc && (submittedDoc.status === DocumentStatus.PENDING || (submittedDoc.status === DocumentStatus.VERIFIED && !isDocumentExpired));

            if (isSlotOccupied) {
              return <DocumentUploadItem key={docName} document={submittedDoc} documentName={docName}/>;
            } else {
              const isRejected = submittedDoc && submittedDoc.status === DocumentStatus.REJECTED;
              const showExpiredNotice = submittedDoc && isDocumentExpired; 

              return (
                <div key={docName}>
                  {(isRejected || showExpiredNotice) && (
                      <p className="text-red-500 text-sm mb-1 font-semibold">
                         {isRejected ? t('shopOwnerDashboard.uploadNotices.rejected') : t('shopOwnerDashboard.uploadNotices.expired')}
                      </p>
                  )}
                  <RequiredDocumentSlot documentName={docName} onUpload={handleDocumentUpload} />
                </div>
              );
            }
          })}
        </div>
      </Card>
      <Card title={t('shopOwnerDashboard.siteVisit')}>
        {eligibilityMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {eligibilityMessage}
            </p>
        )}

        {isEligibleForNewRequest && (
          <Button onClick={handleRequestVisit}>{t('shopOwnerDashboard.requestButton')}</Button>
        )}
        
        {siteVisit && !isEligibleForNewRequest && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('shopOwnerDashboard.siteVisitDetails.statusLabel')}</p>
            <p className={`font-bold text-lg ${
                siteVisit.status === SiteVisitStatus.PENDING || siteVisit.status === SiteVisitStatus.SCHEDULED ? 'text-blue-500'
                : siteVisit.status === SiteVisitStatus.APPROVED ? 'text-green-500'
                : siteVisit.status === SiteVisitStatus.REJECTED ? 'text-red-500'
                : 'text-yellow-500'
            }`}>
              {t(`enums.visitStatuses.${siteVisit.status}`, siteVisit.status)}
            </p>
            {(siteVisit.status === SiteVisitStatus.SCHEDULED || siteVisit.status === SiteVisitStatus.APPROVED) && (
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('shopOwnerDashboard.siteVisitDetails.scheduledDate')}: {new Date(siteVisit.requestedDateTime).toLocaleDateString()}
                </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShopOwnerView;