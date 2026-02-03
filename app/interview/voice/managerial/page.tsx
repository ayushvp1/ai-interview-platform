import { VoiceInterviewChat } from "@/components/VoiceInterviewChat";

export default function VoiceManagerialPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Managerial Interview</h1>
                    <p className="text-slate-600">Voice-enabled • Speak your answers naturally</p>
                </div>

                <VoiceInterviewChat interviewType="Managerial" />
            </div>
        </main>
    );
}
