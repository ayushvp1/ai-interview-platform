"use client";

import dynamic from "next/dynamic";

const VideoInterviewChat = dynamic(
    () => import("@/components/VideoInterviewChat").then(mod => mod.VideoInterviewChat),
    { ssr: false }
);

export default function VideoTechnicalPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Technical Interview</h1>
                    <p className="text-slate-600">Video-enabled • Body language analysis active</p>
                </div>

                <VideoInterviewChat interviewType="Technical" />
            </div>
        </main>
    );
}
