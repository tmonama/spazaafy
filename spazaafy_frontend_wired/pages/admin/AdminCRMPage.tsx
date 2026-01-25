import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Folder, Plus, Calendar, ChevronRight } from 'lucide-react';

const AdminCRMPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const data = await mockApi.crm.listCampaigns();
            setCampaigns(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreate = async () => {
        const name = prompt("Enter Campaign Name:");
        if (name) {
            await mockApi.crm.createCampaign(name);
            fetchCampaigns();
        }
    };

    if (loading) return <div className="p-8">Loading CRM...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Campaigns</h1>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" /> New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                    <Link to={`/admin/crm/${camp.id}`} key={camp.id} className="block group">
                        <Card className="h-full hover:border-blue-500 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Folder size={24} />
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${
                                    camp.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {camp.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600">
                                {camp.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar size={14} className="mr-1" />
                                {new Date(camp.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {camp.template_count} Templates
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminCRMPage;