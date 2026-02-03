"use client";

import dynamic from "next/dynamic";

const InterviewChat = dynamic(
    () => import("@/components/InterviewChat").then(mod => mod.InterviewChat),
    { ssr: false }
);

export default function ManagerialInterviewPage() {
    return (
        <main className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Managerial Interview</h1>
                    <p className="text-slate-600">Demonstrate your leadership and decision-making abilities</p>
                </div>

                <InterviewChat interviewType="Managerial" />
            </div>
        </main>
    );
}
