import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userName = searchParams.get("userName");

        const logsDir = path.join(process.cwd(), "interview_logs");
        if (!fs.existsSync(logsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(logsDir).filter(f => f.endsWith(".json"));
        const history: any[] = [];

        for (const file of files) {
            try {
                const filepath = path.join(logsDir, file);
                const content = fs.readFileSync(filepath, "utf-8");
                const data = JSON.parse(content);

                // If a userName is provided, filter by it
                if (userName && data.user_info?.name?.toLowerCase() !== userName.toLowerCase()) {
                    continue;
                }

                history.push({
                    id: file.replace(".json", ""),
                    type: data.user_info?.interview_type || "Technical",
                    date: new Date(data.timestamp).toLocaleDateString(),
                    score: data.evaluation?.overall_score || 0,
                    timestamp: data.timestamp
                });
            } catch (e) {
                console.error(`Error parsing log file ${file}:`, e);
            }
        }

        // Sort by timestamp descending (newest first)
        return NextResponse.json(history.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
    } catch (error: any) {
        console.error("Error fetching history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
