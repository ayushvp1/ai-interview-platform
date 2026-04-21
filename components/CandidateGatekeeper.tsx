"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, ArrowRight, Loader2, ClipboardCheck, X, Lock, Key, CheckCircle2, AlertCircle } from "lucide-react";

interface CandidateFormProps {
    interviewType: string;
    onComplete: (data: any) => void;
    onBack?: () => void;
    initialMode?: AuthMode;
}

type AuthMode = 'signup' | 'login' | 'forgot' | 'verify' | 'reset';

export default function CandidateGatekeeper({ interviewType, onComplete, onBack, initialMode = 'signup' }: CandidateFormProps) {
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", otp: "" });
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Check if already logged in
        const token = localStorage.getItem("candidate_token");
        const savedInfo = localStorage.getItem("interview_user_info");
        if (token && savedInfo) {
            onComplete(JSON.parse(savedInfo));
        } else {
            setIsVisible(true);
        }
    }, [onComplete]);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:8000";
        let endpoint = "/candidates/register";
        let payload: any = { ...formData, interviewType };

        if (authMode === 'login') {
            endpoint = "/candidates/login";
            payload = { email: formData.email, password: formData.password };
        } else if (authMode === 'forgot') {
            endpoint = "/candidates/forgot-password";
            payload = { email: formData.email };
        } else if (authMode === 'verify') {
            endpoint = "/candidates/verify-otp";
            payload = { email: formData.email, otp: formData.otp };
        } else if (authMode === 'reset') {
            endpoint = "/candidates/reset-password";
            payload = { email: formData.email, otp: formData.otp, password: formData.password };
        }

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            
            if (result.success) {
                if (authMode === 'signup' || authMode === 'login') {
                    localStorage.setItem("candidate_token", result.data.token);
                    localStorage.setItem("interview_user_info", JSON.stringify(result.data.candidate));
                    setMessage({ type: 'success', text: "Welcome back! Redirecting..." });
                    setTimeout(() => onComplete(result.data.candidate), 1500);
                } else if (authMode === 'forgot') {
                    setMessage({ type: 'success', text: "OTP sent to your email." });
                    setAuthMode('verify');
                } else if (authMode === 'verify') {
                    setMessage({ type: 'success', text: "OTP verified! Please set your new password." });
                    setAuthMode('reset');
                } else if (authMode === 'reset') {
                    setMessage({ type: 'success', text: "Password changed successfully! Please sign in." });
                    setAuthMode('login');
                }
            } else {
                setMessage({ type: 'error', text: result.message || "Action failed." });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-500 relative flex flex-col">
                {onBack && (
                    <button onClick={onBack} className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            {authMode === 'signup' ? <User className="w-7 h-7 text-white" /> : <Lock className="w-7 h-7 text-white" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white capitalize">
                                {authMode === 'signup' ? 'Create Account' : authMode === 'login' ? 'Welcome Back' : 'Password Recovery'}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {authMode === 'signup' ? `Register for ${interviewType} Interview` : 'Access your candidate portal'}
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleAction} className="space-y-5">
                        {authMode === 'signup' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {(authMode === 'signup' || authMode === 'login' || authMode === 'forgot' || authMode === 'verify' || authMode === 'reset') && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        disabled={authMode === 'verify' || authMode === 'reset'}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all ${authMode === 'verify' || authMode === 'reset' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>
                        )}

                        {authMode === 'signup' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {(authMode === 'signup' || authMode === 'login' || authMode === 'reset') && (
                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">
                                        {authMode === 'reset' ? 'New Password' : 'Password'}
                                    </label>
                                    {authMode === 'login' && (
                                        <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-blue-500 hover:text-blue-400">forgot password?</button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {(authMode === 'verify' || authMode === 'reset') && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Verification OTP</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        required
                                        maxLength={6}
                                        value={formData.otp}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setFormData({ ...formData, otp: val });
                                        }}
                                        placeholder="123456"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white tracking-[0.5em] font-bold text-center focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-8"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                             authMode === 'signup' ? "Create Account" : 
                             authMode === 'login' ? "Sign In" : 
                             authMode === 'forgot' ? "Send OTP" :
                             authMode === 'verify' ? "Verify OTP" : "Reset Password"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>

                        <div className="pt-6 text-center">
                            {authMode === 'signup' ? (
                                <p className="text-sm text-slate-500">
                                    Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-500 font-bold hover:underline">Sign In</button>
                                </p>
                            ) : authMode === 'login' ? (
                                <p className="text-sm text-slate-500">
                                    Don't have an account? <button type="button" onClick={() => setAuthMode('signup')} className="text-blue-500 font-bold hover:underline">Register</button>
                                </p>
                            ) : (
                                <button type="button" onClick={() => setAuthMode('login')} className="text-sm text-slate-500 hover:text-white transition-colors">Back to Login</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


