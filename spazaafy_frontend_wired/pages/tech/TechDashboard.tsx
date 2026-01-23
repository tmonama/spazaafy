import React, { useEffect, useState } from 'react';
import { techApi } from '../../api/techApi';
import { 
  CheckCircle, Clock, AlertTriangle, Activity, 
  Server, ShieldAlert, Monitor, Users 
} from 'lucide-react';

// Simple Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Simple Progress Bar Component for Charts
const ProgressBar = ({ label, count, total, colorClass }: any) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const TechDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Retrieve token from storage
  const token = sessionStorage.getItem('access') || localStorage.getItem('access') || '';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if(token) {
           const data = await techApi.getDashboardStats(token);
           setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch tech stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const { summary, by_category, by_status } = stats;

  // Helper to get count safely
  const getCount = (arr: any[], key: string) => {
      const item = arr.find((i: any) => i.category === key || i.status === key);
      return item ? item.count : 0;
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tech Support Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Tickets" 
          value={summary.total} 
          icon={Activity} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pending / Open" 
          value={summary.pending} 
          icon={AlertTriangle} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Resolved" 
          value={summary.resolved} 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Avg Resolution Time" 
          value={`${summary.avg_resolution_hours} hrs`} 
          icon={Clock} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2" /> Tickets by Category
          </h3>
          <ProgressBar 
            label="IT Support (Hardware/Software)" 
            count={getCount(by_category, 'IT_SUPPORT')} 
            total={summary.total} 
            colorClass="bg-blue-500" 
          />
          <ProgressBar 
            label="Access & Permissions" 
            count={getCount(by_category, 'ACCESS')} 
            total={summary.total} 
            colorClass="bg-purple-500" 
          />
          <ProgressBar 
            label="System Bugs" 
            count={getCount(by_category, 'BUG')} 
            total={summary.total} 
            colorClass="bg-red-500" 
          />
          <ProgressBar 
            label="Support Referrals (Escalated)" 
            count={getCount(by_category, 'REFERRAL')} 
            total={summary.total} 
            colorClass="bg-orange-500" 
          />
        </div>

        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Monitor className="w-5 h-5 mr-2" /> Pipeline Status
          </h3>
          <div className="space-y-4">
             {/* Visual Pipeline representation */}
             <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xl font-bold text-gray-700 dark:text-gray-200">{getCount(by_status, 'PENDING')}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{getCount(by_status, 'INVESTIGATING')}</div>
                    <div className="text-xs text-yellow-600/70">Investigating</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{getCount(by_status, 'FIXING')}</div>
                    <div className="text-xs text-blue-600/70">Fixing</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{getCount(by_status, 'RESOLVED')}</div>
                    <div className="text-xs text-green-600/70">Closed</div>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                    <strong>Insight:</strong> System bugs are taking approx {summary.avg_resolution_hours} hours to resolve on average.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechDashboard;