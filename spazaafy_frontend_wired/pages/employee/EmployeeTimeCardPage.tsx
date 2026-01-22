import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { employeeApi } from '../../api/employeeApi';
import { Clock, Plus, Send } from 'lucide-react';

const EmployeeTimeCardPage: React.FC = () => {
  const token = sessionStorage.getItem('access') || '';

  const [timecard, setTimecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Entry form
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [minutes, setMinutes] = useState('');

  // Report
  const [reportEmail, setReportEmail] = useState('');
  const [period, setPeriod] = useState('week');

  const fetchTodayTimecard = async () => {
    setLoading(true);
    const data = await employeeApi.openTimeCard(token);
    setTimecard(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayTimecard();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !minutes) return;

    const mins = parseInt(minutes);
    if (mins <= 0) return;

    const updated = await employeeApi.addTimeEntry(
      timecard.id,
      {
        task_name: taskName,
        task_description: taskDesc,
        minutes: mins,
      },
      token
    );

    setTimecard(updated);
    setTaskName('');
    setTaskDesc('');
    setMinutes('');
  };

  const handleSendReport = async () => {
    if (!reportEmail) {
      alert('Please enter an email address.');
      return;
    }

    await employeeApi.sendTimeCardReport(
      {
        email: reportEmail,
        period,
      },
      token
    );

    alert('Time card report sent successfully.');
    setReportEmail('');
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading time card...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Card</h1>
        <p className="text-sm text-gray-500">
          Log tasks completed for <strong>{timecard.work_date}</strong>
        </p>
      </div>

      {/* ADD ENTRY */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center">
          <Plus className="mr-2 text-blue-600" /> Add Task Entry
        </h3>

        <form onSubmit={handleAddEntry} className="space-y-4">
          <Input
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">Task Description (optional)</label>
            <textarea
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <Input
            label="Time Spent (minutes)"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
          />

          <div className="flex justify-center pt-2">
            <Button type="submit">
              <Clock className="mr-2" size={16} />
              Add Entry
            </Button>
          </div>
        </form>
      </Card>

      {/* ENTRIES TABLE */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Today’s Entries</h3>

        {timecard.entries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Task</th>
                  <th className="px-4 py-2 text-left">Minutes</th>
                  <th className="px-4 py-2 text-left">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {timecard.entries.map((e: any) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 font-medium">{e.task_name}</td>
                    <td className="px-4 py-2">{e.minutes}</td>
                    <td className="px-4 py-2">
                      {(e.minutes / 60).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-right font-bold">
          Total Today: {timecard.total_hours} hrs
        </div>
      </Card>

      {/* SEND REPORT */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center">
          <Send className="mr-2 text-green-600" /> Send Time Card Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Email"
            type="email"
            value={reportEmail}
            onChange={(e) => setReportEmail(e.target.value)}
            placeholder="example@email.com"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <select
              className="w-full border rounded-md p-3"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleSendReport} className="w-full">
              Send Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeTimeCardPage;
