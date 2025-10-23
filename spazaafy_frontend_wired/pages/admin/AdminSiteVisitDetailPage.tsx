import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SiteVisit, SiteVisitStatus, SiteVisitForm, SpazaShop } from '../../types';
import { MOCK_DB } from '../../data/mockData';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

const AdminSiteVisitDetailPage: React.FC = () => {
    const { visitId } = useParams<{ visitId: string }>();
    
    const [visit, setVisit] = useState<SiteVisit | null>(null);
    const [shop, setShop] = useState<Omit<SpazaShop, 'distance'> | null>(null);
    const [form, setForm] = useState<Omit<SiteVisitForm, 'visitId' | 'submittedAt'>>({
        cleanliness: 'Good',
        stockRotationObserved: false,
        fireExtinguisherValid: false,
        businessLicenceDisplayed: false,
        healthCertificateDisplayed: false,
        inspectorNotes: '',
    });
    const [existingForm, setExistingForm] = useState<SiteVisitForm | null>(null);

    useEffect(() => {
        if (visitId) {
            const foundVisit = MOCK_DB.siteVisits.findById(visitId);
            setVisit(foundVisit || null);
            if (foundVisit) {
                const foundShop = MOCK_DB.shops.findById(foundVisit.shopId);
                setShop(foundShop || null);
                const foundForm = MOCK_DB.siteVisitForms.findByVisitId(visitId);
                setExistingForm(foundForm || null);
                if (foundForm) {
                    setForm(foundForm);
                }
            }
        }
    }, [visitId]);

    const handleStatusUpdate = (status: SiteVisitStatus) => {
        if (visitId) {
            const updatedVisit = MOCK_DB.siteVisits.updateStatus(visitId, status);
            setVisit(updatedVisit);
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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (visitId) {
            MOCK_DB.siteVisitForms.createOrUpdate({ visitId, ...form });
            alert('Inspection form submitted successfully.');
            const submittedForm = MOCK_DB.siteVisitForms.findByVisitId(visitId);
            setExistingForm(submittedForm || null);
        }
    };

    if (!visit || !shop) {
        return <p>Loading visit details...</p>;
    }

    const isPending = visit.status === SiteVisitStatus.PENDING;
    const isCompleted = visit.status === SiteVisitStatus.APPROVED || visit.status === SiteVisitStatus.FAILED;

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
                            Requested for: {new Date(visit.requestedDateTime).toLocaleString()}
                        </p>
                         <p className="mt-2">
                            <span className="font-semibold">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full`}>
                                {visit.status}
                            </span>
                        </p>
                    </div>
                     {isPending && (
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <Button onClick={() => handleStatusUpdate(SiteVisitStatus.APPROVED)} variant="primary" size="sm">Approve Visit</Button>
                            <Button onClick={() => handleStatusUpdate(SiteVisitStatus.FAILED)} variant="danger" size="sm">Fail Visit</Button>
                        </div>
                    )}
                </div>
            </Card>

            {isCompleted && (
                 <Card title={existingForm ? 'Inspection Form Details' : 'Submit Inspection Form'}>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Form fields here */}
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
                                <label className="flex items-center">
                                    <input type="checkbox" id="stockRotationObserved" checked={form.stockRotationObserved} onChange={handleFormChange} disabled={!!existingForm} className="rounded" />
                                    <span className="ml-2">Stock Rotation Observed</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" id="fireExtinguisherValid" checked={form.fireExtinguisherValid} onChange={handleFormChange} disabled={!!existingForm} className="rounded" />
                                    <span className="ml-2">Fire Extinguisher Valid</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" id="businessLicenceDisplayed" checked={form.businessLicenceDisplayed} onChange={handleFormChange} disabled={!!existingForm} className="rounded" />
                                    <span className="ml-2">Business Licence Displayed</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" id="healthCertificateDisplayed" checked={form.healthCertificateDisplayed} onChange={handleFormChange} disabled={!!existingForm} className="rounded" />
                                    <span className="ml-2">Health Certificate Displayed</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="inspectorNotes" className="block text-sm font-medium">Inspector Notes</label>
                            <textarea id="inspectorNotes" value={form.inspectorNotes} onChange={handleFormChange} rows={4} disabled={!!existingForm} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"></textarea>
                        </div>
                         {existingForm && <p className="text-sm text-gray-500">Submitted on: {new Date(existingForm.submittedAt).toLocaleString()}</p>}
                        {!existingForm && <Button type="submit">Submit Form</Button>}
                    </form>
                </Card>
            )}
        </div>
    );
};

export default AdminSiteVisitDetailPage;
