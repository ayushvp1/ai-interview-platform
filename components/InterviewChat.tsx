"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, StopCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CandidateGatekeeper from "./CandidateGatekeeper";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

const MAX_QUESTIONS = 5;

interface InterviewChatProps {
    interviewType: "Technical" | "HR" | "Managerial";
}

export function InterviewChat({ interviewType }: InterviewChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: interviewType === "Technical"
                ? "Hello! I am your AI Interviewer. I'm here to conduct a technical interview with you regarding your experience with React and Next.js. Shall we begin?"
                : interviewType === "HR"
                    ? "Hello! I am your AI Interviewer. I'm here to conduct an HR interview to understand your background, motivations, and cultural fit. Shall we begin?"
                    : "Hello! I am your AI Interviewer. I'm here to conduct a managerial interview to assess your leadership skills, decision-making abilities, and team management experience. Shall we begin?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [userName, setUserName] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("interview_user_info");
            if (stored) return JSON.parse(stored).name || "";
        }
        return "";
    });
    const [userEmail, setUserEmail] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("interview_user_info");
            if (stored) return JSON.parse(stored).email || "";
        }
        return "";
    });
    const [userPhone, setUserPhone] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("interview_user_info");
            if (stored) return JSON.parse(stored).phone || "";
        }
        return "";
    });
    const [showUserForm, setShowUserForm] = useState(() => {
        if (typeof window !== "undefined") {
            return !localStorage.getItem("interview_user_info");
        }
        return true;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInterviewEnding, setIsInterviewEnding] = useState(false);
    const [showEndPrompt, setShowEndPrompt] = useState(false);
    const [awaitingUserQuestion, setAwaitingUserQuestion] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const storedInfo = localStorage.getItem("interview_user_info");
        if (storedInfo) {
            const data = JSON.parse(storedInfo);
            setUserName(data.name || "");
            setUserEmail(data.email || "");
            setUserPhone(data.phone || "");
            setShowUserForm(false);
        }
    }, []);

    const handleStartInterview = async () => {
        if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) return;

        const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5000";
        try {
            const response = await fetch(`${baseUrl}/candidates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    phone: userPhone,
                    interviewType: interviewType
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Store user info locally
                localStorage.setItem("interview_user_info", JSON.stringify({
                    name: userName,
                    email: userEmail,
                    phone: userPhone,
                    interview_type: interviewType,
                    started_at: new Date().toISOString()
                }));
                setShowUserForm(false);
            }
        } catch (error) {
            console.error("Failed to save candidate:", error);
            // Allow interview even if saving fails (UX priority)
            setShowUserForm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Countdown timer for auto-close
    useEffect(() => {
        if (showEndPrompt && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            window.location.href = "/feedback";
        }
    }, [showEndPrompt, countdown]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // If interview is ending and user replies, show end prompt
        if (isInterviewEnding) {
            const lowerText = input.toLowerCase().trim();
            const noPatterns = /^(no|nope|nothing|that\'s all|that\'s it|i\'m good|im good|not really|no thanks|no thank you|none|i don\'t|i dont)$/i;
            const yesPatterns = /^(yes|yeah|sure|yep|i do|i have|actually)/i;
            const isNo = noPatterns.test(lowerText) || lowerText === "no";
            const isYes = yesPatterns.test(lowerText);
            const isQuestion = input.includes("?") || lowerText.startsWith("what") || lowerText.startsWith("how") || lowerText.startsWith("can you") || lowerText.startsWith("could you") || lowerText.startsWith("why");

            // If user says "no" - end immediately
            if (isNo && !awaitingUserQuestion) {
                const userReply: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content: input,
                    timestamp: new Date(),
                };
                setMessages((prev) => {
                    const newHistory = [...prev, userReply];
                    localStorage.setItem("chat_history", JSON.stringify(newHistory));
                    return newHistory;
                });
                setInput("");

                setTimeout(() => {
                    const closingMsg: Message = {
                        id: Date.now().toString() + "_close",
                        role: "ai",
                        content: "Thank you for your response! It was wonderful speaking with you. Your interview evaluation is ready. Click 'See Results' to view your detailed feedback.",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => {
                        const newHistory = [...prev, closingMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        return newHistory;
                    });
                    setShowEndPrompt(true);
                }, 1000);
                return;
            }

            // Treat everything else as a question or final comment
            setAwaitingUserQuestion(true);
            const userReply: Message = {
                id: Date.now().toString(),
                role: "user",
                content: input,
                timestamp: new Date(),
            };
            setMessages((prev) => {
                const newHistory = [...prev, userReply];
                localStorage.setItem("chat_history", JSON.stringify(newHistory));
                return newHistory;
            });
            setInput("");

            setIsTyping(true);
            try {
                const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
                conversationHistory.push({ role: "user", content: input });

                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: conversationHistory,
                        type: interviewType
                    }),
                });

                const data = await response.json();

                setTimeout(() => {
                    const aiMsg: Message = {
                        id: Date.now().toString() + "_answer",
                        role: "ai",
                        content: data.content + "\n\nThank you again for your time! Your evaluation is now ready.",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => {
                        const newHistory = [...prev, aiMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        return newHistory;
                    });
                    setShowEndPrompt(true);
                    setIsTyping(false);
                }, 1000);
            } catch (err) {
                setIsTyping(false);
            }
            return;
        }


        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => {
            const newHistory = [...prev, userMsg];
            localStorage.setItem("chat_history", JSON.stringify(newHistory));
            return newHistory;
        });
        setInput("");
        setIsTyping(true);

        const newQuestionCount = questionCount + 1;
        setQuestionCount(newQuestionCount);

        try {
            const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
            
            // If this is the final answer, instruct AI to wrap up
            let userContent = userMsg.content;
            if (newQuestionCount >= MAX_QUESTIONS) {
                userContent += "\n\n(System Note: This is my final answer. Please acknowledge it and end the interview gracefully. Do not ask any more questions.)";
            }
            conversationHistory.push({ role: userMsg.role, content: userContent });

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: conversationHistory,
                    type: interviewType
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch response");
            }

            const data = await response.json();

            const aiMsg: Message = {
                id: Date.now().toString() + "_ai",
                role: "ai",
                content: data.content,
                timestamp: new Date(),
            };

            setMessages((prev) => {
                const newHistory = [...prev, aiMsg];
                localStorage.setItem("chat_history", JSON.stringify(newHistory));
                return newHistory;
            });

            // Set ending state immediately after AI responds to final answer
            if (newQuestionCount >= MAX_QUESTIONS) {
                setIsInterviewEnding(true);
                setShowEndPrompt(true);
            }


        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: Date.now().toString() + "_err",
                role: "ai",
                content: `Sorry, I encountered an error: ${error.message || "Please try again."}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    if (showUserForm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <CandidateGatekeeper
                    interviewType={interviewType}
                    onBack={() => router.push("/")}
                    onComplete={(data) => {
                        setUserName(data.name || "");
                        setUserEmail(data.email || "");
                        setUserPhone(data.phone || "");
                        setShowUserForm(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto border rounded-xl overflow-hidden shadow-sm bg-white mt-4">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg">{interviewType} Interview</h2>
                    <p className="text-sm text-slate-500">
                        {userName} • {showEndPrompt ? `Session ends in ${countdown}s` : `Question ${Math.min(questionCount, MAX_QUESTIONS)}/${MAX_QUESTIONS}`}
                    </p>
                </div>
                <Link
                    href="/feedback"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                    <StopCircle size={16} />
                    {showEndPrompt ? "See Results" : "End Interview"}
                </Link>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full items-start gap-3",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                            msg.role === "user" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                        )}>
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={cn(
                            "px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm",
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm ml-12">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce delay-75">•</span>
                        <span className="animate-bounce delay-150">•</span>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 items-center"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
