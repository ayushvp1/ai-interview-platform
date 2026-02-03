import { VideoInterviewChat } from "@/components/VideoInterviewChat";

export default function VideoManagerialPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Managerial Interview</h1>
                    <p className="text-slate-600">Video-enabled • Body language analysis active</p>
                </div>

                <VideoInterviewChat interviewType="Managerial" />
            </div>
        </main>
    );
}
