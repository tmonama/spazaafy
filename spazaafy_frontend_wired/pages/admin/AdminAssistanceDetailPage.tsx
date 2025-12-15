// src/pages/admin/AdminAssistanceDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import { AssistanceRequest } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ReferralModal from '../../components/ReferralModal';

const AdminAssistanceDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!requestId) return;
      setLoading(true);
      try {
        const data = await mockApi.assistance.getById(requestId);
        setRequest(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [requestId]);

  const handleReferral = async (name: string, email: string) => {
    if (!requestId) return;
    try {
      await mockApi.assistance.refer([requestId], name, email);
      alert("Referral sent successfully!");
      navigate('/admin/assistance'); // Go back to list
    } catch (err) {
      console.error(err);
      alert("Failed to send referral.");
    }
  };

  if (loading) return <p className="p-8">Loading details...</p>;
  if (!request) return <p className="p-8">Request not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/admin/assistance" className="text-primary hover:underline">&larr; Back to Requests</Link>
        <Button onClick={() => setIsModalOpen(true)}>Refer Request</Button>
      </div>

      <Card title={`Request ${request.referenceCode}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">Shop Name</p>
              <p className="text-lg font-bold">{request.shopName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Service Type</p>
              <p className="text-lg">{request.assistanceType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Status</p>
              <span className="inline-block px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700">
                {request.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Date Requested</p>
              <p>{new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <hr className="dark:border-gray-700" />

          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Owner Information</p>
            <p>{request.ownerName}</p>
            <p>{request.ownerEmail}</p>
            <p>{request.ownerPhone}</p>
          </div>

          <hr className="dark:border-gray-700" />

          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Owner Comments</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">
              {request.comments}
            </div>
          </div>
        </div>
      </Card>

      <ReferralModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReferral}
        count={1}
      />
    </div>
  );
};

export default AdminAssistanceDetailPage;