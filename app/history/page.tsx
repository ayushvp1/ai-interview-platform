"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    FileText, Calendar, User, TrendingUp, ArrowLeft, 
    Eye, Trash2, Brain, LogOut, ChevronRight, 
    Award, Shield, CheckCircle, Code, Users, Briefcase, Clock, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Interview {
    id: string;
    timestamp: string;
    user_info: {
        name: string;
        email?: string;
        interview_type: string;
    };
    evaluation?: {
        overall_score?: number;
        score?: number; // legacy field
        general_feedback?: string;
        feedback?: string; // legacy field
        strengths?: string[];
        areas_for_improvement?: string[];
        parameter_scores?: any;
    };
    chat_history: any[];
}

// Helper function to safely get score
function getScore(evaluation: Interview['evaluation']): number {
    if (!evaluation) return 0;
    return evaluation.overall_score ?? evaluation.score ?? 0;
}

// Helper function to safely get feedback
function getFeedback(evaluation: Interview['evaluation']): string {
    if (!evaluation) return "No feedback available";
    return evaluation.general_feedback ?? evaluation.feedback ?? "No feedback available";
}

export default function HistoryPage() {
    const router = useRouter();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("interview_user_info");
        if (stored) setUser(JSON.parse(stored));

        const fetchInterviews = async () => {
            try {
                const response = await fetch("/api/interviews");
                if (response.ok) {
                    const data = await response.json();
                    setInterviews(data.interviews || []);
                }
            } catch (error) {
                console.error("Error fetching interviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    const deleteInterview = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this interview record?")) return;

        try {
            const res = await fetch("/api/clear-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setInterviews(prev => prev.filter(i => i.id !== id));
            } else {
                alert("Failed to delete interview.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("candidate_token");
        localStorage.removeItem("interview_user_info");
        router.push("/");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto text-blue-500 w-6 h-6 animate-pulse" />
                </div>
                <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">Accessing Records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            {/* Floating Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-6 py-3 shadow-2xl shadow-slate-950/50 flex items-center justify-between">
                    <Link href="/candidate/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                            <Brain className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-white tracking-tight hidden sm:inline-block">AI Interview</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/candidate/dashboard" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">Dashboard</Link>
                        <Link href="/history" className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-white/10 hover:backdrop-blur-md border border-white/10 transition-all">History</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right px-4 border-r border-slate-800 group/user relative cursor-default">
                            <p className="text-xs font-bold text-white transition-colors group-hover/user:text-blue-400">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 absolute right-4 top-full mt-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2 py-1 rounded-md opacity-0 group-hover/user:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[60]">
                                {user?.email}
                            </p>
                        </div>
                        <button onClick={handleLogout} className="bg-slate-800 text-slate-300 text-xs font-bold px-5 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center gap-2 border border-slate-700">
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="h-28" />

            <main className="max-w-5xl mx-auto px-6 pb-20">
                {selectedInterview ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => setSelectedInterview(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Back to History
                        </button>

                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase border border-blue-500/20">
                                            {selectedInterview.user_info.interview_type} Report
                                        </div>
                                        <h1 className="text-4xl font-black text-white tracking-tight">
                                            {selectedInterview.user_info.name}
                                        </h1>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-blue-500" />
                                                {new Date(selectedInterview.timestamp).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <div className="flex items-center gap-2 text-sm">
                                                <Shield size={16} className="text-emerald-500" />
                                                Verified Assessment
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative group">
                                        <div className={cn(
                                            "w-28 h-28 rounded-[2rem] flex flex-col items-center justify-center border-2 transition-all duration-500 group-hover:scale-105 shadow-2xl",
                                            getScore(selectedInterview.evaluation) >= 80 ? "bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/20" :
                                            getScore(selectedInterview.evaluation) >= 60 ? "bg-amber-500/10 border-amber-500/50 shadow-amber-500/20" : 
                                            "bg-red-500/10 border-red-500/50 shadow-red-500/20"
                                        )}>
                                            <span className={cn(
                                                "text-3xl font-black",
                                                getScore(selectedInterview.evaluation) >= 80 ? "text-emerald-500" :
                                                getScore(selectedInterview.evaluation) >= 60 ? "text-amber-500" : "text-red-500"
                                            )}>{getScore(selectedInterview.evaluation)}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-800/50">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <TrendingUp size={20} className="text-blue-500" />
                                                General Feedback
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed text-sm">
                                                {getFeedback(selectedInterview.evaluation)}
                                            </p>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
                                                <h3 className="text-emerald-500 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <CheckCircle size={16} />
                                                    Key Strengths
                                                </h3>
                                                <ul className="space-y-3">
                                                    {(selectedInterview.evaluation?.strengths || []).map((s, i) => (
                                                        <li key={i} className="text-slate-300 text-sm flex gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                            </div>
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                                                <h3 className="text-red-500 font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <Target size={16} />
                                                    Areas to Improve
                                                </h3>
                                                <ul className="space-y-3">
                                                    {(selectedInterview.evaluation?.areas_for_improvement || []).map((a, i) => (
                                                        <li key={i} className="text-slate-300 text-sm flex gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                            </div>
                                                            {a}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col h-[600px]">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <FileText size={20} className="text-purple-500" />
                                            Transcript
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                                            {selectedInterview.chat_history.map((msg, i) => (
                                                <div key={i} className={cn(
                                                    "p-5 rounded-2xl relative group/msg",
                                                    msg.role === "user" ? "bg-blue-600/10 border border-blue-500/20 ml-8" : "bg-slate-800/50 border border-slate-700/50 mr-8"
                                                )}>
                                                    <span className="absolute -top-3 left-4 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                        {msg.role === "user" ? "Candidate" : "AI Interviewer"}
                                                    </span>
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tight mb-2">History</h1>
                                <p className="text-slate-500 font-medium">Your journey to professional mastery, recorded.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (confirm("Clear all your interview history? This cannot be undone.")) {
                                            fetch("/api/clear-logs", { method: "POST", body: JSON.stringify({ userName: user?.name }), headers: { "Content-Type": "application/json" } })
                                                .then(() => setInterviews([]));
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Clear Records
                                </button>
                            </div>
                        </div>

                        {interviews.length === 0 ? (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-20 text-center relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                                <div className="relative z-10">
                                    <FileText className="w-20 h-20 text-slate-800 mx-auto mb-6 animate-bounce" />
                                    <h2 className="text-2xl font-bold text-white mb-2">The files are empty!</h2>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't completed any interviews yet. Start your first session to unlock your performance metrics.</p>
                                    <Link
                                        href="/candidate/dashboard"
                                        className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1"
                                    >
                                        Start Interview
                                        <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {interviews.map((interview) => (
                                    <div
                                        key={interview.id}
                                        onClick={() => setSelectedInterview(interview)}
                                        className="group bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex items-center gap-6"
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                            interview.user_info.interview_type === "Technical" ? "bg-blue-500/10 text-blue-500" :
                                            interview.user_info.interview_type === "HR" ? "bg-emerald-500/10 text-emerald-500" :
                                            "bg-purple-500/10 text-purple-500"
                                        )}>
                                            {interview.user_info.interview_type === "Technical" ? <Code size={32} /> :
                                             interview.user_info.interview_type === "HR" ? <Users size={32} /> :
                                             <Briefcase size={32} />
                                            }
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">
                                                    {interview.user_info.interview_type} Interview
                                                </h3>
                                                <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                                    {new Date(interview.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} className="text-slate-600" />
                                                    {interview.user_info.name}
                                                </div>
                                                <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-slate-600" />
                                                    {new Date(interview.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pr-2">
                                            <div className={cn(
                                                "px-4 py-2 rounded-xl text-lg font-black min-w-[70px] text-center border",
                                                getScore(interview.evaluation) >= 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                getScore(interview.evaluation) >= 60 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {getScore(interview.evaluation)}%
                                            </div>
                                            
                                            <button
                                                onClick={(e) => deleteInterview(interview.id, e)}
                                                className="p-3 bg-slate-800/50 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            
                                            <div className="text-slate-700 group-hover:text-blue-500 transition-colors">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
