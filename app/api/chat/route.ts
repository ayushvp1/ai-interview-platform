import { NextResponse } from "next/server";

const LITEROUTER_API_KEY = process.env.LITEROUTER_API_KEY || "";
const LITEROUTER_BASE_URL = "https://api.literouter.com/v1";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, type } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const systemInstruction = `You are an expert AI Interviewer conducting a ${type || "Technical"} interview. 
Your goal is to assess the candidate's skills, confidence, and problem-solving abilities.
- Ask one question at a time.
- Be professional but encouraging.
- If the user's answer is brief, ask follow-up questions.
- Do not give away the answer, but hint if they are stuck.
- Keep responses concise and focused.`;

        // Format messages for OpenAI-compatible API
        const formattedMessages = [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.content,
            })),
        ];

        const response = await fetch(`${LITEROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LITEROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gemini-free",
                messages: formattedMessages,
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("LiteRouter API error:", response.status, errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response.";

        return NextResponse.json({
            role: "ai",
            content: text,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Error in chat API:", error);

        let errorMessage = "Internal Server Error";

        if (error.message) {
            errorMessage = error.message;
            console.error("API Error:", errorMessage);
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
