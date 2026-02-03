// Face Analysis Utilities using face-api.js
let faceapi: any = null;
let modelsLoaded = false;

export interface ExpressionData {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
}

export interface FaceAnalysisResult {
    expressions: ExpressionData;
    confidence: number;
    eyeContact: boolean;
    headPose: {
        yaw: number;  // left/right
        pitch: number; // up/down
        roll: number;  // tilt
    };
    timestamp: number;
}

export interface AggregatedMetrics {
    averageConfidence: number;
    eyeContactPercent: number;
    dominantExpression: string;
    expressionDistribution: ExpressionData;
    nervousnessScore: number;
    engagementScore: number;
    overallBodyLanguageScore: number;
}

// Load face-api models
export async function loadFaceModels(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (modelsLoaded && faceapi) return true;

    try {
        if (!faceapi) {
            faceapi = await import('@vladmandic/face-api');
        }

        const MODEL_URL = '/models';

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);

        modelsLoaded = true;
        console.log('Face detection models loaded');
        return true;
    } catch (error) {
        console.error('Error loading face models:', error);
        return false;
    }
}

// Analyze a single frame
export async function analyzeFrame(video: HTMLVideoElement): Promise<FaceAnalysisResult | null> {
    if (!modelsLoaded) return null;

    try {
        // Ensure video is ready before analysis
        if (video.paused || video.ended || video.readyState < 2) {
            return null;
        }

        const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.2 }))
            .withFaceLandmarks(true)
            .withFaceExpressions();

        if (!detection) return null;

        const expressions = detection.expressions as ExpressionData;

        // Estimate eye contact from landmarks
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        // Estimate head pose from landmarks for more precise eye contact
        const noseTop = nose[0];
        const noseBottom = nose[nose.length - 1];
        const leftEyeCenter = { x: leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length, y: leftEye.reduce((s, p) => s + p.y, 0) / leftEye.length };
        const rightEyeCenter = { x: rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length, y: rightEye.reduce((s, p) => s + p.y, 0) / rightEye.length };

        const eyeDistance = rightEyeCenter.x - leftEyeCenter.x;
        const noseOffset = noseTop.x - (leftEyeCenter.x + eyeDistance / 2);

        const yaw = noseOffset / eyeDistance * 45;
        const pitch = (noseBottom.y - noseTop.y) / detection.detection.box.height * 30 - 15;
        const roll = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, eyeDistance) * 180 / Math.PI;

        // Precise eye contact estimation:
        // 1. Face must be relatively centered
        // 2. Head must not be turned too far (Yaw < 15 deg)
        // 3. Head must not be tilted up/down too far (Pitch < 15 deg)
        const faceBox = detection.detection.box;
        const videoWidth = video.videoWidth || 320;
        const videoHeight = video.videoHeight || 240;
        const faceCenterX = faceBox.x + faceBox.width / 2;
        const faceCenterY = faceBox.y + faceBox.height / 2;

        const isCentered = Math.abs(faceCenterX - videoWidth / 2) < videoWidth * 0.2 &&
            Math.abs(faceCenterY - videoHeight / 2) < videoHeight * 0.25;
        const isFacingCamera = Math.abs(yaw) < 15 && Math.abs(pitch) < 15;

        const eyeContact = isCentered && isFacingCamera;
        // Calculate confidence score (0-1)
        // Factors: Neutral/Happy are positive, Fearful/Sad/Disgusted are negative
        // Eye contact is also a major confidence indicator
        const positiveExpressions = expressions.neutral * 0.4 + expressions.happy * 0.4;
        const negativeExpressions = expressions.fearful * 1.0 + expressions.sad * 0.6 + expressions.disgusted * 0.6;

        // Base confidence from expressions
        let confidenceScore = 0.5 + positiveExpressions - negativeExpressions;

        // Eye contact bonus/penalty
        confidenceScore += eyeContact ? 0.15 : -0.1;

        // Confidence also suffers from extreme "surprised" (might look like panic)
        confidenceScore -= expressions.surprised * 0.4;

        return {
            expressions,
            confidence: Math.max(0, Math.min(1, confidenceScore)),
            eyeContact,
            headPose: {
                yaw,
                pitch,
                roll
            },
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Error analyzing frame:', error);
        return null;
    }
}

