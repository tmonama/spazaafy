import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { 
    ArrowLeft, Plus, Mail, Settings, 
    Link as LinkIcon, Trash2, BarChart2,
    Calendar, CheckCircle, XCircle
} from 'lucide-react';

// Configuration for Template Purposes (Colors & Labels)
const PURPOSE_OPTS = [
    { value: 'GENERAL', label: 'General Announcement', color: '#6b7280', bg: 'bg-gray-500' },
    { value: 'NEW_FEATURE', label: 'New Feature Launch', color: '#1e1e1e', bg: 'bg-gray-900' }, // Apple style
    { value: 'UPDATE', label: 'System Update', color: '#22c55e', bg: 'bg-green-600' },
    { value: 'EVENT', label: 'Event Invitation', color: '#ef4444', bg: 'bg-red-500' },
];

const RECIPIENT_OPTS = [
    { value: 'consumers', label: 'Consumers' },
    { value: 'owners', label: 'Spaza Shop Owners' },
    { value: 'employees', label: 'Employees' },
    { value: 'admin', label: 'Admins (HR, Legal, Tech)' },
];

const AdminCampaignDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Template Form State (Create & Edit) ---
    const [createModalOpen, setCreateModalOpen] = useState(false);
    
    // If null, we are creating. If string, we are editing that ID.
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    const [newTemplate, setNewTemplate] = useState({
        name: '',
        subject: '',
        purpose: 'GENERAL',
        content: '',
        links: [] as { label: string, url: string, type: 'button' | 'text' }[]
    });
    
    // Temporary Link State (for the "Add Link" section inputs)
    const [tempLink, setTempLink] = useState({ label: '', url: '', type: 'button' as 'button' | 'text' });

    // --- Send Email Modal State ---
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    // 1. Fetch Data
    const fetchData = async () => {
        if (!id) return;
        try {
            const [c, t] = await Promise.all([
                mockApi.crm.getCampaign(id),
                mockApi.crm.getTemplates(id)
            ]);
            setCampaign(c);
            setTemplates(t);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // 2. Form Handlers

    // Open Modal for Creation
    const openCreateModal = () => {
        setEditingTemplateId(null); // Reset edit state
        setNewTemplate({ name: '', subject: '', purpose: 'GENERAL', content: '', links: [] });
        setTempLink({ label: '', url: '', type: 'button' });
        setCreateModalOpen(true);
    };

    // Open Modal for Editing (Pre-fill)
    const openEditModal = (tpl: any) => {
        setEditingTemplateId(tpl.id);
        setNewTemplate({
            name: tpl.name,
            subject: tpl.subject,
            purpose: tpl.purpose,
            content: tpl.content,
            links: tpl.links || []
        });
        setTempLink({ label: '', url: '', type: 'button' });
        setCreateModalOpen(true);
    };

    // Handle Save (Create OR Update)
    const handleSaveTemplate = async () => {
        if (!id) return;
        if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (editingTemplateId) {
                // UPDATE
                await mockApi.crm.updateTemplate(editingTemplateId, newTemplate);
            } else {
                // CREATE
                await mockApi.crm.createTemplate(id, newTemplate);
            }

            setCreateModalOpen(false);
            setEditingTemplateId(null);
            fetchData(); // Refresh list
        } catch (e) {
            console.error(e);
            alert("Failed to save template.");
        }
    };

    const addLinkToTemplate = () => {
        if (tempLink.label && tempLink.url) {
            setNewTemplate({ ...newTemplate, links: [...newTemplate.links, tempLink] });
            setTempLink({ label: '', url: '', type: 'button' }); // Reset inputs
        }
    };

    const removeLinkFromTemplate = (index: number) => {
        setNewTemplate({ 
            ...newTemplate, 
            links: newTemplate.links.filter((_, i) => i !== index) 
        });
    };

    // 3. Send Handlers
    const handleSendEmail = async () => {
        if (!selectedTemplateId || selectedRecipients.length === 0) return;
        setSending(true);
        try {
            const res = await mockApi.crm.sendEmail(selectedTemplateId, selectedRecipients);
            alert(res.detail);
            setSendModalOpen(false);
            setSelectedRecipients([]);
        } catch (e) {
            console.error(e);
            alert("Failed to send emails. Check console for details.");
        } finally {
            setSending(false);
        }
    };

    // 4. Campaign Status Handler
    const toggleStatus = async () => {
        if (!campaign) return;
        const newStatus = campaign.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        await mockApi.crm.updateCampaignStatus(campaign.id, newStatus);
        fetchData();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Campaign...</div>;
    if (!campaign) return <div className="p-8 text-center text-red-500">Campaign not found.</div>;

    return (
        <div className="space-y-6">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/crm" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {campaign.name}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                                campaign.status === 'OPEN' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                                {campaign.status === 'OPEN' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                {campaign.status}
                            </span>
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar size={14} className="mr-1" />
                            Created on {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="neutral" onClick={toggleStatus}>
                        {campaign.status === 'OPEN' ? 'Close Campaign' : 'Re-open Campaign'}
                    </Button>
                    {campaign.status === 'OPEN' && (
                        <Button onClick={openCreateModal}>
                            <Plus className="w-4 h-4 mr-2" /> New Template
                        </Button>
                    )}
                </div>
            </div>

            {/* --- TEMPLATES GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => {
                    const purposeStyle = PURPOSE_OPTS.find(p => p.value === tpl.purpose);
                    
                    return (
                        <Card key={tpl.id} className="flex flex-col h-full group hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
                            
                            {/* CLICKABLE BODY -> GO TO ANALYTICS */}
                            <Link to={`/admin/crm/template/${tpl.id}/analytics`} className="flex-1 block cursor-pointer">
                                
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded text-white ${purposeStyle?.bg || 'bg-gray-500'}`}>
                                            {purposeStyle?.label}
                                        </span>
                                        <div className="text-xs text-gray-400 flex items-center group-hover:text-blue-500 transition-colors">
                                            <BarChart2 className="w-3 h-3 mr-1" /> Analytics
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1" title={tpl.name}>
                                        {tpl.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">Subject: {tpl.subject}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                    <p className="line-clamp-3 mb-4">{tpl.content}</p>
                                    
                                    {/* Links Preview */}
                                    {tpl.links && tpl.links.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tpl.links.map((l: any, i: number) => (
                                                <span key={i} className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 flex items-center text-gray-500">
                                                    {l.type === 'button' ? '🔘' : '🔗'} <span className="ml-1 truncate max-w-[100px]">{l.label}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* FOOTER ACTIONS */}
                            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openEditModal(tpl);
                                    }}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
                                >
                                    <Settings className="w-3 h-3 mr-1" /> Edit
                                </button>
                                
                                {campaign.status === 'OPEN' ? (
                                    <Button size="sm" onClick={(e) => { 
                                        e.preventDefault(); 
                                        setSelectedTemplateId(tpl.id); 
                                        setSendModalOpen(true); 
                                    }}>
                                        <Mail className="w-3 h-3 mr-2" /> Send Email
                                    </Button>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Campaign Closed</span>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500">No email templates yet. Create one to get started.</p>
                </div>
            )}

            {/* --- CREATE/EDIT TEMPLATE MODAL --- */}
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title={editingTemplateId ? "Edit Template" : "Create Email Template"}>
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Internal Name</label>
                            <input 
                                className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" 
                                placeholder="e.g. Q1 Update #1"
                                value={newTemplate.name} 
                                onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email Subject Line</label>
                            <input 
                                className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" 
                                placeholder="e.g. Exciting News!"
                                value={newTemplate.subject} 
                                onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Template Type (Affects Design)</label>
                        <select 
                            className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                            value={newTemplate.purpose} 
                            onChange={e => setNewTemplate({...newTemplate, purpose: e.target.value})}
                        >
                            {PURPOSE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {newTemplate.purpose === 'NEW_FEATURE' && "Uses a dark, modern tech theme (#1e1e1e)."}
                            {newTemplate.purpose === 'EVENT' && "Uses a vibrant red theme (#ef4444)."}
                            {newTemplate.purpose === 'UPDATE' && "Uses a clean green theme (#22c55e)."}
                            {newTemplate.purpose === 'GENERAL' && "Uses a standard neutral theme."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email Content (HTML supported)</label>
                        <textarea 
                            className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 font-mono text-sm" 
                            rows={6} 
                            value={newTemplate.content} 
                            onChange={e => setNewTemplate({...newTemplate, content: e.target.value})} 
                            placeholder="Write your email body here..." 
                        />
                    </div>
                    
                    {/* Add Links Section */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <h4 className="text-sm font-bold mb-3 flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2" /> Call-to-Action Links
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input 
                                className="border rounded p-2 text-sm" 
                                placeholder="Label (e.g. Read More)" 
                                value={tempLink.label} 
                                onChange={e => setTempLink({...tempLink, label: e.target.value})} 
                            />
                            <input 
                                className="border rounded p-2 text-sm" 
                                placeholder="URL (https://...)" 
                                value={tempLink.url} 
                                onChange={e => setTempLink({...tempLink, url: e.target.value})} 
                            />
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-4 text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="linkType" 
                                        className="mr-2"
                                        checked={tempLink.type === 'button'} 
                                        onChange={() => setTempLink({...tempLink, type: 'button'})} 
                                    /> Button
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="linkType" 
                                        className="mr-2"
                                        checked={tempLink.type === 'text'} 
                                        onChange={() => setTempLink({...tempLink, type: 'text'})} 
                                    /> Text Link
                                </label>
                            </div>
                            <Button size="sm" variant="secondary" onClick={addLinkToTemplate} disabled={!tempLink.label || !tempLink.url}>
                                <Plus className="w-3 h-3 mr-1" /> Add Link
                            </Button>
                        </div>

                        {/* List of Added Links */}
                        <div className="space-y-2">
                            {newTemplate.links.map((l, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold bg-gray-200 dark:bg-gray-600 px-1 rounded">{l.type.toUpperCase()}</span>
                                        <span className="text-blue-600">{l.label}</span>
                                        <span className="text-gray-400 truncate max-w-[150px]">({l.url})</span>
                                    </div>
                                    <Trash2 size={14} className="cursor-pointer text-red-500 hover:text-red-700" onClick={() => removeLinkFromTemplate(i)} />
                                </div>
                            ))}
                            {newTemplate.links.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No links added yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="neutral" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTemplate}>
                            {editingTemplateId ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* --- SEND EMAIL MODAL --- */}
            <Modal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} title="Select Recipients">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Choose which user groups should receive this email.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {RECIPIENT_OPTS.map(opt => (
                            <label key={opt.value} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedRecipients.includes(opt.value) 
                                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedRecipients.includes(opt.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedRecipients([...selectedRecipients, opt.value]);
                                        else setSelectedRecipients(selectedRecipients.filter(r => r !== opt.value));
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5"
                                />
                                <span className="font-medium text-gray-900 dark:text-gray-100">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                    
                    <div className="flex justify-end pt-6 gap-3">
                        <Button variant="neutral" onClick={() => setSendModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendEmail} disabled={sending || selectedRecipients.length === 0} className="w-32">
                            {sending ? 'Sending...' : <><Mail className="w-4 h-4 mr-2" /> Send</>}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminCampaignDetail;