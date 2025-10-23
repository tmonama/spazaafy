import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import mockApi from '../api/mockApi'
import { SpazaShop, User } from '../types';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import AddressAutocompleteInput from './AddressAutocompleteInput';

const ShopOwnerAccountView: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [shop, setShop] = useState<Omit<SpazaShop, 'distance'> | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        shopName: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const fetchedShop = await mockApi.shops.getById(user.id);
                if (fetchedShop) {
                    setShop(fetchedShop);
                    setFormData({
                        firstName: fetchedShop.firstName,
                        lastName: fetchedShop.lastName,
                        phone: fetchedShop.phone || '',
                        shopName: fetchedShop.shopName,
                        address: fetchedShop.location.address,
                    });
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    const handleAddressChange = (address: string) => {
        setFormData(prev => ({ ...prev, address }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !shop) return;

        setSaving(true);
        setSuccessMessage('');

        const userUpdatePromise = mockApi.users.update(user.id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
        });

        const shopUpdatePromise = mockApi.shops.update(shop.id, {
            shopName: formData.shopName,
            location: { ...shop.location, address: formData.address },
        });

        const [updatedUser] = await Promise.all([userUpdatePromise, shopUpdatePromise]);

        setSaving(false);

        if (updatedUser) {
            updateUser(updatedUser);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    if (loading) {
        return <p>Loading shop data...</p>;
    }

    if (!user || !shop) {
        return <p>Could not load account details.</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
            <Card title="Shop & Owner Information">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="email" label="Email Address (cannot be changed)" type="email" value={user.email} disabled />
                    <Input id="firstName" label="Owner First Name" type="text" value={formData.firstName} onChange={handleChange} required />
                    <Input id="lastName" label="Owner Last Name" type="text" value={formData.lastName} onChange={handleChange} required />
                    <Input id="phone" label="Owner Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
                    <Input id="shopName" label="Spaza Shop Name" type="text" value={formData.shopName} onChange={handleChange} required />
                    <AddressAutocompleteInput
                        id="address"
                        label="Business Address"
                        value={formData.address}
                        onChange={handleAddressChange}
                        required
                    />
                    
                    <div className="flex justify-end items-center">
                        {successMessage && <p className="text-sm text-green-600 mr-4">{successMessage}</p>}
                        <Button type="submit" isLoading={saving}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Password Management">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Click the button below to receive a password reset link to your email.</p>
                <Button variant="secondary" onClick={() => alert('Password reset functionality is not implemented in this mock.')}>
                    Reset Password
                </Button>
            </Card>
        </div>
    );
};

export default ShopOwnerAccountView;