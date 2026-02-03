import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const logsDir = path.join(process.cwd(), "interview_logs");

        if (!fs.existsSync(logsDir)) {
            return NextResponse.json({ interviews: [] });
        }

        const files = fs.readdirSync(logsDir)
            .filter(f => f.endsWith(".json"))
            .sort((a, b) => b.localeCompare(a)); // Most recent first

        const interviews = files.map(filename => {
            const filepath = path.join(logsDir, filename);
            const content = fs.readFileSync(filepath, "utf-8");
            const data = JSON.parse(content);
            return {
                id: filename.replace(".json", ""),
                filename,
                ...data
            };
        });

        return NextResponse.json({ interviews });
    } catch (error: any) {
        console.error("Error reading interviews:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
