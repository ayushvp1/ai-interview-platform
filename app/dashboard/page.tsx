"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart3, Users, TrendingUp, Award, Clock,
    FileText, ArrowRight, Target, Briefcase, Code, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
    total_interviews: number;
    average_score: number;
    by_type: Record<string, { count: number; avgScore: number }>;
    recent: { name: string; type: string; score: number; date: string }[];
    top_performers: { name: string; type: string; score: number }[];
    parameter_averages: Record<string, number>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500">Loading dashboard...</p>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Technical": return <Code className="w-5 h-5" />;
            case "HR": return <UserCheck className="w-5 h-5" />;
            case "Managerial": return <Briefcase className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Interview Dashboard</h1>
                        <p className="text-slate-600 mt-1">Analytics and performance overview</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/history" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors">
                            View History
                        </Link>
                        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            New Interview
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-slate-500 font-medium">Total Interviews</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">{stats?.total_interviews || 0}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-slate-500 font-medium">Average Score</span>
                        </div>
                        <div className={cn("text-4xl font-bold", getScoreColor(stats?.average_score || 0))}>
                            {stats?.average_score || 0}/100
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-slate-500 font-medium">Interview Types</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900">
                            {Object.keys(stats?.by_type || {}).length}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Award className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="text-slate-500 font-medium">Top Score</span>
                        </div>
                        <div className="text-4xl font-bold text-emerald-600">
                            {stats?.top_performers?.[0]?.score || 0}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* By Type */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Performance by Type
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats?.by_type || {}).map(([type, data]) => (
                                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon(type)}
                                        <div>
                                            <div className="font-medium text-slate-900">{type}</div>
                                            <div className="text-sm text-slate-500">{data.count} interviews</div>
                                        </div>
                                    </div>
                                    <div className={cn("text-xl font-bold", getScoreColor(data.avgScore))}>
                                        {data.avgScore}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(stats?.by_type || {}).length === 0 && (
                                <p className="text-slate-500 text-center py-4">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Interviews */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Recent Interviews
                        </h3>
                        <div className="space-y-3">
                            {stats?.recent?.map((interview, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <div className="font-medium text-slate-900">{interview.name}</div>
                                        <div className="text-sm text-slate-500">{interview.type}</div>
                                    </div>
                                    <div className={cn("text-lg font-bold", getScoreColor(interview.score))}>
                                        {interview.score}
                                    </div>
                                </div>
                            ))}
                            {(stats?.recent?.length || 0) === 0 && (
                                <p className="text-slate-500 text-center py-4">No interviews yet</p>
                            )}
                        </div>
                        <Link href="/history" className="flex items-center justify-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Top Performers
                        </h3>
                        <div className="space-y-3">
                            {stats?.top_performers?.map((performer, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-300"
                                    )}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">{performer.name}</div>
                                        <div className="text-sm text-slate-500">{performer.type}</div>
                                    </div>
                                    <div className="text-lg font-bold text-emerald-600">{performer.score}</div>
                                </div>
                            ))}
                            {(stats?.top_performers?.length || 0) === 0 && (
                                <p className="text-slate-500 text-center py-4">No data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Parameter Averages */}
                {Object.keys(stats?.parameter_averages || {}).length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Average Scores by Parameter
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {Object.entries(stats?.parameter_averages || {}).map(([param, score]) => (
                                <div key={param} className="text-center">
                                    <div className={cn("text-3xl font-bold mb-2", getScoreColor(score))}>{score}</div>
                                    <div className="text-sm text-slate-600 capitalize">{param.replace(/_/g, " ")}</div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                                        <div
                                            className={cn("h-2 rounded-full",
                                                score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
