"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, Briefcase, Code, UserCheck, 
    History, TrendingUp, LogOut, Award, 
    ChevronRight, Clock, Star, Brain, Target, FileText, Mic, Video, Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewRecord {
    id: string;
    type: string;
    date: string;
    score: number;
}

export default function CandidateDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<InterviewRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("interview_user_info");
        const token = localStorage.getItem("candidate_token");

        if (!stored || !token) {
            router.push("/");
            return;
        }

        const userData = JSON.parse(stored);
        setUser(userData);

        // Load history from local logs (since we save them as JSON files locally in this project)
        // In a real app, this would be an API call to the backend
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/history?userName=${encodeURIComponent(userData.name)}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error("Error loading history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("candidate_token");
        localStorage.removeItem("interview_user_info");
        localStorage.removeItem("chat_history");
        router.push("/");
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Floating Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-6 py-3 shadow-2xl shadow-slate-950/50 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Brain className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-white tracking-tight hidden sm:inline-block">AI Interview</span>
                    </div>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/candidate/dashboard" className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-white/10 hover:backdrop-blur-md border border-white/10 transition-all">
                            Dashboard
                        </Link>
                        <Link href="/history" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                            History
                        </Link>
                    </div>

                    {/* User & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right px-4 border-r border-slate-800 group/user relative cursor-default">
                            <p className="text-xs font-bold text-white transition-colors group-hover/user:text-blue-400">{user.name}</p>
                            <p className="text-[10px] text-slate-500 absolute right-4 top-full mt-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2 py-1 rounded-md opacity-0 group-hover/user:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[60]">
                                {user.email}
                            </p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="h-24" /> {/* Spacer for fixed navbar */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}!</h1>
                    <p className="text-slate-400 mt-2">Ready to sharpen your skills today?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Modules & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Award size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">Average Score</span>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {history.length > 0 
                                        ? `${Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length)}%`
                                        : "0%"
                                    }
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">Latest Score</span>
                                    </div>
                                <div className="text-3xl font-bold text-white">
                                    {history.length > 0 ? `${history[0].score}%` : "0%"}
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">Interviews Done</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{history.length}</div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Start New Interview</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col h-full">
                                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 w-fit mb-6 group-hover:scale-110 transition-transform">
                                        <Code size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Technical</h3>
                                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">Master DSA, System Design, and Frontend/Backend challenges.</p>
                                    
                                    <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-800/50">
                                        <Link href="/interview/technical" className="group/btn relative flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl transition-all duration-300 w-[52px] hover:w-[100px] shadow-lg shadow-blue-600/20" title="Text Interview">
                                            <Keyboard size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/voice/technical" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Voice Interview">
                                            <Mic size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/video/technical" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Video Interview">
                                            <Video size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col h-full">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 w-fit mb-6 group-hover:scale-110 transition-transform">
                                        <UserCheck size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">HR / Fit</h3>
                                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">Perfect your behavioral responses and cultural alignment.</p>
                                    
                                    <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-800/50">
                                        <Link href="/interview/hr" className="group/btn relative flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-xl transition-all duration-300 w-[52px] hover:w-[100px] shadow-lg shadow-emerald-600/20" title="Text Interview">
                                            <Keyboard size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/voice/hr" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Voice Interview">
                                            <Mic size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/video/hr" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Video Interview">
                                            <Video size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col h-full">
                                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 w-fit mb-6 group-hover:scale-110 transition-transform">
                                        <Briefcase size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Managerial</h3>
                                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">Strategy, leadership, and conflict resolution practice.</p>
                                    
                                    <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-800/50">
                                        <Link href="/interview/managerial" className="group/btn relative flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-xl transition-all duration-300 w-[52px] hover:w-[100px] shadow-lg shadow-purple-600/20" title="Text Interview">
                                            <Keyboard size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/voice/managerial" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Voice Interview">
                                            <Mic size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                        <Link href="/interview/video/managerial" className="group/btn relative flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 w-[52px] hover:w-[100px]" title="Video Interview">
                                            <Video size={20} className="transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50" />
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 group-hover/btn:opacity-100 transition-all duration-300">Start</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <History size={20} className="text-blue-500" />
                                    Recent Activity
                                </h2>
                                <Link href="/history" className="text-xs text-blue-400 hover:underline">View All</Link>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {history.slice(0, 5).map((item) => (
                                    <Link key={item.id} href={`/feedback?id=${item.id}`} className="block p-4 hover:bg-slate-800/50 transition-colors group/item">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-white group-hover/item:text-blue-400 transition-colors">{item.type} Interview</span>
                                            <span className={cn(
                                                "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                                item.score >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {item.score}% Score
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={12} />
                                            {item.date}
                                        </div>
                                    </Link>
                                ))}
                                {history.length === 0 && (
                                    <div className="p-12 text-center">
                                        <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="text-slate-500" />
                                        </div>
                                        <p className="text-slate-400 text-sm">No interviews yet.</p>
                                        <p className="text-slate-600 text-xs mt-1">Your history will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Tip */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={16} className="text-blue-200 fill-blue-200" />
                                    <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Expert Tip</span>
                                </div>
                                <h3 className="text-white font-bold mb-2">Boost Your Confidence</h3>
                                <p className="text-blue-100 text-xs leading-relaxed">
                                    Focus on maintaining eye contact and clear pacing during the HR round. It increases your "Cultural Fit" score by up to 15%.
                                </p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <Target size={120} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
