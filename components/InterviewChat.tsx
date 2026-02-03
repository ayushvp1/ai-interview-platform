"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [showUserForm, setShowUserForm] = useState(true);
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
        // Store user info in localStorage when interview starts
        if (!showUserForm && userName) {
            // Clear any previous interview data
            localStorage.removeItem("chat_history");

            // Store new user info
            localStorage.setItem("interview_user_info", JSON.stringify({
                name: userName,
                email: userEmail,
                interview_type: interviewType,
                started_at: new Date().toISOString()
            }));

            // Save initial message to localStorage
            localStorage.setItem("chat_history", JSON.stringify(messages));
        }
    }, [showUserForm, userName, userEmail, interviewType, messages]);

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

            // If user says "yes" or asks a question
            if (isYes || isQuestion || awaitingUserQuestion) {
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

                if (isYes && !isQuestion && input.length < 20) {
                    setTimeout(() => {
                        const aiReply: Message = {
                            id: Date.now().toString() + "_prompt",
                            role: "ai",
                            content: "I'd be happy to answer! What would you like to know about the role, the company, or the interview process?",
                            timestamp: new Date(),
                        };
                        setMessages((prev) => {
                            const newHistory = [...prev, aiReply];
                            localStorage.setItem("chat_history", JSON.stringify(newHistory));
                            return newHistory;
                        });
                    }, 1000);
                    return;
                }

                // If it's an actual question, answer it and then end
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
            conversationHistory.push({ role: userMsg.role, content: userMsg.content });

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

            // After final question, add thank you message with delay
            if (newQuestionCount >= MAX_QUESTIONS + 1) {
                setTimeout(async () => {
                    // Add thank you message
                    const thankYouMsg: Message = {
                        id: Date.now().toString() + "_thanks",
                        role: "ai",
                        content: "Thank you so much for participating in this interview! You've done a great job. Do you have any questions for me before we wrap up?",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => {
                        const newHistory = [...prev, thankYouMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        return newHistory;
                    });
                    setIsInterviewEnding(true);
                }, 1500);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 w-full">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Before We Begin</h2>
                    <p className="text-slate-600 mb-6">Please provide your details for the interview log</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (userName.trim()) {
                                    setShowUserForm(false);
                                }
                            }}
                            disabled={!userName.trim()}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Start {interviewType} Interview
                        </button>
                    </div>
                </div>
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
