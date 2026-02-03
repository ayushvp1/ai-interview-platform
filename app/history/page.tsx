"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, User, TrendingUp, ArrowLeft, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

    useEffect(() => {
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

    const clearAllHistory = async () => {
        if (!confirm("Are you sure you want to clear ALL interview history? This cannot be undone.")) return;

        try {
            // Since we don't have a specific user context here, let's ask for a name or clear all for all users?
            // Actually, the clear-logs API requires userName. Let's find unique userNames in history and clear them or 
            // modify API to support "clear ALL". 
            // For now, let's just clear for all usernames found in the current list.
            const uniqueUsers = Array.from(new Set(interviews.map(i => i.user_info.name)));

            for (const user of uniqueUsers) {
                await fetch("/api/clear-logs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName: user })
                });
            }

            setInterviews([]);
            alert("All history cleared!");
        } catch (error) {
            console.error("Clear all error:", error);
            alert("An error occurred.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500">Loading interview history...</p>
            </div>
        );
    }

    if (selectedInterview) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <button
                        onClick={() => setSelectedInterview(null)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to History
                    </button>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {selectedInterview.user_info.name}'s Interview
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {selectedInterview.user_info.interview_type} Interview • {new Date(selectedInterview.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <div className={cn("text-4xl font-bold",
                                getScore(selectedInterview.evaluation) >= 80 ? "text-emerald-600" :
                                    getScore(selectedInterview.evaluation) >= 60 ? "text-amber-500" : "text-red-500"
                            )}>
                                {getScore(selectedInterview.evaluation)}/100
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Feedback</h3>
                                <p className="text-slate-600">{getFeedback(selectedInterview.evaluation)}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2 text-emerald-600">Strengths</h3>
                                    <ul className="space-y-2">
                                        {(selectedInterview.evaluation?.strengths || []).map((s, i) => (
                                            <li key={i} className="text-slate-600 text-sm flex gap-2">
                                                <span className="text-emerald-500">✓</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2 text-red-600">Areas to Improve</h3>
                                    <ul className="space-y-2">
                                        {(selectedInterview.evaluation?.areas_for_improvement || []).map((a, i) => (
                                            <li key={i} className="text-slate-600 text-sm flex gap-2">
                                                <span className="text-red-500">•</span> {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4">Interview Transcript</h3>
                                <div className="bg-slate-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                                    {selectedInterview.chat_history.map((msg, i) => (
                                        <div key={i} className={cn("p-3 rounded-lg",
                                            msg.role === "user" ? "bg-blue-100 ml-8" : "bg-white mr-8 border"
                                        )}>
                                            <p className="text-xs text-slate-500 mb-1">{msg.role === "user" ? "Candidate" : "Interviewer"}</p>
                                            <p className="text-sm text-slate-700">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Interview History</h1>
                        <p className="text-slate-500 mt-1">View all past interview reports</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={clearAllHistory}
                            className="px-6 py-2 border-2 border-red-100 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                            Clear All
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            New Interview
                        </Link>
                    </div>
                </div>

                {interviews.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">No Interviews Yet</h2>
                        <p className="text-slate-500 mb-6">Complete an interview to see reports here</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Start Your First Interview
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {interviews.map((interview) => (
                            <div
                                key={interview.id}
                                onClick={() => setSelectedInterview(interview)}
                                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <User className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{interview.user_info.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <FileText size={14} />
                                                    {interview.user_info.interview_type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(interview.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("text-2xl font-bold",
                                            getScore(interview.evaluation) >= 80 ? "text-emerald-600" :
                                                getScore(interview.evaluation) >= 60 ? "text-amber-500" : "text-red-500"
                                        )}>
                                            {getScore(interview.evaluation)}/100
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => deleteInterview(interview.id, e)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <Eye className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
