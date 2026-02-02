import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { employeeApi } from '../../api/employeeApi';
import { Clock, Plus, Send, Calendar, PieChart, BarChart2 } from 'lucide-react';

const PERIODS = [
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Long Term', value: 'year' }, // Backend uses 'year', we label it Long Term/6 Months
];

const EmployeeTimeCardPage: React.FC = () => {
  const token = sessionStorage.getItem('access') || '';

  // State
  const [activeTab, setActiveTab] = useState('day');
  const [todayCard, setTodayCard] = useState<any>(null); // Specific object for Today's adding
  const [summaryData, setSummaryData] = useState<any>(null); // Aggregated data for viewing
  const [loading, setLoading] = useState(true);

  // Entry Form (Only for Today)
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [minutes, setMinutes] = useState('');

  // Report Form
  const [reportEmail, setReportEmail] = useState('');

  // 1. Initial Load (Always load Today first so user can clock in)
  useEffect(() => {
    fetchToday();
  }, []);

  // 2. Fetch Summary when Tab Changes
  useEffect(() => {
    fetchSummary(activeTab);
  }, [activeTab]);

  const fetchToday = async () => {
    try {
      const data = await employeeApi.openTimeCard(token);
      setTodayCard(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummary = async (period: string) => {
    setLoading(true);
    try {
      // Cast string to specific union type required by API
      const data = await employeeApi.getTimeCardsSummary(period as 'day' | 'week' | 'month' | 'year', token);
      setSummaryData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !minutes || !todayCard) return;

    const mins = parseInt(minutes);
    if (mins <= 0) return;

    try {
      const updated = await employeeApi.addTimeEntry(
        todayCard.id,
        {
          task_name: taskName,
          task_description: taskDesc,
          minutes: mins,
        },
        token
      );

      setTodayCard(updated);
      setTaskName('');
      setTaskDesc('');
      setMinutes('');
      
      // If we are currently viewing "Today", refresh the summary too
      if (activeTab === 'day') fetchSummary('day');
      
      alert("Entry added successfully");
    } catch (error) {
      alert("Failed to add entry");
    }
  };

  const handleSendReport = async () => {
    if (!reportEmail) {
      alert('Please enter an email address.');
      return;
    }
    try {
        await employeeApi.sendTimeCardReport(
        {
            email: reportEmail,
            period: activeTab, // Send report for CURRENTLY selected period
        },
        token
        );
        alert(`Report for ${activeTab} sent successfully.`);
        setReportEmail('');
    } catch(e) {
        alert("Failed to send report.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
             <Clock className="mr-3 text-blue-600" /> Time Card
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your work hours and tasks.</p>
        </div>

        {/* Period Tabs */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActiveTab(p.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === p.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- ADD ENTRY (Visible ONLY if Today is selected) --- */}
      {activeTab === 'day' && (
        <Card className="p-6 border-l-4 border-l-blue-500">
            <h3 className="font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <Plus className="mr-2 text-blue-600" size={18} /> Log Time for Today
            </h3>

            <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
                <Input
                label="Task Name"
                placeholder="e.g. Frontend Development"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                />
            </div>
            <div className="md:col-span-5">
                <Input
                label="Description (Optional)"
                placeholder="Details..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                />
            </div>
            <div className="md:col-span-2">
                <Input
                label="Minutes"
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                required
                />
            </div>
            <div className="md:col-span-1">
                <Button type="submit" className="w-full justify-center">Add</Button>
            </div>
            </form>
        </Card>
      )}

      {/* --- STATS SUMMARY & ENTRIES --- */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading data...</div>
      ) : summaryData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Stats */}
            <div className="space-y-6">
                <Card className="p-6 text-center">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Hours</p>
                    <h2 className="text-4xl font-extrabold text-blue-600 mt-2">
                        {summaryData.total_hours} <span className="text-lg text-gray-400 font-normal">hrs</span>
                    </h2>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                        {new Date(summaryData.start).toLocaleDateString()} — {new Date(summaryData.end).toLocaleDateString()}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                        <PieChart className="mr-2 text-purple-500" size={18} /> Task Breakdown
                    </h3>
                    <div className="space-y-3">
                        {summaryData.breakdown && summaryData.breakdown.length > 0 ? (
                            summaryData.breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{item.task_name}</span>
                                    <span className="font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                        {(item.total_minutes / 60).toFixed(1)} hrs
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No tasks recorded for this period.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Right Col: Detailed View */}
            <div className="lg:col-span-2">
                <Card className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                            <BarChart2 className="mr-2 text-green-600" size={18} />
                            {activeTab === 'day' ? "Today's Logs" : "Activity Log"}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-auto p-0">
                        {/* 
                            NOTE: If viewing a long period (week/month), we ideally want a list of days.
                            Currently, we are reusing the 'todayCard' entries for 'day' view.
                            For other views, the summary API returns breakdown, not raw list.
                            
                            IF ActiveTab === 'day', show the editable list.
                            IF ActiveTab !== 'day', we show the Breakdown as the primary view (above), 
                            or we can just show a placeholder message.
                        */}
                        
                        {activeTab === 'day' ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Task</th>
                                        <th className="px-6 py-3">Notes</th>
                                        <th className="px-6 py-3 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {todayCard?.entries?.map((e: any) => (
                                        <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{e.task_name}</td>
                                            <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{e.task_description || '-'}</td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-600">
                                                {(e.minutes / 60).toFixed(2)}h
                                            </td>
                                        </tr>
                                    ))}
                                    {(!todayCard?.entries || todayCard.entries.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                                No entries logged for today yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Summary View</h4>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    You are viewing aggregated data for the selected period. 
                                    To see or edit specific line items, please select "Today" or download the full report.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Send Report */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Report for {PERIODS.find(p => p.value === activeTab)?.label}</label>
                                <Input
                                    value={reportEmail}
                                    onChange={(e) => setReportEmail(e.target.value)}
                                    placeholder="Enter email address..."
                                    className="bg-white dark:bg-gray-700"
                                />
                            </div>
                            <Button onClick={handleSendReport} className="whitespace-nowrap">
                                <Send className="mr-2" size={16} /> Send Report
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      ) : null}
    </div>
  );
};

export default EmployeeTimeCardPage;