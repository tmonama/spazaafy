
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SiteVisit, SiteVisitStatus, SiteVisitForm, SpazaShop } from '../../types';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import Button from '../../components/Button';

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

// This now includes all the new fields, initialized to false.
const INITIAL_FORM_STATE: Omit<SiteVisitForm, 'id' | 'visitId' | 'submittedAt'> = {
    // ✅ NEW FIELDS ADDED
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

const AdminSiteVisitDetailPage: React.FC = () => {
    const { visitId } = useParams<{ visitId: string }>();
    
    const [visit, setVisit] = useState<SiteVisit | null>(null);
    const [shop, setShop] = useState<Omit<SpazaShop, 'distance'> | null>(null); 
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [existingForm, setExistingForm] = useState<SiteVisitForm | null>(null);
    
    const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().substring(0, 10));
    const [scheduleTime, setScheduleTime] = useState<string>(TIME_SLOTS[0]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');

    // ✅ NEW STATE
    const [shareCode, setShareCode] = useState<string | undefined>(undefined);
    const [shareCodeExpiry, setShareCodeExpiry] = useState<string | undefined>(undefined);
    
    // Helper to check if the existing code is valid
    const isCodeValid = useMemo(() => {
        if (!shareCode || !shareCodeExpiry) return false;
        return new Date(shareCodeExpiry) > new Date();
    }, [shareCode, shareCodeExpiry]);

    const refreshAllData = async () => {
        if (!visitId) return;
        setLoading(true);
        setError('');
        try {
            const visitResponse = await mockApi.visits.getById(visitId, true);
            const shopResponse = await mockApi.shops.getById(visitResponse.shopId);

            // ✅ Pull share code/expiry from the visit response
            setShareCode(visitResponse.shareCode);
            setShareCodeExpiry(visitResponse.shareCodeExpiresAt);

            setShop(shopResponse);
            setVisit({ ...visitResponse, shopName: shopResponse.shopName });
            
            const formResponse = await mockApi.visits.getFormByVisitId(visitId);
            setExistingForm(formResponse);

        
            if (formResponse) {
                const { id, visitId, submittedAt, ...formContent } = formResponse;
                setForm({ ...INITIAL_FORM_STATE, ...formContent }); 
                 
            } else {
              setForm(INITIAL_FORM_STATE);
            }
        } catch (err) {
            console.error("Failed to refresh data:", err);
            setError('Failed to load detail data.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        refreshAllData();
    }, [visitId]); 

    // ✅ NEW: Generate Code Handler
    const handleGenerateCode = async () => {
        if (!visitId) return;
        setLoading(true); // Set loading true at the start
        try {
            // 1. Call the API
            await mockApi.visits.generateShareCode(visitId); 
            
            // 2. Refresh ALL data (This handles state setting for shareCode, expiry, and visit)
            await refreshAllData(); 
            
            // NOTE: The alert is removed since the UI update is now synchronous and clear.

        } catch (e) {
            console.error("Failed to generate code:", e);
            alert('Failed to generate share code.');
            // setLoading(false) is handled implicitly by refreshAllData's finally block
        }
    };


    // ✅ NEW: Share Logic
    const handleShareForm = () => {
        if (!visitId || !shareCode) return;
        // The link must include the code for the inspector to use it.
        const publicUrl = `${window.location.origin}/#/site-visits/${visitId}/form?code=${shareCode}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            alert(`Public form link copied to clipboard: ${publicUrl}`);
        }).catch(err => {
            console.error("Failed to copy URL:", err);
            alert(`Failed to copy URL. Please manually copy: ${publicUrl}`);
        });
    }    

    const handleStatusUpdate = async (status: SiteVisitStatus) => {
        if (!visitId) return;
        setLoading(true); 
        try {
            await mockApi.visits.updateStatus(visitId, status);
            await refreshAllData();
        } catch (e) {
            console.error("Failed to update status:", e);
            alert('Failed to update visit status.');
            await refreshAllData(); 
        }
    };

     // ✅ ADD THIS NEW FUNCTION
    const confirmAndHandleStatusUpdate = (status: SiteVisitStatus) => {
        const actionText = status === SiteVisitStatus.APPROVED ? 'approve' : 'reject';
        const confirmationMessage = `Are you sure you want to finalise this decision and ${actionText} the site visit? This action cannot be undone.`;

        if (window.confirm(confirmationMessage)) {
            handleStatusUpdate(status);
        }
    };
    
    const handleSchedule = async () => {
        if (!visitId) return;
        setLoading(true);
        try {
            const requestedDateTime = `${scheduleDate}T${scheduleTime}:00Z`;
            await mockApi.visits.schedule(visitId, requestedDateTime);
            alert(`Visit scheduled for ${scheduleDate} at ${scheduleTime}.`);
            await refreshAllData();
        } catch (e) {
            console.error("Failed to schedule visit:", e);
            alert('Failed to schedule visit.');
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setForm(prev => ({ ...prev, [id]: checked }));
        } else {
             setForm(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitId) return;
        setLoading(true);
        try {
            if (existingForm) {
                await mockApi.visits.updateForm(existingForm.id, form);
                alert('Inspection form updated successfully.');
            } else {
                await mockApi.visits.createForm(visitId, form);
                alert('Inspection form submitted successfully.');
            }
            await refreshAllData();
        } catch (e) {
            console.error("Failed to submit form:", e);
            alert('Failed to submit inspection form.');
            setLoading(false);
        }
    };

    if (loading) { return <p>Loading visit details...</p>; }
    if (error) { return <p className="text-red-500">{error}</p>; }
    if (!visit || !shop) { return <p>Visit not found.</p>; }

    const isPending = visit.status === SiteVisitStatus.PENDING;
    const isScheduled = visit.status === SiteVisitStatus.SCHEDULED;
    const isCompleted = visit.status === SiteVisitStatus.APPROVED || visit.status === SiteVisitStatus.REJECTED;
    const isVerificationEnabled = !!existingForm || isCompleted; 

    return (
        <div className="space-y-6">
             <Link to="/admin/site-visits" className="text-primary dark:text-primary-light hover:underline mb-4 inline-block">
                &larr; Back to all site visits
            </Link>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Visit for {visit.shopName}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Requested for: <span className="font-semibold">{new Date(visit.requestedDateTime).toLocaleString()}</span>
                        </p>
                         <p className="mt-2">
                            <span className="font-semibold">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full`}>
                                {visit.status}
                            </span>
                        </p>
                    </div>
                </div>
            </Card>

            {(isPending || isScheduled) && (
                <Card title="Schedule Visit">
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Select a date and time for the inspector to visit the site.</p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
                        <div className="flex-1">
                             <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                             <input 
                                id="scheduleDate" 
                                type="date" 
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time (1hr Slot)</label>
                            <select
                                id="scheduleTime"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                            >
                                {TIME_SLOTS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleSchedule} disabled={!scheduleDate || loading} className="sm:mt-1">
                            Schedule
                        </Button>
                    </div>
                    {isScheduled && (
                        <p className="mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
                            Scheduled for: {new Date(visit.requestedDateTime).toLocaleDateString()} at {new Date(visit.requestedDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    )}
                </Card>
            )}

            {/* ✅ NEW: Share Form Card */}
            {isScheduled && !isCompleted && (
                <Card title="Share Inspection Form Link">
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Generate a 24-hour code to allow an external inspector to fill out the form.
                    </p>
                    <div className="flex items-center space-x-3">
                        <Button 
                            onClick={handleGenerateCode} 
                            disabled={loading} 
                            variant={isCodeValid ? 'secondary' : 'primary'}
                        >
                            {isCodeValid ? 'Regenerate Code' : 'Generate Code'}
                        </Button>
                        
                        <Button 
                            onClick={handleShareForm} 
                            disabled={loading || !isCodeValid}
                            variant="primary"
                        >
                            Share Link (Copy URL)
                        </Button>
                    </div>
                    {shareCode && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Code: <span className="text-lg font-mono">{shareCode}</span>
                            </p>
                            <p className={`text-xs ${isCodeValid ? 'text-green-600' : 'text-red-600'} dark:text-gray-300`}>
                                Expires: {new Date(shareCodeExpiry!).toLocaleString()}
                            </p>
                        </div>
                    )}
                    {!shareCode && <p className="mt-3 text-sm text-gray-500">Click "Generate Code" to create a link.</p>}
                </Card>
            )}


            {(isScheduled || isCompleted) && (
                 <Card title={existingForm ? 'Inspection Form Details' : 'Submit Inspection Form'}>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        
                        {/* ✅ Inspector Details Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="inspectorName" className="block text-sm font-medium">Inspector Name</label>
                                <input id="inspectorName" type="text" value={form.inspectorName} onChange={handleFormChange} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label htmlFor="inspectorSurname" className="block text-sm font-medium">Inspector Surname</label>
                                <input id="inspectorSurname" type="text" value={form.inspectorSurname} onChange={handleFormChange} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label htmlFor="contractorCompany" className="block text-sm font-medium">Contractor Company</label>
                                <input id="contractorCompany" type="text" value={form.contractorCompany} onChange={handleFormChange} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="cleanliness" className="block text-sm font-medium">Cleanliness</label>
                                <select id="cleanliness" value={form.cleanliness} onChange={handleFormChange} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                    <option>Poor</option>
                                    <option>Fair</option>
                                    <option>Good</option>
                                    <option>Excellent</option>
                                </select>
                            </div>
                             <div className="space-y-2 pt-4">
                                <label className="flex items-center"><input type="checkbox" id="stockRotationObserved" checked={form.stockRotationObserved} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Stock Rotation Observed</span></label>
                                <label className="flex items-center"><input type="checkbox" id="fireExtinguisherValid" checked={form.fireExtinguisherValid} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Fire Extinguisher Valid</span></label>
                                <label className="flex items-center"><input type="checkbox" id="businessLicenceDisplayed" checked={form.businessLicenceDisplayed} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Business Licence Displayed</span></label>
                                <label className="flex items-center"><input type="checkbox" id="healthCertificateDisplayed" checked={form.healthCertificateDisplayed} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Health Certificate Displayed</span></label>
                                <label className="flex items-center"><input type="checkbox" id="refundPolicyVisible" checked={form.refundPolicyVisible} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Refund/Return Policy Visible</span></label>
                                <label className="flex items-center"><input type="checkbox" id="salesRecordPresent" checked={form.salesRecordPresent} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Sales Record Present</span></label>
                                <label className="flex items-center"><input type="checkbox" id="inventorySystemInPlace" checked={form.inventorySystemInPlace} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Inventory System in Place</span></label>
                                <label className="flex items-center"><input type="checkbox" id="foodLabelsAndExpiryPresent" checked={form.foodLabelsAndExpiryPresent} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Food Labels & Expiry Dates Present</span></label>
                                <label className="flex items-center"><input type="checkbox" id="pricesVisible" checked={form.pricesVisible} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Prices Visible</span></label>
                                <label className="flex items-center"><input type="checkbox" id="noticesPoliciesDisplayed" checked={form.noticesPoliciesDisplayed} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Display of Notices/Policies</span></label>
                                <label className="flex items-center"><input type="checkbox" id="supplierListPresent" checked={form.supplierListPresent} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Supplier List Present</span></label>
                                <label className="flex items-center"><input type="checkbox" id="buildingPlanPresent" checked={form.buildingPlanPresent} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Building Plan Present</span></label>
                                <label className="flex items-center"><input type="checkbox" id="adequateVentilation" checked={form.adequateVentilation} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Adequate Ventilation</span></label>
                                <label className="flex items-center"><input type="checkbox" id="healthyStorageGoods" checked={form.healthyStorageGoods} onChange={handleFormChange} disabled={!!existingForm} className="rounded" /><span className="ml-2">Healthy Storage of Goods</span></label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="inspectorNotes" className="block text-sm font-medium">Inspector Notes</label>
                            <textarea id="inspectorNotes" value={form.inspectorNotes} onChange={handleFormChange} rows={4} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
                        </div>
                         {existingForm && <p className="text-sm text-gray-500">Submitted on: {new Date(existingForm.submittedAt).toLocaleString()}</p>}
                        {!existingForm && <Button type="submit" disabled={loading}>Submit Form</Button>}
                    </form>
                </Card>
            )}

            {isCompleted && (
                <Card title="Final Verification Decision">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        The final status is set to **{visit.status}**.
                    </p>
                </Card>
            )}
            
            {(isScheduled || isCompleted) && (
                <Card title="Approve/Reject Site Visit">
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Final site visit decision. This will mark the visit as Approved (COMPLETED) or Rejected (CANCELLED).
                        The buttons are enabled after the inspection form is submitted.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button 
                            // ✅ Call the new confirmation handler
                            onClick={() => confirmAndHandleStatusUpdate(SiteVisitStatus.APPROVED)} 
                            variant="primary" 
                            size="md" 
                            disabled={!isVerificationEnabled || isCompleted}
                        >
                            Final Approve
                        </Button>
                        <Button 
                            // ✅ Call the new confirmation handler
                            onClick={() => confirmAndHandleStatusUpdate(SiteVisitStatus.REJECTED)} 
                            variant="danger" 
                            size="md"
                            disabled={!isVerificationEnabled || isCompleted}
                        >
                            Final Reject
                        </Button>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default AdminSiteVisitDetailPage;