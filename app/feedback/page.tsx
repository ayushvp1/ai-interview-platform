"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus, BookOpen, Lightbulb, Target, BarChart3, Video, Eye, Smile } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ParameterScore {
    score: number;
    feedback: string;
}

interface PersonalizedSuggestion {
    area: string;
    suggestion: string;
    resources?: string;
}

interface Progress {
    total_attempts: number;
    previous_scores: { date: string; score: number }[];
    improvement_from_last: number;
    trend: "improving" | "declining" | "stable";
}

interface Evaluation {
    overall_score: number;
    parameter_scores: {
        confidence: ParameterScore;
        communication_clarity: ParameterScore;
        technical_accuracy: ParameterScore;
        problem_solving: ParameterScore;
        body_language?: ParameterScore;
    };
    general_feedback: string;
    strengths: string[];
    areas_for_improvement: string[];
    personalized_suggestions: PersonalizedSuggestion[];
    progress?: Progress;
}

interface VideoMetrics {
    eyeContactPercent: number;
    confidenceScore: number;
    engagementScore: number;
    dominantExpression: string;
}

export default function FeedbackPage() {
    const [loading, setLoading] = useState(true);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [videoMetrics, setVideoMetrics] = useState<VideoMetrics | null>(null);
    const [interviewMode, setInterviewMode] = useState<string>("");

    useEffect(() => {
        const fetchEvaluation = async () => {
            const storedHistory = localStorage.getItem("chat_history");
            const storedUserInfo = localStorage.getItem("interview_user_info");
            const storedVideoMetrics = localStorage.getItem("video_metrics");

            console.log("Feedback Page - Loading data:", {
                hasHistory: !!storedHistory,
                hasUserInfo: !!storedUserInfo,
                hasVideoMetrics: !!storedVideoMetrics
            });

            if (!storedHistory) {
                console.log("No chat history found in localStorage");
                setLoading(false);
                return;
            }

            try {
                const history = JSON.parse(storedHistory);
                console.log("Chat history parsed, messages:", history.length);

                const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
                setUserName(userInfo?.name || "");
                setInterviewMode(userInfo?.mode || "");

                // Load video metrics if available
                if (storedVideoMetrics) {
                    try {
                        const metrics = JSON.parse(storedVideoMetrics);
                        console.log("Video metrics loaded:", metrics);
                        setVideoMetrics(metrics);
                    } catch (e) {
                        console.log("No valid video metrics");
                    }
                }

                console.log("Calling evaluate API...");
                const response = await fetch("/api/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_history: history,
                        user_info: userInfo
                    }),
                });

                console.log("Evaluate API response status:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("Evaluation data received:", data);
                    setEvaluation(data);
                } else {
                    const errorText = await response.text();
                    console.error("Evaluate API error:", response.status, errorText);
                    setError(`Failed to generate evaluation: ${response.status}. Please try again.`);
                }
            } catch (err: any) {
                console.error("Feedback page error:", err);
                setError(err.message || "An unexpected error occurred while loading your feedback.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500">Generating Performance Report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-slate-800">Evaluation Error</h2>
                <p className="text-slate-600 max-w-md">{error}</p>
                <div className="flex gap-4 mt-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <Link href="/" className="px-6 py-2 border rounded-lg font-semibold hover:bg-slate-50">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-slate-600">No interview data found to evaluate.</p>
                <Link href="/" className="text-blue-600 hover:underline">Start New Interview</Link>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-100";
        if (score >= 60) return "bg-amber-100";
        return "bg-red-100";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header with Overall Score */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {userName ? `${userName}'s Performance Report` : "Interview Evaluation"}
                            </h1>
                            <p className="text-slate-500 mt-1">AI-generated comprehensive analysis</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Score</div>
                                <div className={cn("text-5xl font-bold", getScoreColor(evaluation.overall_score))}>
                                    {evaluation.overall_score}/100
                                </div>
                            </div>

                            {evaluation.progress && (
                                <div className={cn("px-4 py-2 rounded-lg flex items-center gap-2",
                                    evaluation.progress.trend === "improving" ? "bg-emerald-100 text-emerald-700" :
                                        evaluation.progress.trend === "declining" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                )}>
                                    {evaluation.progress.trend === "improving" ? <TrendingUp size={20} /> :
                                        evaluation.progress.trend === "declining" ? <TrendingDown size={20} /> : <Minus size={20} />}
                                    <span className="font-semibold">
                                        {evaluation.progress.improvement_from_last > 0 ? "+" : ""}
                                        {evaluation.progress.improvement_from_last} pts
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Tracking */}
                    {evaluation.progress && evaluation.progress.total_attempts > 1 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="text-blue-600" size={20} />
                                <h3 className="font-semibold text-slate-900">Progress Tracking</h3>
                                <span className="text-sm text-slate-500">({evaluation.progress.total_attempts} attempts)</span>
                            </div>
                            <div className="flex items-end gap-2 h-24">
                                {evaluation.progress.previous_scores.map((attempt, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div
                                            className={cn("w-12 rounded-t", getScoreBg(attempt.score))}
                                            style={{ height: `${attempt.score}%` }}
                                        />
                                        <span className="text-xs text-slate-500">{new Date(attempt.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={cn("w-12 rounded-t border-2 border-blue-500", getScoreBg(evaluation.overall_score))}
                                        style={{ height: `${evaluation.overall_score}%` }}
                                    />
                                    <span className="text-xs font-semibold text-blue-600">Today</span>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to clear all your previous analysis history? This cannot be undone.")) {
                                        try {
                                            const res = await fetch("/api/clear-logs", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ userName })
                                            });
                                            if (res.ok) {
                                                alert("History cleared successfully!");
                                                window.location.reload();
                                            }
                                        } catch (e) {
                                            alert("Failed to clear history.");
                                        }
                                    }
                                }}
                                className="mt-4 text-xs text-red-500 hover:text-red-700 font-medium underline px-2 py-1"
                            >
                                Clear All History
                            </button>
                        </div>
                    )}
                </div>

                {/* Parameter-wise Scores */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="text-blue-600" size={20} />
                        <h3 className="font-semibold text-slate-900 text-lg">Evaluation Parameters</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {Object.entries(evaluation.parameter_scores).map(([key, param]) => (
                            <div key={key} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-slate-900 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </h4>
                                    <span className={cn("text-2xl font-bold", getScoreColor(param.score))}>
                                        {param.score}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                                    <div
                                        className={cn("h-2 rounded-full transition-all",
                                            param.score >= 80 ? "bg-emerald-500" :
                                                param.score >= 60 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${param.score}%` }}
                                    />
                                </div>
                                <p className="text-sm text-slate-600">{param.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Analysis Metrics */}
                {(videoMetrics || interviewMode === "video") && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Video className="text-purple-600" size={20} />
                            <h3 className="font-semibold text-slate-900 text-lg">Video Analysis</h3>
                            <span className="text-sm text-slate-500 ml-auto">Body Language & Presence</span>
                        </div>

                        {videoMetrics ? (
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                    <Eye className="mx-auto text-blue-600 mb-2" size={24} />
                                    <div className={cn("text-3xl font-bold mb-1",
                                        videoMetrics.eyeContactPercent >= 70 ? "text-emerald-600" :
                                            videoMetrics.eyeContactPercent >= 50 ? "text-amber-500" : "text-red-500"
                                    )}>
                                        {Math.round(videoMetrics.eyeContactPercent)}%
                                    </div>
                                    <div className="text-sm text-slate-600">Eye Contact</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                    <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                                    <div className={cn("text-3xl font-bold mb-1",
                                        videoMetrics.confidenceScore >= 70 ? "text-emerald-600" :
                                            videoMetrics.confidenceScore >= 50 ? "text-amber-500" : "text-red-500"
                                    )}>
                                        {Math.round(videoMetrics.confidenceScore)}%
                                    </div>
                                    <div className="text-sm text-slate-600">Confidence</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                    <Target className="mx-auto text-purple-600 mb-2" size={24} />
                                    <div className={cn("text-3xl font-bold mb-1",
                                        videoMetrics.engagementScore >= 70 ? "text-emerald-600" :
                                            videoMetrics.engagementScore >= 50 ? "text-amber-500" : "text-red-500"
                                    )}>
                                        {Math.round(videoMetrics.engagementScore)}%
                                    </div>
                                    <div className="text-sm text-slate-600">Engagement</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                                    <Smile className="mx-auto text-amber-600 mb-2" size={24} />
                                    <div className="text-2xl font-bold mb-1 text-slate-800 capitalize">
                                        {videoMetrics.dominantExpression || "neutral"}
                                    </div>
                                    <div className="text-sm text-slate-600">Expression</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Video className="mx-auto mb-3 opacity-50" size={32} />
                                <p>Video metrics were not captured for this interview.</p>
                                <p className="text-sm">Ensure camera is enabled during the interview for body language analysis.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Strengths and Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="text-emerald-500" size={20} />
                            <h3 className="font-semibold text-slate-900">Key Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                            {evaluation.strengths.map((str, i) => (
                                <li key={i} className="text-slate-600 text-sm flex gap-3 items-start">
                                    <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                                    {str}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="text-red-500" size={20} />
                            <h3 className="font-semibold text-slate-900">Areas for Improvement</h3>
                        </div>
                        <ul className="space-y-3">
                            {evaluation.areas_for_improvement.map((area, i) => (
                                <li key={i} className="text-slate-600 text-sm flex gap-3 items-start">
                                    <span className="block h-1.5 w-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Personalized Suggestions */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Lightbulb className="text-amber-500" size={20} />
                        <h3 className="font-semibold text-slate-900 text-lg">Personalized Improvement Plan</h3>
                    </div>
                    <div className="space-y-4">
                        {evaluation.personalized_suggestions?.map((suggestion, i) => (
                            <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <h4 className="font-semibold text-slate-900 mb-2">{suggestion.area}</h4>
                                <p className="text-slate-600 text-sm mb-2">{suggestion.suggestion}</p>
                                {suggestion.resources && (
                                    <p className="text-xs text-amber-700 bg-amber-100 inline-block px-2 py-1 rounded">
                                        💡 {suggestion.resources}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* General Feedback */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-blue-500" size={20} />
                        <h3 className="font-semibold text-slate-900">Overall Feedback</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        {evaluation.general_feedback}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-8">
                    <Link
                        href="/history"
                        className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                        View All Reports
                    </Link>
                    <Link
                        href="/"
                        onClick={() => {
                            localStorage.removeItem("chat_history");
                            localStorage.removeItem("interview_user_info");
                        }}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Start New Interview
                    </Link>
                </div>

            </div>
        </div>
    );
}
