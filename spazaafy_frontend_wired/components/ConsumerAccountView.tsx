import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import mockApi from '../api/mockApi';
import Card from './Card';
import Input from './Input';
import Button from './Button';

const ConsumerAccountView: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setLoading(true);
        setSuccessMessage('');
        const updatedUser = await mockApi.users.update(user.id, formData);
        setLoading(false);

        if (updatedUser) {
            updateUser(updatedUser);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    if (!user) {
        return <p>Loading user data...</p>;
    }

    const handlePasswordReset = async () => {
        if (!user) return;
        try {
            await mockApi.auth.requestPasswordReset(user.email);
            alert('A password reset link has been sent to your email address.');
        } catch (err) {
            console.error("Failed to request password reset:", err);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
            <Card title="Profile Information">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="email" label="Email Address (cannot be changed)" type="email" value={user.email} disabled />
                    <Input id="firstName" label="First Name" type="text" value={formData.firstName} onChange={handleChange} required />
                    <Input id="lastName" label="Last Name" type="text" value={formData.lastName} onChange={handleChange} required />
                    <Input id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
                    
                    <div className="flex justify-end items-center">
                        {successMessage && <p className="text-sm text-green-600 mr-4">{successMessage}</p>}
                        <Button type="submit" isLoading={loading}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Password Management">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click the button below to receive a password reset link to your email.</p>
                        <div className="mt-4">
                            <Button variant="danger" onClick={handlePasswordReset}>Reset Password</Button>
                        </div>
            </Card>
        </div>
    );
};

export default ConsumerAccountView;