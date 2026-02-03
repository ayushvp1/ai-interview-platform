"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Video, VideoOff, RefreshCw } from "lucide-react";
import Link from "next/link";

// Import face-api dynamically to avoid SSR issues
let faceapi: any = null;

export default function VideoTestPage() {
    const [status, setStatus] = useState("Initializing...");
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [metrics, setMetrics] = useState({
        expression: "waiting",
        eyeContact: false,
        confidence: 0,
        faceDetected: false
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const cameraReadyRef = useRef(false);
    const modelsLoadedRef = useRef(false);

    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 29)]);
        console.log(msg);
    }, []);

    // Load face-api on mount
    useEffect(() => {
        const loadFaceApi = async () => {
            try {
                setStatus("Loading face-api library...");
                addLog("Loading face-api library...");

                const faceApiModule = await import('@vladmandic/face-api');
                faceapi = faceApiModule;

                addLog("Face-api library loaded");
                setStatus("Loading face detection models...");

                const MODEL_URL = '/models';

                addLog("Loading TinyFaceDetector...");
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                addLog("✓ TinyFaceDetector loaded");

                addLog("Loading FaceExpressionNet...");
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                addLog("✓ FaceExpressionNet loaded");

                addLog("Loading FaceLandmark68TinyNet...");
                await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
                addLog("✓ FaceLandmark68TinyNet loaded");

                setModelsLoaded(true);
                modelsLoadedRef.current = true;
                setStatus("Models loaded! Click 'Start Camera' to begin.");
                addLog("All models loaded successfully!");
            } catch (error: any) {
                addLog(`ERROR loading models: ${error.message}`);
                setStatus(`Error: ${error.message}`);
            }
        };

        loadFaceApi();

        return () => {
            stopCamera();
        };
    }, [addLog]);

    const analyzeFrame = useCallback(async () => {
        if (!videoRef.current || !modelsLoadedRef.current || !faceapi || !cameraReadyRef.current) {
            addLog("Skipping: not ready");
            return;
        }

        const video = videoRef.current;

        if (video.paused || video.ended || video.readyState < 2) {
            addLog("Video not ready for analysis");
            return;
        }

        try {
            addLog("Analyzing frame...");

            const detection = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.2
                }))
                .withFaceLandmarks(true)
                .withFaceExpressions();

            if (!detection) {
                setMetrics(prev => ({ ...prev, faceDetected: false, expression: "no face" }));
                addLog("⚠ No face detected in frame");
                return;
            }

            // Get expressions
            const expressions = detection.expressions;
            const expressionArray = Object.entries(expressions).map(([name, value]) => ({ name, value: value as number }));
            const dominant = expressionArray.reduce((a, b) => a.value > b.value ? a : b);

            // Calculate eye contact
            const box = detection.detection.box;
            const videoWidth = video.videoWidth;
            const centerX = box.x + box.width / 2;
            const eyeContact = Math.abs(centerX - videoWidth / 2) < videoWidth * 0.3;

            // Confidence
            const confidence = Math.round(detection.detection.score * 100);

            setMetrics({
                expression: dominant.name,
                eyeContact,
                confidence,
                faceDetected: true
            });

            addLog(`✓ Face: ${dominant.name} (${(dominant.value * 100).toFixed(0)}%) | Eye: ${eyeContact ? 'Yes' : 'No'} | Conf: ${confidence}%`);

        } catch (error: any) {
            addLog(`ERROR in analysis: ${error.message}`);
        }
    }, [addLog]);

    const startCamera = async () => {
        try {
            addLog("Requesting camera access...");
            setStatus("Requesting camera...");

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false
            });

            streamRef.current = stream;
            addLog("Camera stream obtained");

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                videoRef.current.onloadedmetadata = () => {
                    const vw = videoRef.current?.videoWidth || 0;
                    const vh = videoRef.current?.videoHeight || 0;
                    addLog(`Video ready: ${vw}x${vh}`);
                    cameraReadyRef.current = true;
                    setVideoEnabled(true);
                    setStatus("Camera active - analyzing...");

                    // Start analysis loop
                    addLog("Starting face analysis loop (every 2s)...");
                    if (analysisIntervalRef.current) {
                        clearInterval(analysisIntervalRef.current);
                    }

                    // First analysis immediately
                    setTimeout(() => analyzeFrame(), 500);

                    // Then every 2 seconds
                    analysisIntervalRef.current = setInterval(() => {
                        analyzeFrame();
                    }, 2000);
                };
            }
        } catch (error: any) {
            addLog(`ERROR accessing camera: ${error.message}`);
            setStatus(`Camera error: ${error.message}`);
        }
    };

    const stopCamera = () => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        cameraReadyRef.current = false;
        setVideoEnabled(false);
        setStatus("Camera stopped");
        addLog("Camera stopped");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Video Metrics Debug Test</h1>
                    <Link href="/" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                        ← Back
                    </Link>
                </div>

                {/* Status Bar */}
                <div className={`p-4 rounded mb-6 ${modelsLoaded ? 'bg-green-900' : 'bg-yellow-900'}`}>
                    <strong>Status:</strong> {status}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Video Section */}
                    <div>
                        <div className="bg-black rounded-lg overflow-hidden aspect-[4/3] relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {!videoEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <Video size={48} />
                                </div>
                            )}
                            {videoEnabled && metrics.faceDetected && (
                                <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded text-sm">
                                    Face Detected ✓
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={videoEnabled ? stopCamera : startCamera}
                                disabled={!modelsLoaded}
                                className={`flex-1 py-3 rounded font-semibold flex items-center justify-center gap-2 ${videoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    } ${!modelsLoaded && 'opacity-50 cursor-not-allowed'}`}
                            >
                                {videoEnabled ? <VideoOff size={20} /> : <Video size={20} />}
                                {videoEnabled ? "Stop" : "Start Camera"}
                            </button>
                            <button
                                onClick={() => setLogs([])}
                                className="px-4 bg-gray-700 rounded hover:bg-gray-600"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="space-y-4">
                        {/* Current Metrics */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-bold mb-4 text-lg">Live Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700 p-3 rounded">
                                    <div className="text-gray-400 text-sm">Expression</div>
                                    <div className="text-2xl font-bold capitalize">{metrics.expression}</div>
                                </div>
                                <div className="bg-gray-700 p-3 rounded">
                                    <div className="text-gray-400 text-sm">Eye Contact</div>
                                    <div className={`text-2xl font-bold ${metrics.eyeContact ? 'text-green-400' : 'text-red-400'}`}>
                                        {metrics.eyeContact ? "YES" : "NO"}
                                    </div>
                                </div>
                                <div className="bg-gray-700 p-3 rounded">
                                    <div className="text-gray-400 text-sm">Confidence</div>
                                    <div className="text-2xl font-bold">{metrics.confidence}%</div>
                                </div>
                                <div className="bg-gray-700 p-3 rounded">
                                    <div className="text-gray-400 text-sm">Face Detected</div>
                                    <div className={`text-2xl font-bold ${metrics.faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                                        {metrics.faceDetected ? "YES" : "NO"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Debug Log */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-bold mb-2">Debug Log</h3>
                            <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-xs">
                                {logs.map((log, i) => (
                                    <div key={i} className={
                                        log.includes('ERROR') ? 'text-red-400' :
                                            log.includes('✓') ? 'text-green-400' :
                                                log.includes('⚠') ? 'text-yellow-400' :
                                                    'text-gray-300'
                                    }>
                                        {log}
                                    </div>
                                ))}
                                {logs.length === 0 && <div className="text-gray-500">Waiting for logs...</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
