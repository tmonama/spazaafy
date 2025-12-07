import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { UserRole, SpazaShop } from '../types';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import mockApi from '../api/mockApi';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';

const AccountPage: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateUser, logout } = useAuth();   // ⬅ added logout
    const [shop, setShop] = useState<SpazaShop | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        shopName: '',
        address: '',
        latitude: 0,
        longitude: 0,
    });
    const [loading, setLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            setLoading(true);
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
            }));
            
            if (user.role === UserRole.SHOP_OWNER) {
                try {
                    const allShops = await mockApi.shops.getAll();
                    const ownerShop = allShops.find(s => s.ownerId === user.id);
                    if (ownerShop) {
                        setShop(ownerShop);
                        setFormData(prev => ({
                            ...prev,
                            shopName: ownerShop.shopName,
                            address: ownerShop.location.address,
                            latitude: ownerShop.location.lat,
                            longitude: ownerShop.location.lng,
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch shop data", err);
                }
            }
            setLoading(false);
        };
        fetchInitialData();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (fieldErrors[id]) {
            setFieldErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handlePlaceSelect = (address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address, latitude: lat, longitude: lng }));
    };

    const validatePhoneNumber = (phone: string): string => {
        if (!phone) return '';
        const saPhoneRegex = /^0[0-9]{9}$/;
        if (!saPhoneRegex.test(phone)) {
            return 'Please enter a valid 10-digit South African phone number starting with 0.';
        }
        return '';
    };

    const handleSave = async () => {
        if (!user) return;
        
        setFieldErrors({});
        setSuccessMessage('');

        const phoneError = validatePhoneNumber(formData.phone);
        if (phoneError) {
            setFieldErrors({ phone: phoneError });
            return;
        }

        setLoading(true);
        try {
            if (user.role === UserRole.SHOP_OWNER && shop) {
                const userPayload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                };
                const shopPayload = {
                    name: formData.shopName,
                    address: formData.address,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                };
                const [updatedUser, updatedShop] = await Promise.all([
                    mockApi.users.update(user.id, userPayload),
                    mockApi.shops.update(shop.id, shopPayload)
                ]);
                updateUser(updatedUser);
                setShop(updatedShop);
            } else {
                const userPayload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                };
                const updatedUser = await mockApi.users.update(user.id, userPayload);
                updateUser(updatedUser);
            }
            setSuccessMessage(t('accountPage.alerts.updateSuccess'));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Failed to save changes:", err);
            alert(t('accountPage.alerts.updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user) return;
        try {
            await mockApi.auth.requestPasswordReset(user.email);
            alert(t('accountPage.alerts.resetRequestSuccess'));
        } catch (err) {
            console.error("Failed to request password reset:", err);
            alert(t('accountPage.alerts.resetRequestError'));
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        const confirmDelete = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
        );
        if (!confirmDelete) return;

        setDeleteError('');
        setDeleting(true);

        try {
            await mockApi.auth.deleteAccount(); // you’ll add this method in mockApi
            await logout();
            window.location.href = '/';
        } catch (err: any) {
            console.error('Failed to delete account:', err);
            setDeleteError(
                err?.message || 'Failed to delete account. Please try again later.'
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
                <Header />
                <main className="container mx-auto p-4">
                    <p>{t('accountPage.loading')}</p>
                </main>
            </div>
        );
    }
    
    const isShopOwner = user.role === UserRole.SHOP_OWNER;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('accountPage.myAccount')}
                    </h1>
                    
                    <Card title={isShopOwner ? t('accountPage.shopOwnerInfo') : t('accountPage.profileInfo')}>
                        <div className="space-y-4">
                            <Input id="email" label={t('accountPage.emailLabel')} value={user.email} disabled />
                            <Input id="firstName" label={isShopOwner ? t('accountPage.ownerFirstNameLabel') : t('accountPage.firstNameLabel')} value={formData.firstName} onChange={handleChange} />
                            <Input id="lastName" label={isShopOwner ? t('accountPage.ownerLastNameLabel') : t('accountPage.lastNameLabel')} value={formData.lastName} onChange={handleChange} />
                            
                            <Input 
                                id="phone" 
                                label={isShopOwner ? t('accountPage.ownerPhoneLabel') : t('accountPage.phoneLabel')} 
                                value={formData.phone} 
                                onChange={handleChange}
                                error={fieldErrors.phone} 
                            />
                            
                            {isShopOwner && (
                                <>
                                    <hr className="my-4 border-gray-200 dark:border-gray-700" />
                                    <Input id="shopName" label={t('accountPage.shopNameLabel')} value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                                    <AddressAutocompleteInput
                                        id="address"
                                        label={t('accountPage.addressLabel')}
                                        value={formData.address}
                                        onChange={(value) => setFormData({...formData, address: value})}
                                        onPlaceSelect={handlePlaceSelect}
                                    />
                                </>
                            )}
                            
                            <div className="flex justify-end items-center pt-4">
                                {successMessage && <p className="text-sm text-green-600 mr-4">{successMessage}</p>}
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading ? t('accountPage.savingButton') : t('accountPage.saveButton')}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card title={t('accountPage.passwordManagement.title')}>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('accountPage.passwordManagement.description')}
                        </p>
                        <div className="mt-4">
                            <Button variant="danger" onClick={handlePasswordReset}>
                                {t('accountPage.passwordManagement.resetButton')}
                            </Button>
                        </div>
                    </Card>

                    <Card title="Delete account">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Deleting your account will permanently remove your Spazaafy profile and
                            associated data. This action cannot be undone.
                        </p>

                        {deleteError && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-4">
                            <Button
                                variant="danger"
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting account…' : 'Delete my account'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AccountPage;
