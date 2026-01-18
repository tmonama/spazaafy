import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const EmployeeEmailPage: React.FC = () => {
    const handleConnectGmail = () => {
        // Logic to trigger Google Auth with 'gmail.readonly' scope
        // This usually redirects to Google login
        alert("Redirecting to Gmail Authorization...");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Email</h1>
            <Card className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                    alt="Gmail" 
                    className="w-16 h-16 mx-auto mb-4"
                />
                <h2 className="text-xl font-bold text-gray-700">Connect your Workspace Email</h2>
                <p className="text-gray-500 mb-6">View your work emails directly in the portal.</p>
                <Button onClick={handleConnectGmail}>Connect Gmail</Button>
            </Card>
        </div>
    );
};
export default EmployeeEmailPage;