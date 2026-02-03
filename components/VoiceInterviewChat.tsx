"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, StopCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

const MAX_QUESTIONS = 5;

interface VoiceInterviewChatProps {
    interviewType: "Technical" | "HR" | "Managerial";
}

export function VoiceInterviewChat({ interviewType }: VoiceInterviewChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: interviewType === "Technical"
                ? "Hello! I am your AI Interviewer. I'm here to conduct a technical interview with you. Click the microphone to speak your answers. Shall we begin?"
                : interviewType === "HR"
                    ? "Hello! I am your AI Interviewer. I'm here to conduct an HR interview. Click the microphone to speak your answers. Shall we begin?"
                    : "Hello! I am your AI Interviewer. I'm here to conduct a managerial interview. Click the microphone to speak your answers. Shall we begin?",
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

    // Voice states
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [transcript, setTranscript] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "en-US";
                recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives for better accuracy

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = "";
                    let interimTranscript = "";

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        let bestTranscript = result[0].transcript;

                        // Get the best alternative (highest confidence)
                        if (result.length > 1) {
                            let bestConfidence = result[0].confidence;
                            for (let j = 1; j < result.length; j++) {
                                if (result[j].confidence > bestConfidence) {
                                    bestConfidence = result[j].confidence;
                                    bestTranscript = result[j].transcript;
                                }
                            }
                        }

                        if (result.isFinal) {
                            finalTranscript += bestTranscript;
                        } else {
                            interimTranscript += bestTranscript;
                        }
                    }

                    setTranscript(interimTranscript);
                    if (finalTranscript) {
                        const cleanedTranscript = finalTranscript.trim();
                        setInput(prev => (prev.trim() + " " + cleanedTranscript).trim());
                        setTranscript("");
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    // Ignore common non-critical errors
                    if (event.error === "no-speech" || event.error === "aborted") {
                        return;
                    }
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }

            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Store user info and clear old data
    useEffect(() => {
        if (!showUserForm && userName) {
            localStorage.removeItem("chat_history");
            localStorage.setItem("interview_user_info", JSON.stringify({
                name: userName,
                email: userEmail,
                interview_type: interviewType,
                started_at: new Date().toISOString()
            }));
        }
    }, [showUserForm, userName, userEmail, interviewType]);

    // Countdown timer for auto-close
    useEffect(() => {
        if (showEndPrompt && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            window.location.href = "/feedback";
        }
    }, [showEndPrompt, countdown]);

    // Speak AI messages
    const speakText = useCallback((text: string) => {
        if (!ttsEnabled || !synthRef.current) return;

        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    }, [ttsEnabled]);

    // Speak initial message
    useEffect(() => {
        if (!showUserForm && messages.length === 1) {
            // Save initial message to localStorage
            localStorage.setItem("chat_history", JSON.stringify(messages));
            speakText(messages[0].content);
        }
    }, [showUserForm, messages, speakText]);

    const inputRef = useRef("");

    // Keep inputRef in sync with input state
    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            // Auto-send after a short delay to allow final transcript to be captured
            setTimeout(() => {
                if (inputRef.current.trim()) {
                    handleSendRef.current();
                }
            }, 800);
        } else {
            setInput("");
            setTranscript("");
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Also add a text input for typing if voice doesn't work
    const [textMode, setTextMode] = useState(false);

    const handleSendRef = useRef<() => void>(() => { });

    const handleSend = async () => {
        const textToSend = input.trim();
        if (!textToSend) return;

        // Stop listening if active
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        // If interview is ending and user replies, show end prompt
        if (isInterviewEnding) {
            const lowerText = textToSend.toLowerCase().trim();
            const noPatterns = /^(no|nope|nothing|that\'s all|that\'s it|i\'m good|im good|not really|no thanks|no thank you|none|i don\'t|i dont)$/i;
            const yesPatterns = /^(yes|yeah|sure|yep|i do|i have|actually)/i;
            const isNo = noPatterns.test(lowerText) || lowerText === "no";
            const isYes = yesPatterns.test(lowerText);
            const isQuestion = textToSend.includes("?") || lowerText.startsWith("what") || lowerText.startsWith("how") || lowerText.startsWith("can you") || lowerText.startsWith("could you") || lowerText.startsWith("why");

            // If user says "no" - end immediately
            if (isNo && !awaitingUserQuestion) {
                const userReply: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content: textToSend,
                    timestamp: new Date(),
                };
                setMessages((prev) => {
                    const newHistory = [...prev, userReply];
                    localStorage.setItem("chat_history", JSON.stringify(newHistory));
                    return newHistory;
                });
                setInput("");
                setTranscript("");

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
                    speakText(closingMsg.content);
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
                    content: textToSend,
                    timestamp: new Date(),
                };
                setMessages((prev) => {
                    const newHistory = [...prev, userReply];
                    localStorage.setItem("chat_history", JSON.stringify(newHistory));
                    return newHistory;
                });
                setInput("");
                setTranscript("");

                if (isYes && !isQuestion && textToSend.length < 20) {
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
                        speakText(aiReply.content);
                    }, 1000);
                    return;
                }

                // If it's an actual question, answer it and then end
                setIsTyping(true);
                try {
                    const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
                    conversationHistory.push({ role: "user", content: textToSend });

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
                        speakText(aiMsg.content);
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
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => {
            const newHistory = [...prev, userMsg];
            localStorage.setItem("chat_history", JSON.stringify(newHistory));
            return newHistory;
        });
        setInput("");
        setTranscript("");
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

            // Speak AI response
            speakText(data.content);

            // After final question, add thank you message with delay
            if (newQuestionCount >= MAX_QUESTIONS + 1) {
                setTimeout(() => {
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
                    speakText(thankYouMsg.content);
                    setIsInterviewEnding(true);
                }, 2000);
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

    // Keep handleSendRef in sync
    useEffect(() => {
        handleSendRef.current = handleSend;
    });

    if (showUserForm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 w-full">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Voice Interview</h2>
                    <p className="text-slate-600 mb-6">Speak your answers naturally</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            onClick={() => userName.trim() && setShowUserForm(false)}
                            disabled={!userName.trim()}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Mic size={20} />
                            Start Voice Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto border rounded-xl overflow-hidden shadow-sm bg-white mt-4">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Mic className="w-5 h-5 text-purple-600" />
                        {interviewType} Interview (Voice)
                    </h2>
                    <p className="text-sm text-slate-500">
                        {userName} • {showEndPrompt ? `Session ends in ${countdown}s` : `Question ${Math.min(questionCount, MAX_QUESTIONS)}/${MAX_QUESTIONS}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={cn("p-2 rounded-lg transition-colors",
                            ttsEnabled ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"
                        )}
                        title={ttsEnabled ? "Mute AI voice" : "Unmute AI voice"}
                    >
                        {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <Link
                        href="/feedback"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                        <StopCircle size={16} />
                        {showEndPrompt ? "See Results" : "End"}
                    </Link>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn("flex w-full items-start gap-3",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                            msg.role === "user" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                        )}>
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={cn("px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm",
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

                {isSpeaking && (
                    <div className="flex items-center gap-2 text-purple-500 text-sm ml-12">
                        <Volume2 size={16} className="animate-pulse" />
                        <span>Speaking...</span>
                    </div>
                )}
            </div>

            {/* Voice Input */}
            <div className="p-4 bg-white border-t">
                {/* Transcript preview */}
                {(transcript || input) && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                        {input}{transcript && <span className="text-slate-400">{transcript}</span>}
                    </div>
                )}

                <div className="flex gap-3 items-center justify-center">
                    {/* Main mic button */}
                    <button
                        onClick={toggleListening}
                        disabled={isTyping || isSpeaking}
                        className={cn(
                            "p-6 rounded-full transition-all shadow-lg",
                            isListening
                                ? "bg-red-500 text-white animate-pulse scale-110"
                                : "bg-purple-600 text-white hover:bg-purple-700",
                            (isTyping || isSpeaking) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                        <Send size={24} />
                    </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-3">
                    {isListening ? "Listening... Click to stop" : "Click microphone to speak"}
                </p>
            </div>
        </div>
    );
}
