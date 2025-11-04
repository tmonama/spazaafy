

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SiteVisit, SiteVisitForm } from '../types';
import mockApi from '../api/mockApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header'; // Assuming you have a basic header

const INITIAL_FORM_STATE: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'> = {
    inspectorName: '',
    inspectorSurname: '',
    contractorCompany: '',
    cleanliness: 'Good',
    stockRotationObserved: false,
    fireExtinguisherValid: false,
    businessLicenceDisplayed: false,
    healthCertificateDisplayed: false,
    refundPolicyVisible: false,
    salesRecordPresent: false,
    inventorySystemInPlace: false,
    foodLabelsAndExpiryPresent: false,
    pricesVisible: false,
    noticesPoliciesDisplayed: false,
    supplierListPresent: false,
    buildingPlanPresent: false,
    adequateVentilation: false,
    healthyStorageGoods: false,
    inspectorNotes: '',
};

const PublicSiteVisitForm: React.FC = () => {
    const { visitId } = useParams<{ visitId: string }>();
    const [searchParams] = useSearchParams();
    
    const [visit, setVisit] = useState<SiteVisit | null>(null);
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    
    // State for the code verification step
    const [accessCode, setAccessCode] = useState<string>(searchParams.get('code') || '');
    const [isVerified, setIsVerified] = useState<boolean>(false);


    const handleCodeVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("--- Verification Started ---");
        console.log(`Attempting to verify for visitId: ${visitId} with code: ${accessCode}`);
        if (!visitId || !accessCode) return;

        setLoading(true);
        setError('');
        
        try {
            console.log("Calling mockApi.visits.getById with 'false' for withAuth.");
            // 1. Fetch the visit to check the code
            // 🔥 PROBLEM LINE: Missing the 'false' here, which allows the request to fail with 401
            const visitResponse = await mockApi.visits.getById(visitId, false); 
            console.log("API call successful. Received data:", visitResponse);
            setVisit(visitResponse);

            // 2. Client-side code verification
            const isValid = visitResponse.shareCode === accessCode.toUpperCase() &&
                            visitResponse.shareCodeExpiresAt && 
                            new Date(visitResponse.shareCodeExpiresAt) > new Date();
            
            if (isValid) {
                setIsVerified(true);
            } else {
                setError('Invalid or expired access code.');
                setIsVerified(false);
            }
        } catch (err) {
            console.error("Verification failed:", err);
            // This throw cascades up, hitting the global AuthProvider logic, which redirects.
            setError('Failed to retrieve visit data. Check URL/Code.');
        } finally {
            setLoading(false);
        }
    };
    
    // Automatically attempt verification if code is in URL
    useEffect(() => {
        if (accessCode && visitId && !isVerified) {
            // This is what automatically triggers the failing API call on load.
            handleCodeVerification({ preventDefault: () => {} } as React.FormEvent);
        } else if (!isVerified) {
            setLoading(false);
        }
    }, [accessCode, visitId]); // Rerun if code or visitId changes

    // ✅ FIX: Explicitly type event and prev
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setForm((prev: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>) => ({ ...prev, [id]: checked }));
        } else {
             setForm((prev: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'>) => ({ ...prev, [id]: value }));
        }
    };

    // ✅ FIX: Explicitly type event
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitId) return;
        setLoading(true);
        try {
            // Submitting as a new form. Use the 'isPublic=true' flag.
            await mockApi.visits.createForm(visitId, form, true); 
            alert('Inspection form submitted successfully. Thank you!');
            setIsVerified(false); // Disable form access after submission
            setAccessCode('');
        } catch (err) {
            console.error("Failed to submit form:", err);
            setError('Failed to submit inspection form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderVerificationScreen = () => (
        <Card title="Enter Access Code">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please enter the 8-character access code provided by the admin.
            </p>
            <form onSubmit={handleCodeVerification} className="space-y-4">
                <input 
                    type="text" 
                    value={accessCode} 
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 text-lg text-center"
                    placeholder="ENTER CODE"
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
            </form>
        </Card>
    );
    
    if (loading && !isVerified) { return <p className="text-center p-8">Loading...</p>; }
    if (!visitId) { return <p className="text-red-500">Error: Visit ID not found.</p>; }


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header /> 
            <main className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    {!isVerified ? (
                        renderVerificationScreen()
                    ) : (
                        // Form is displayed after successful verification
                        <Card title={`Inspection Form for ${visit?.shopName || 'Site Visit'}`}>
                            <p className="text-sm text-green-600 dark:text-green-400 mb-4 font-semibold">
                                Access Granted. This form is valid until: {new Date(visit!.shareCodeExpiresAt!).toLocaleString()}
                            </p>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                
                                {/* Inspector Details Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="inspectorName" className="block text-sm font-medium">Inspector Name</label>
                                        <input id="inspectorName" type="text" value={form.inspectorName} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" required />
                                    </div>
                                    <div>
                                        <label htmlFor="inspectorSurname" className="block text-sm font-medium">Inspector Surname</label>
                                        <input id="inspectorSurname" type="text" value={form.inspectorSurname} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" required />
                                    </div>
                                    <div>
                                        <label htmlFor="contractorCompany" className="block text-sm font-medium">Contractor Company</label>
                                        <input id="contractorCompany" type="text" value={form.contractorCompany} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" required />
                                    </div>
                                </div>
                                
                                {/* Cleanliness and Checkboxes (copied from AdminSiteVisitDetailPage.tsx) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="cleanliness" className="block text-sm font-medium">Cleanliness</label>
                                        <select id="cleanliness" value={form.cleanliness} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                            <option>Poor</option>
                                            <option>Fair</option>
                                            <option>Good</option>
                                            <option>Excellent</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <label className="flex items-center"><input type="checkbox" id="stockRotationObserved" checked={form.stockRotationObserved} onChange={handleFormChange} className="rounded" /><span className="ml-2">Stock Rotation Observed</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="fireExtinguisherValid" checked={form.fireExtinguisherValid} onChange={handleFormChange} className="rounded" /><span className="ml-2">Fire Extinguisher Valid</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="businessLicenceDisplayed" checked={form.businessLicenceDisplayed} onChange={handleFormChange} className="rounded" /><span className="ml-2">Business Licence Displayed</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="healthCertificateDisplayed" checked={form.healthCertificateDisplayed} onChange={handleFormChange} className="rounded" /><span className="ml-2">Health Certificate Displayed</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="refundPolicyVisible" checked={form.refundPolicyVisible} onChange={handleFormChange} className="rounded" /><span className="ml-2">Refund/Return Policy Visible</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="salesRecordPresent" checked={form.salesRecordPresent} onChange={handleFormChange} className="rounded" /><span className="ml-2">Sales Record Present</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="inventorySystemInPlace" checked={form.inventorySystemInPlace} onChange={handleFormChange} className="rounded" /><span className="ml-2">Inventory System in Place</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="foodLabelsAndExpiryPresent" checked={form.foodLabelsAndExpiryPresent} onChange={handleFormChange} className="rounded" /><span className="ml-2">Food Labels & Expiry Dates Present</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="pricesVisible" checked={form.pricesVisible} onChange={handleFormChange} className="rounded" /><span className="ml-2">Prices Visible</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="noticesPoliciesDisplayed" checked={form.noticesPoliciesDisplayed} onChange={handleFormChange} className="rounded" /><span className="ml-2">Display of Notices/Policies</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="supplierListPresent" checked={form.supplierListPresent} onChange={handleFormChange} className="rounded" /><span className="ml-2">Supplier List Present</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="buildingPlanPresent" checked={form.buildingPlanPresent} onChange={handleFormChange} className="rounded" /><span className="ml-2">Building Plan Present</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="adequateVentilation" checked={form.adequateVentilation} onChange={handleFormChange} className="rounded" /><span className="ml-2">Adequate Ventilation</span></label>
                                        <label className="flex items-center"><input type="checkbox" id="healthyStorageGoods" checked={form.healthyStorageGoods} onChange={handleFormChange} className="rounded" /><span className="ml-2">Healthy Storage of Goods</span></label>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="inspectorNotes" className="block text-sm font-medium">Inspector Notes</label>
                                    <textarea id="inspectorNotes" value={form.inspectorNotes} onChange={handleFormChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" required></textarea>
                                </div>
                                <Button type="submit" disabled={loading}>Submit Inspection Form</Button>
                            </form>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PublicSiteVisitForm;