// Aggregate multiple analysis results
export function aggregateMetrics(results: FaceAnalysisResult[]): AggregatedMetrics {
    if (results.length === 0) {
        return {
            averageConfidence: 50,
            eyeContactPercent: 50,
            dominantExpression: 'neutral',
            expressionDistribution: { neutral: 1, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 },
            nervousnessScore: 50,
            engagementScore: 50,
            overallBodyLanguageScore: 50
        };
    }

    // Average confidence
    const avgConfidence = results.reduce((s, r) => s + r.confidence, 0) / results.length;

    // Eye contact percentage
    const eyeContactCount = results.filter(r => r.eyeContact).length;
    const eyeContactPercent = (eyeContactCount / results.length) * 100;

    // Expression distribution
    const expressionTotals: ExpressionData = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
    results.forEach(r => {
        Object.keys(expressionTotals).forEach(key => {
            expressionTotals[key as keyof ExpressionData] += r.expressions[key as keyof ExpressionData];
        });
    });
    Object.keys(expressionTotals).forEach(key => {
        expressionTotals[key as keyof ExpressionData] /= results.length;
    });

    // Dominant expression with slight bias away from 'neutral' for more interesting feedback
    // If any emotion is > 20%, consider it significant
    let dominantExpression = "neutral";
    let maxVal = expressionTotals.neutral;

    Object.entries(expressionTotals).forEach(([exp, val]) => {
        if (exp === 'neutral') return;
        // Boost non-neutral expressions to make "Mood" more reactive
        const boostedVal = val * 1.5;
        if (boostedVal > maxVal && boostedVal > 0.2) {
            maxVal = boostedVal;
            dominantExpression = exp;
        }
    });

    // Map to user-friendly "Mood" strings
    const moodMap: Record<string, string> = {
        neutral: "😐 Professional",
        happy: "😊 Positive",
        sad: "😔 Concerned",
        angry: "😠 Focused",
        fearful: "😟 Nervous",
        disgusted: "😒 Disappointed",
        surprised: "😮 Interested"
    };

    const displayMood = moodMap[dominantExpression] || "😐 Professional";

    // Nervousness score (0-100)
    // ... rest of the logic ...
    const negativeImpact = (expressionTotals.fearful * 1.5 + expressionTotals.sad * 0.8 + expressionTotals.disgusted * 0.5 + expressionTotals.angry * 0.3);
    const nervousnessScore = Math.min(100, Math.round(negativeImpact * 100));

    // Engagement score (0-100)
    // Crucial: Eye contact is 70% of engagement, Expressions are 30%
    const expressionEngagement = (expressionTotals.neutral * 0.3 + expressionTotals.happy * 0.6 + expressionTotals.surprised * 0.4);
    const engagementScore = Math.round(
        (eyeContactPercent * 0.7) +
        (expressionEngagement * 30)
    );

    // Overall body language score (0-100)
    const overallBodyLanguageScore = Math.round(
        (avgConfidence * 40) +           // 40% Confidence (avgConfidence is 0-1, so scale to 0-40)
        (eyeContactPercent * 0.3) +      // 30% Eye Contact (eyeContactPercent is 0-100)
        (engagementScore * 0.2) +        // 20% Engagement
        ((100 - nervousnessScore) * 0.1) // 10% Absence of nervousness
    );

    return {
        averageConfidence: Math.round(avgConfidence * 100),
        eyeContactPercent: Math.round(eyeContactPercent),
        dominantExpression: displayMood,
        expressionDistribution: expressionTotals,
        nervousnessScore,
        engagementScore,
        overallBodyLanguageScore: Math.min(100, Math.max(0, overallBodyLanguageScore))
    };
}
