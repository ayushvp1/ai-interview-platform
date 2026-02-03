"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, StopCircle, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { loadFaceModels, analyzeFrame, aggregateMetrics, FaceAnalysisResult } from "@/lib/faceAnalysis";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

interface VideoMetrics {
    eyeContactPercent: number;
    confidenceScore: number;
    engagementScore: number;
    dominantExpression: string;
}

const MAX_QUESTIONS = 5;

interface VideoInterviewChatProps {
    interviewType: "Technical" | "HR" | "Managerial";
}

export function VideoInterviewChat({ interviewType }: VideoInterviewChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: interviewType === "Technical"
                ? "Hello! I am your AI Interviewer. This is a video-enabled interview. I can see your facial expressions and body language. Please ensure your camera is on. Shall we begin?"
                : interviewType === "HR"
                    ? "Hello! I am your AI Interviewer. This is a video-enabled HR interview. Please keep your camera on for the full experience. Shall we begin?"
                    : "Hello! I am your AI Interviewer. This is a video-enabled managerial interview. Your body language will be analyzed. Shall we begin?",
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
    const [awaitingUserQuestion, setAwaitingUserQuestion] = useState(false);
    const [showEndPrompt, setShowEndPrompt] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Voice states
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [transcript, setTranscript] = useState("");

    // Video states
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);
    const [videoMetrics, setVideoMetrics] = useState<VideoMetrics>({
        eyeContactPercent: 0,
        confidenceScore: 0,
        engagementScore: 0,
        dominantExpression: "neutral"
    });
    const [analysisResults, setAnalysisResults] = useState<FaceAnalysisResult[]>([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const cameraReadyRef = useRef(false);
    const modelsLoadedRef = useRef(false);

    // Initialize facial analysis models and webcam
    useEffect(() => {
        const init = async () => {
            const loaded = await loadFaceModels();
            setModelsLoaded(loaded);
            modelsLoadedRef.current = loaded;
            if (!showUserForm && videoEnabled) {
                startCamera();
            }
        };
        init();
        return () => {
            stopCamera();
        };
    }, [showUserForm, videoEnabled]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: "user" },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for metadata to be loaded to get correct dimensions
                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                    cameraReadyRef.current = true;
                    startAnalysis();
                    console.log("Camera ready and analysis started");
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            setCameraReady(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        setCameraReady(false);
        cameraReadyRef.current = false;
    };

    const startAnalysis = () => {
        if (analysisIntervalRef.current) return;
        // Analyze face every 2 seconds for faster feedback
        analysisIntervalRef.current = setInterval(() => {
            analyzeCurrentFrame();
        }, 2000);
    };

    const analyzeCurrentFrame = async () => {
        if (!videoRef.current || !cameraReadyRef.current || !modelsLoadedRef.current) {
            console.log("Skipping analysis - not ready");
            return;
        }

        try {
            const result = await analyzeFrame(videoRef.current);
            if (!result) return;

            setAnalysisResults(prev => {
                const next = [...prev, result];
                // Calculate live metrics from last 10 frames (sliding window) for reactivity
                const slidingWindow = next.slice(-10);
                const aggregated = aggregateMetrics(slidingWindow);
                setVideoMetrics({
                    eyeContactPercent: aggregated.eyeContactPercent,
                    confidenceScore: aggregated.averageConfidence,
                    engagementScore: aggregated.engagementScore,
                    dominantExpression: aggregated.dominantExpression
                });
                return next;
            });
        } catch (error) {
            console.error("Frame analysis error:", error);
        }
    };

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
                        // Get the best alternative (highest confidence)
                        const result = event.results[i];
                        let bestTranscript = result[0].transcript;

                        // Check alternatives for better match if available
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
                        // Clean up the transcript - remove extra spaces
                        const cleanedTranscript = finalTranscript.trim();
                        setInput(prev => (prev.trim() + " " + cleanedTranscript).trim());
                        setTranscript("");
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    if (event.error === "no-speech" || event.error === "aborted") return;
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => setIsListening(false);
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

    // Store user info
    useEffect(() => {
        if (!showUserForm && userName) {
            localStorage.removeItem("chat_history");
            localStorage.setItem("interview_user_info", JSON.stringify({
                name: userName,
                email: userEmail,
                interview_type: interviewType,
                mode: "video",
                started_at: new Date().toISOString()
            }));
        }
    }, [showUserForm, userName, userEmail, interviewType]);

    // Countdown timer
    useEffect(() => {
        if (showEndPrompt && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            window.location.href = "/feedback";
        }
    }, [showEndPrompt, countdown]);

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

    useEffect(() => {
        if (!showUserForm && messages.length === 1) {
            // Save initial message to localStorage
            localStorage.setItem("chat_history", JSON.stringify(messages));
            speakText(messages[0].content);
        }
    }, [showUserForm, messages, speakText]);

    const inputRef = useRef("");
    useEffect(() => { inputRef.current = input; }, [input]);

    const handleSendRef = useRef<() => void>(() => { });

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
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

    const handleSend = async () => {
        const textToSend = input.trim();
        if (!textToSend) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        // If interview is ending - handle user questions phase
        if (isInterviewEnding) {
            const userReply: Message = {
                id: Date.now().toString(),
                role: "user",
                content: textToSend,
                timestamp: new Date(),
            };
            setMessages(prev => {
                const newHistory = [...prev, userReply];
                localStorage.setItem("chat_history", JSON.stringify(newHistory));
                return newHistory;
            });
            setInput("");
            setTranscript("");

            const lowerText = textToSend.toLowerCase().trim();
            const noPatterns = /^(no|nope|nothing|that's all|that's it|i'm good|im good|not really|no thanks|no thank you|none|i don't|i dont)$/i;
            const yesPatterns = /^(yes|yeah|sure|yep|i do|i have|actually)/i;
            const isNo = noPatterns.test(lowerText) || lowerText === "no";
            const isYes = yesPatterns.test(lowerText);
            const isQuestion = textToSend.includes("?") || lowerText.startsWith("what") || lowerText.startsWith("how") || lowerText.startsWith("why") || lowerText.startsWith("can") || lowerText.startsWith("could") || lowerText.startsWith("would") || lowerText.startsWith("is") || lowerText.startsWith("are") || lowerText.startsWith("do");

            // If user says "no" - end immediately
            if (isNo && !awaitingUserQuestion) {
                setTimeout(() => {
                    const closingMsg: Message = {
                        id: Date.now().toString() + "_close",
                        role: "ai",
                        content: "Thank you for your time! It was great speaking with you. Your video interview evaluation with body language analysis is ready. Click 'See Results' to view your detailed feedback.",
                        timestamp: new Date(),
                    };
                    setMessages(prev => {
                        const newHistory = [...prev, closingMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        localStorage.setItem("video_metrics", JSON.stringify(videoMetrics));
                        localStorage.setItem("video_analysis", JSON.stringify(analysisResults));
                        return newHistory;
                    });
                    speakText(closingMsg.content);
                    setShowEndPrompt(true);
                    stopCamera();
                }, 1000);
                return;
            }

            // If user says "yes" or asks a question
            if (isYes || isQuestion || awaitingUserQuestion) {
                setAwaitingUserQuestion(true);

                // If they just said "yes", prompt them to ask
                if (isYes && !isQuestion && textToSend.length < 20) {
                    setTimeout(() => {
                        const promptMsg: Message = {
                            id: Date.now().toString() + "_prompt",
                            role: "ai",
                            content: "Of course! Please go ahead and ask your question.",
                            timestamp: new Date(),
                        };
                        setMessages(prev => {
                            const newHistory = [...prev, promptMsg];
                            localStorage.setItem("chat_history", JSON.stringify(newHistory));
                            return newHistory;
                        });
                        speakText(promptMsg.content);
                    }, 500);
                    return;
                }

                // They asked an actual question - answer it using AI
                setIsTyping(true);
                try {
                    const response = await fetch("/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            messages: [{ role: "user", content: `As an HR interviewer, briefly answer this candidate's question: "${textToSend}"` }],
                            type: interviewType
                        }),
                    });

                    const data = await response.json();
                    const answerMsg: Message = {
                        id: Date.now().toString() + "_answer",
                        role: "ai",
                        content: data.content,
                        timestamp: new Date(),
                    };
                    setMessages(prev => {
                        const newHistory = [...prev, answerMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        return newHistory;
                    });
                    speakText(data.content);

                    // After answering, end the interview
                    setTimeout(() => {
                        const closingMsg: Message = {
                            id: Date.now().toString() + "_close",
                            role: "ai",
                            content: "That's a great question! I hope my answer was helpful. Thank you for your time today. Your video interview evaluation with body language analysis is now ready. Click 'See Results' to view your detailed feedback and personalized improvement suggestions.",
                            timestamp: new Date(),
                        };
                        setMessages(prev => {
                            const newHistory = [...prev, closingMsg];
                            localStorage.setItem("chat_history", JSON.stringify(newHistory));
                            localStorage.setItem("video_metrics", JSON.stringify(videoMetrics));
                            localStorage.setItem("video_analysis", JSON.stringify(analysisResults));
                            return newHistory;
                        });
                        speakText(closingMsg.content);
                        setShowEndPrompt(true);
                        stopCamera();
                    }, 3000);
                } catch (error) {
                    console.error("Error answering question:", error);
                    // Still end the interview on error
                    const closingMsg: Message = {
                        id: Date.now().toString() + "_close",
                        role: "ai",
                        content: "Thank you for your question! Unfortunately I couldn't process it fully. Your video interview evaluation is ready - click 'See Results' to view your feedback.",
                        timestamp: new Date(),
                    };
                    setMessages(prev => {
                        const newHistory = [...prev, closingMsg];
                        localStorage.setItem("chat_history", JSON.stringify(newHistory));
                        localStorage.setItem("video_metrics", JSON.stringify(videoMetrics));
                        localStorage.setItem("video_analysis", JSON.stringify(analysisResults));
                        return newHistory;
                    });
                    speakText(closingMsg.content);
                    setShowEndPrompt(true);
                    stopCamera();
                } finally {
                    setIsTyping(false);
                }
                return;
            }

            // Default fallback - end the interview
            setTimeout(() => {
                const closingMsg: Message = {
                    id: Date.now().toString() + "_close",
                    role: "ai",
                    content: "Thank you for your time! Your video interview evaluation with body language analysis is ready. Click 'See Results' to view your detailed feedback.",
                    timestamp: new Date(),
                };
                setMessages(prev => {
                    const newHistory = [...prev, closingMsg];
                    localStorage.setItem("chat_history", JSON.stringify(newHistory));
                    localStorage.setItem("video_metrics", JSON.stringify(videoMetrics));
                    localStorage.setItem("video_analysis", JSON.stringify(analysisResults));
                    return newHistory;
                });
                speakText(closingMsg.content);
                setShowEndPrompt(true);
                stopCamera();
            }, 1000);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages(prev => {
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

            setMessages(prev => {
                const newHistory = [...prev, aiMsg];
                localStorage.setItem("chat_history", JSON.stringify(newHistory));
                return newHistory;
            });

            speakText(data.content);

            // Trigger ending sequence after the user has answered the last question
            if (newQuestionCount >= MAX_QUESTIONS + 1) {
                setTimeout(() => {
                    const thankYouMsg: Message = {
                        id: Date.now().toString() + "_thanks",
                        role: "ai",
                        content: "Thank you for participating! Your body language analysis shows great engagement. Do you have any questions before we wrap up?",
                        timestamp: new Date(),
                    };
                    setMessages(prev => {
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
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => { handleSendRef.current = handleSend; });

    if (showUserForm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 w-full">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Video Interview</h2>
                    <p className="text-slate-600 mb-6">Camera will analyze your body language</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            onClick={() => userName.trim() && setShowUserForm(false)}
                            disabled={!userName.trim()}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Video size={20} />
                            Start Video Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] max-w-5xl mx-auto border rounded-xl overflow-hidden shadow-sm bg-white mt-4">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Video className="w-5 h-5 text-green-600" />
                        {interviewType} Interview (Video)
                    </h2>
                    <p className="text-sm text-slate-500">
                        {userName} • {showEndPrompt ? `Session ends in ${countdown}s` : `Question ${Math.min(questionCount, MAX_QUESTIONS)}/${MAX_QUESTIONS}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={cn("p-2 rounded-lg transition-colors", ttsEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}
                    >
                        {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button
                        onClick={() => { setVideoEnabled(!videoEnabled); if (videoEnabled) stopCamera(); else startCamera(); }}
                        className={cn("p-2 rounded-lg transition-colors", videoEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}
                    >
                        {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    <Link href="/feedback" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        <StopCircle size={16} />
                        {showEndPrompt ? "See Results" : "End"}
                    </Link>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Video Preview */}
                <div className="w-80 border-r bg-slate-900 flex flex-col">
                    <div className="relative flex-1 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {!cameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white">
                                <p>{!videoEnabled ? "Camera turned off" : "Camera loading..."}</p>
                            </div>
                        )}
                        {!modelsLoaded && videoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 text-white">
                                <p className="text-sm">Loading AI models...</p>
                            </div>
                        )}
                        {/* Live metrics overlay */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg p-2 text-white text-xs">
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Eye size={12} /> Eye Contact: {videoMetrics.eyeContactPercent}%</span>
                                <span>Confidence: {videoMetrics.confidenceScore}%</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Engagement: {videoMetrics.engagementScore}%</span>
                                <span>{videoMetrics.dominantExpression}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex w-full items-start gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", msg.role === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-white")}>
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn("px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm", msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm")}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="flex items-center gap-2 text-slate-400 text-sm ml-12"><span className="animate-bounce">•</span><span className="animate-bounce delay-75">•</span><span className="animate-bounce delay-150">•</span></div>}
                        {isSpeaking && <div className="flex items-center gap-2 text-green-500 text-sm ml-12"><Volume2 size={16} className="animate-pulse" /><span>Speaking...</span></div>}
                    </div>

                    {/* Voice Input */}
                    <div className="p-4 bg-white border-t">
                        {(transcript || input) && (
                            <div className="mb-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                                {input}{transcript && <span className="text-slate-400">{transcript}</span>}
                            </div>
                        )}
                        <div className="flex gap-3 items-center justify-center">
                            <button onClick={toggleListening} disabled={isTyping || isSpeaking} className={cn("p-6 rounded-full transition-all shadow-lg", isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-green-600 text-white hover:bg-green-700", (isTyping || isSpeaking) && "opacity-50 cursor-not-allowed")}>
                                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                            </button>
                            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                                <Send size={24} />
                            </button>
                        </div>
                        <p className="text-center text-sm text-slate-500 mt-3">
                            {isListening ? "Listening... Click to stop" : "Click microphone to speak"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
