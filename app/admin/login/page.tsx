"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { adminFetch, setAdminToken } from "@/lib/admin-api";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await adminFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            if (result.success && result.data.token) {
                setAdminToken(result.data.token);
                router.push("/admin");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to reach the Admin server. Ensure it is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
            <div className="max-w-md w-full">
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-6 rotate-3 transform hover:rotate-0 transition-transform duration-300">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 mt-2">Sign in to manage interview configurations</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter admin username"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 text-slate-500 text-sm">
                    Protected Admin Zone • © 2026 AI Interview Platform
                </div>
            </div>
        </div>
    );
}
