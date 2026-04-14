"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, ArrowRight, Loader2, ClipboardCheck } from "lucide-react";

interface CandidateFormProps {
    interviewType: string;
    onComplete: (data: any) => void;
}

export default function CandidateGatekeeper({ interviewType, onComplete }: CandidateFormProps) {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already filled in this session
        const saved = localStorage.getItem("interview_user_info");
        if (saved) {
            onComplete(JSON.parse(saved));
        } else {
            setIsVisible(true);
        }
    }, [onComplete]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5000";
        try {
            const response = await fetch(`${baseUrl}/candidates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, interviewType }),
            });

            const result = await response.json();
            if (result.success) {
                localStorage.setItem("interview_user_info", JSON.stringify(result.data));
                onComplete(result.data);
            }
        } catch (error) {
            console.error("Error saving candidate:", error);
            // Fallback: let them interview anyway if backend is down, but log error
            onComplete(formData);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-blue-600 p-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Candidate Information</h2>
                    </div>
                    <p className="text-blue-100">
                        Please provide your details before starting the <span className="font-bold text-white capitalize">{interviewType} Interview</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Interview"}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        Your data is secure and will only be shared with the administrator.
                    </p>
                </form>
            </div>
        </div>
    );
}
