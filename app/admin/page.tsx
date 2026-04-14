"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Settings, LayoutDashboard, LogOut, Code, Users, Briefcase,
    Zap, Clock, Target, Award, ListChecks, ArrowRight, Save,
    CheckCircle2, AlertCircle, Loader2, Download, Table, UserPlus, Mail, Phone
} from "lucide-react";
import { adminFetch, logoutAdmin } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

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
    const [activeTab, setActiveTab] = useState<Tab>('config');
    const [types, setTypes] = useState<InterviewType[]>([]);
    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [config, setConfig] = useState<ComponentConfig[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchInitialData();
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
        } catch (err) {
            console.error("Failed to fetch leads:", err);
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
        const token = localStorage.getItem("admin_token");
        window.open(`http://localhost:5000/candidates/export?token=${token}`, '_blank');
        // Note: I'll update the backend to support token via query param for easy download if needed, 
        // or we can handle it via fetch and blob. Let's do fetch/blob for security.
    };

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
                        onClick={() => { setActiveTab('config'); setMessage(null); }}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'config' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-semibold">Configurations</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('leads'); fetchCandidates(); setMessage(null); }}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'leads' ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5")}
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-semibold">Candidate Leads</span>
                    </button>
                </nav>

                {activeTab === 'config' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 ml-2">Models</p>
                        {types.map((type) => (
                            <button
                                key={type._id}
                                onClick={() => handleSelectType(type)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    selectedType?._id === type._id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {getTypeIcon(type.name)}
                                <span className="font-medium">{type.name}</span>
                            </button>
                        ))}
                    </div>
                )}

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
                    {activeTab === 'config' ? (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            {/* Dashboard Header */}
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-2">{selectedType?.name || "Select Model"}</h2>
                                    <p className="text-slate-400">{selectedType?.description}</p>
                                </div>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-blue-600/20 transition-all">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>

                            {message && (
                                <div className={cn("mb-8 p-4 rounded-xl flex items-center gap-3", message.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <p>{message.text}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {config.map((comp, idx) => (
                                    <div key={idx} className="bg-slate-900 rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Component Name</label>
                                                <input value={comp.name} onChange={e => handleUpdateConfig(idx, 'name', e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Questions</label>
                                                <input type="number" value={comp.settings.questions} onChange={e => handleUpdateConfig(idx, 'questions', parseInt(e.target.value))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Time Limit (Min)</label>
                                                <input type="number" value={comp.settings.timeLimit} onChange={e => handleUpdateConfig(idx, 'timeLimit', parseInt(e.target.value))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-2">Candidate Leads</h2>
                                    <p className="text-slate-400">Manage and export your potential candidates.</p>
                                </div>
                                <button onClick={downloadExcelSecure} className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-emerald-600/20 transition-all">
                                    <Download className="w-5 h-5" />
                                    Export to Excel
                                </button>
                            </div>

                            <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4">Candidate</th>
                                            <th className="px-6 py-4">Interview Type</th>
                                            <th className="px-6 py-4">Date Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {candidates.map((c) => (
                                            <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
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
                                            </tr>
                                        ))}
                                        {candidates.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-20 text-center text-slate-500 italic">No candidate leads found yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
