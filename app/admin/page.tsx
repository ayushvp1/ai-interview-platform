"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Settings, LayoutDashboard, LogOut, Code, Users, Briefcase,
    Zap, Clock, Target, Award, ListChecks, ArrowRight, Save,
    CheckCircle2, AlertCircle, Loader2, Download, Table, UserPlus, Mail, Phone,
    Edit3, Trash2, Plus, Search, X, Check
} from "lucide-react";

import { cn } from "@/lib/utils";
import { adminFetch, logoutAdmin } from "@/lib/admin-api";

interface InterviewType {
    _id: string;
    name: string;
    description: string;
}

interface ComponentConfig {
    name: string;
    settings: {
        questions: number;
        timeLimit: number;
        difficulty: string;
        passingScore: number;
    };
}

interface Candidate {
    _id: string;
    name: string;
    email: string;
    phone: string;
    interviewType: string;
    createdAt: string;
}

type Tab = 'config' | 'leads';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('leads');
    const [types, setTypes] = useState<InterviewType[]>([]);
    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [config, setConfig] = useState<ComponentConfig[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Lead Management State
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Partial<Candidate> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.replace("/admin/login");
            return;
        }
        setIsAuthorized(true);
        fetchCandidates();
    }, []);

    const fetchInitialData = async () => {
        try {
            const typesResult = await adminFetch("/interview-types");
            if (typesResult.success) {
                setTypes(typesResult.data);
                if (typesResult.data.length > 0) {
                    handleSelectType(typesResult.data[0]);
                }
            }
        } catch (err: any) {
            if (err.status === 401) router.push("/admin/login");
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const result = await adminFetch("/candidates");
            if (result.success) {
                setCandidates(result.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch leads:", err);
            if (err.status === 401) {
                localStorage.removeItem("admin_token");
                router.replace("/admin/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectType = async (type: InterviewType) => {
        setSelectedType(type);
        setLoading(true);
        setMessage(null);
        try {
            const configResult = await adminFetch(`/interview-config/${type._id}`);
            if (configResult.success && configResult.data) {
                setConfig(configResult.data.components || []);
            }
        } catch (err) {
            setConfig([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = (index: number, field: string, value: any) => {
        const newConfig = [...config];
        if (field === 'name') newConfig[index].name = value;
        else (newConfig[index].settings as any)[field] = value;
        setConfig(newConfig);
    };

    const handleSave = async () => {
        if (!selectedType) return;
        setSaving(true);
        setMessage(null);
        try {
            await adminFetch(`/interview-config/${selectedType._id}`, {
                method: "PUT",
                body: JSON.stringify({ components: config }),
            });
            setMessage({ type: 'success', text: "Configuration saved successfully!" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to save configuration." });
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadExcel = () => {
        downloadExcelSecure();
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        try {
            await adminFetch(`/candidates/${id}`, { method: "DELETE" });
            setCandidates(prev => prev.filter(c => c._id !== id));
            setMessage({ type: 'success', text: "Lead deleted successfully." });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to delete lead." });
        }
    };

    const handleOpenAddModal = () => {
        setEditingLead({
            name: "",
            email: "",
            phone: "",
            interviewType: types[0]?.name || "Technical"
        });
        setIsLeadModalOpen(true);
    };

    const handleOpenEditModal = (lead: Candidate) => {
        setEditingLead({ ...lead });
        setIsLeadModalOpen(true);
    };

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;
        setSaving(true);
        try {
            const isEditing = !!editingLead._id;
            const endpoint = isEditing ? `/candidates/${editingLead._id}` : "/candidates";
            const method = isEditing ? "PUT" : "POST";

            const result = await adminFetch(endpoint, {
                method,
                body: JSON.stringify(editingLead),
            });

            if (result.success) {
                if (isEditing) {
                    setCandidates(prev => prev.map(c => c._id === editingLead._id ? result.data : c));
                } else {
                    setCandidates(prev => [result.data, ...prev]);
                }
                setIsLeadModalOpen(false);
                setMessage({ type: 'success', text: `Lead ${isEditing ? 'updated' : 'added'} successfully.` });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to save lead." });
        } finally {
            setSaving(false);
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const downloadExcelSecure = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/candidates/export`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const getTypeIcon = (name: string) => {
        if (name.includes("Technical")) return <Code className="w-5 h-5" />;
        if (name.includes("HR")) return <Users className="w-5 h-5" />;
        if (name.includes("Managerial")) return <Briefcase className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Verifying Authorization...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-white/5 p-6 z-50">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Admin Console</span>
                </div>

                <nav className="space-y-1 mb-8">
                    <button
                        onClick={() => { setActiveTab('leads'); fetchCandidates(); setMessage(null); }}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'leads' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-semibold">Candidate Leads</span>
                    </button>
                </nav>



                <div className="absolute bottom-6 left-6 right-6">
                    <button onClick={logoutAdmin} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-72 pt-8 pb-12 min-h-screen">
                <div className="max-w-5xl mx-auto px-10">

                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-2">Candidate Leads</h2>
                                    <p className="text-slate-400">Manage and export your potential candidates.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search leads..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-all"
                                        />
                                    </div>
                                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-blue-600/20 transition-all">
                                        <Plus className="w-5 h-5" />
                                        Add Lead
                                    </button>
                                    <button onClick={downloadExcelSecure} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold border border-white/5 transition-all">
                                        <Download className="w-5 h-5" />
                                        Export
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={cn("mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2", message.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <p className="font-medium">{message.text}</p>
                                    <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                                </div>
                            )}


                            <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4">Candidate</th>
                                            <th className="px-6 py-4">Interview Type</th>
                                            <th className="px-6 py-4">Date Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredCandidates.map((c) => (
                                            <tr key={c._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="font-bold text-white">{c.name}</div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{c.email}</span>
                                                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{c.phone}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase">{c.interviewType}</span>
                                                </td>
                                                <td className="px-6 py-6 text-sm text-slate-500">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenEditModal(c)}
                                                            className="p-2 bg-white/5 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-all"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLead(c._id)}
                                                            className="p-2 bg-white/5 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCandidates.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic">No candidate leads found matching your search.</td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                </div>
            </main>

            {/* Lead Modal */}
            {isLeadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsLeadModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-white">{editingLead?._id ? 'Edit Lead' : 'Add New Lead'}</h3>
                                <button onClick={() => setIsLeadModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveLead} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2 ml-1">Full Name</label>
                                    <input
                                        required
                                        value={editingLead?.name || ""}
                                        onChange={e => setEditingLead(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2 ml-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={editingLead?.email || ""}
                                            onChange={e => setEditingLead(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2 ml-1">Phone</label>
                                        <input
                                            required
                                            value={editingLead?.phone || ""}
                                            onChange={e => setEditingLead(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2 ml-1">Interview Path</label>
                                    <select
                                        value={editingLead?.interviewType || ""}
                                        onChange={e => setEditingLead(prev => ({ ...prev, interviewType: e.target.value }))}
                                        className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                    >
                                        {types.map(t => (
                                            <option key={t._id} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsLeadModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        {editingLead?._id ? 'Update Lead' : 'Create Lead'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
