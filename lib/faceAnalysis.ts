import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;
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
        yaw: number;
        pitch: number;
        roll: number;
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

export async function loadFaceModels(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (modelsLoaded && faceLandmarker) return true;

    try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `/models/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: "VIDEO",
            numFaces: 1
        });
        modelsLoaded = true;
        console.log("MediaPipe Face Landmarker loaded");
        return true;
    } catch (error) {
        console.error("Error loading MediaPipe models:", error);
        return false;
    }
}

export async function analyzeFrame(video: HTMLVideoElement): Promise<FaceAnalysisResult | null> {
    if (!modelsLoaded || !faceLandmarker) return null;

    try {
        if (video.paused || video.ended || video.readyState < 2) {
            return null;
        }

        const startTimeMs = performance.now();
        const result = faceLandmarker.detectForVideo(video, startTimeMs);

        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
            return null;
        }

        const landmarks = result.faceLandmarks[0];
        const blendshapes = result.faceBlendshapes?.[0]?.categories || [];
        
        // Map blendshapes to our ExpressionData interface
        const shapes: Record<string, number> = {};
        blendshapes.forEach(c => {
            shapes[c.categoryName] = c.score;
        });

        const expressions: ExpressionData = {
            neutral: shapes['neutral'] || 0.5, // MediaPipe doesn't have a direct 'neutral' blendshape usually, we can estimate
            happy: Math.max(shapes['mouthSmileLeft'] || 0, shapes['mouthSmileRight'] || 0),
            sad: Math.max(shapes['browDownLeft'] || 0, shapes['browDownRight'] || 0, shapes['mouthFrownLeft'] || 0),
            angry: Math.max(shapes['browDownLeft'] || 0, shapes['browDownRight'] || 0, shapes['mouthPressLeft'] || 0),
            fearful: Math.max(shapes['browInnerUp'] || 0, shapes['eyeWideLeft'] || 0),
            disgusted: Math.max(shapes['noseSneerLeft'] || 0, shapes['noseSneerRight'] || 0),
            surprised: Math.max(shapes['eyeWideLeft'] || 0, shapes['eyeWideRight'] || 0, shapes['jawOpen'] || 0)
        };

        // Estimate Neutral (it's the absence of other strong emotions)
        const maxEmotion = Math.max(expressions.happy, expressions.sad, expressions.angry, expressions.fearful, expressions.disgusted, expressions.surprised);
        expressions.neutral = Math.max(0, 1 - maxEmotion);

        // Calculate Head Pose (Yaw, Pitch, Roll) from transformation matrix if available, 
        // or estimate from landmarks. MediaPipe transformation matrix is more accurate.
        let yaw = 0, pitch = 0, roll = 0;
        if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
            const matrix = result.facialTransformationMatrixes[0].data;
            // Extract Euler angles from rotation matrix
            pitch = Math.asin(-matrix[6]) * (180 / Math.PI);
            yaw = Math.atan2(matrix[2], matrix[10]) * (180 / Math.PI);
            roll = Math.atan2(matrix[4], matrix[5]) * (180 / Math.PI);
        }

        // Eye contact logic
        const blinkLeft = shapes['eyeBlinkLeft'] || 0;
        const blinkRight = shapes['eyeBlinkRight'] || 0;
        const eyesOpen = blinkLeft < 0.4 && blinkRight < 0.4;
        
        // Face must be facing the camera (Yaw/Pitch within 15 degrees)
        const isFacingCamera = Math.abs(yaw) < 18 && Math.abs(pitch) < 18;
        
        // Detection score is implicit in MediaPipe if we get landmarks
        const eyeContact = eyesOpen && isFacingCamera;

        // Confidence score calculation
        const positiveExpressions = expressions.neutral * 0.4 + expressions.happy * 0.6;
        const negativeExpressions = expressions.fearful * 1.0 + expressions.sad * 0.6 + expressions.angry * 0.4;
        let confidenceScore = 0.4 + positiveExpressions - negativeExpressions;
        confidenceScore += eyeContact ? 0.25 : -0.2;

        return {
            expressions,
            confidence: Math.max(0, Math.min(1, confidenceScore)),
            eyeContact,
            headPose: { yaw, pitch, roll },
            timestamp: Date.now()
        };
    } catch (error) {
        console.error("MediaPipe analysis error:", error);
        return null;
    }
}

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

    const avgConfidence = results.reduce((s, r) => s + r.confidence, 0) / results.length;
    const eyeContactCount = results.filter(r => r.eyeContact).length;
    const eyeContactPercent = (eyeContactCount / results.length) * 100;

    const expressionTotals: ExpressionData = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
    results.forEach(r => {
        Object.keys(expressionTotals).forEach(key => {
            expressionTotals[key as keyof ExpressionData] += r.expressions[key as keyof ExpressionData];
        });
    });
    Object.keys(expressionTotals).forEach(key => {
        expressionTotals[key as keyof ExpressionData] /= results.length;
    });

    let dominantExpression = "neutral";
    let maxVal = expressionTotals.neutral;

    Object.entries(expressionTotals).forEach(([exp, val]) => {
        if (exp === 'neutral') return;
        if (val > maxVal && val > 0.15) {
            maxVal = val;
            dominantExpression = exp;
        }
    });

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
    const negativeImpact = (expressionTotals.fearful * 1.5 + expressionTotals.sad * 0.8 + expressionTotals.angry * 0.3);
    const nervousnessScore = Math.min(100, Math.round(negativeImpact * 100));

    const expressionEngagement = Math.min(1, (expressionTotals.neutral * 0.5 + expressionTotals.happy * 1.0 + expressionTotals.surprised * 0.7));
    const engagementScore = Math.round((eyeContactPercent * 0.7) + (expressionEngagement * 30));

    const overallBodyLanguageScore = Math.round(
        (avgConfidence * 40) +
        (eyeContactPercent * 0.3) +
        (engagementScore * 0.2) +
        ((100 - nervousnessScore) * 0.1)
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
