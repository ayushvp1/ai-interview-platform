import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LITEROUTER_API_KEY = process.env.LITEROUTER_API_KEY || "";
const LITEROUTER_BASE_URL = "https://api.literouter.com/v1";

function saveInterviewLog(data: any) {
    try {
        const logsDir = path.join(process.cwd(), "interview_logs");

        if (!fs.existsSync(logsDir)) {
            try {
                fs.mkdirSync(logsDir, { recursive: true });
            } catch (mkdirError) {
                console.warn("Could not create interview_logs directory (expected on Vercel)");
            }
        }

        const timestamp = new Date().toISOString().replace(/:/g, "-");
        const filename = `interview_${timestamp}.json`;
        const filepath = path.join(logsDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Interview log saved: ${filename}`);
    } catch (error) {
        // Handle read-only filesystem (like Vercel) gracefully
        console.warn("Could not save interview log to filesystem (expected in serverless environments like Vercel).", error);
    }
}

// Get previous attempts for the same user
function getPreviousAttempts(userName: string, interviewType: string): any[] {
    try {
        const logsDir = path.join(process.cwd(), "interview_logs");
        if (!fs.existsSync(logsDir)) return [];

        const files = fs.readdirSync(logsDir).filter(f => f.endsWith(".json"));
        const previousAttempts: any[] = [];

        for (const file of files) {
            const filepath = path.join(logsDir, file);
            const content = fs.readFileSync(filepath, "utf-8");
            const data = JSON.parse(content);

            if (data.user_info?.name?.toLowerCase() === userName.toLowerCase() &&
                data.user_info?.interview_type === interviewType) {
                previousAttempts.push({
                    date: data.timestamp,
                    score: data.evaluation?.overall_score || data.evaluation?.score || 0,
                    parameters: data.evaluation?.parameter_scores || {}
                });
            }
        }

        return previousAttempts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
        console.error("Error getting previous attempts:", error);
        return [];
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { chat_history, user_info } = body;

        if (!chat_history || !Array.isArray(chat_history)) {
            return NextResponse.json({ error: "Invalid chat history" }, { status: 400 });
        }

        if (chat_history.length < 3) {
            return NextResponse.json({ 
                error: "Your interview was too short to generate a detailed report. Please complete at least 2-3 questions for a full analysis.",
                isTooShort: true 
            }, { status: 400 });
        }

        const isVideoMode = user_info?.mode === "video";

        const prompt = `Analyze the following interview conversation and provide a comprehensive evaluation in JSON format.

Conversation History:
${JSON.stringify(chat_history, null, 2)}

Interview Type: ${user_info?.interview_type || "Technical"}
Interview Mode: ${isVideoMode ? "Video (with body language analysis)" : "Text/Voice"}

Provide your response as a valid JSON object with these EXACT fields:

{
  "overall_score": <number 0-100>,
  "parameter_scores": {
    "confidence": {
      "score": <number 0-100>,
      "feedback": "<specific feedback about confidence level>"
    },
    "communication_clarity": {
      "score": <number 0-100>,
      "feedback": "<specific feedback about communication>"
    },
    "technical_accuracy": {
      "score": <number 0-100>,
      "feedback": "<specific feedback about technical knowledge>"
    },
    "problem_solving": {
      "score": <number 0-100>,
      "feedback": "<specific feedback about problem-solving approach>"
    }${isVideoMode ? `,
    "body_language": {
      "score": <number 0-100>,
      "feedback": "<feedback about body language, eye contact, facial expressions>"
    }` : ""}
  },
  "general_feedback": "<overall summary of performance>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "areas_for_improvement": ["<area 1>", "<area 2>", ...],
  "personalized_suggestions": [
    {
      "area": "<specific skill or topic>",
      "suggestion": "<actionable advice to improve>",
      "resources": "<optional learning resource or practice tip>"
    }
  ]
}

Be specific, constructive, and provide actionable feedback. Respond with ONLY the JSON object, no markdown formatting.`;

        let response;
        let retries = 5; // Increased to 5 retries
        let delay = 9000; // Increased to 9 seconds per retry to be safe

        while (retries > 0) {
            response = await fetch(`${LITEROUTER_BASE_URL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${LITEROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gemini-free",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 2048,
                    temperature: 0.3,
                }),
            });

            if (response.status === 403 || response.status === 429) {
                console.warn(`Rate limit hit. Retrying in ${delay/1000}s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries--;
                continue;
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.error("LiteRouter API error:", response.status, errorData);
                throw new Error(`API error: ${response.status}`);
            }
            
            break; // Success
        }

        if (!response || !response.ok) {
            throw new Error("Failed to reach AI provider after multiple retries.");
        }

        const data = await response.json();
        let text = data.choices?.[0]?.message?.content || "";

        // Extract JSON block if AI includes markdown or extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        const evaluation = JSON.parse(text);

        // Get progress data for repeated attempts
        const previousAttempts = user_info?.name
            ? getPreviousAttempts(user_info.name, user_info.interview_type || "Technical")
            : [];

        // Calculate progress metrics
        let progress = null;
        if (previousAttempts.length > 0) {
            const lastAttempt = previousAttempts[previousAttempts.length - 1];
            const improvement = evaluation.overall_score - lastAttempt.score;

            progress = {
                total_attempts: previousAttempts.length + 1,
                previous_scores: previousAttempts.map(a => ({ date: a.date, score: a.score })),
                improvement_from_last: improvement,
                trend: improvement > 0 ? "improving" : improvement < 0 ? "declining" : "stable"
            };
        }

        // Save interview log with full evaluation
        const logData = {
            timestamp: new Date().toISOString(),
            user_info: user_info || { name: "Anonymous" },
            chat_history,
            evaluation,
            progress
        };

        saveInterviewLog(logData);

        return NextResponse.json({
            ...evaluation,
            progress
        });
    } catch (error: any) {
        console.error("Error in evaluation API:", error);
        return NextResponse.json({ error: error.message || "Failed to evaluate interview" }, { status: 500 });
    }
}
