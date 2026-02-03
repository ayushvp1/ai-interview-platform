import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const { userName, id } = await req.json();

        const logsDir = path.join(process.cwd(), "interview_logs");
        if (!fs.existsSync(logsDir)) {
            return NextResponse.json({ message: "No logs found to clear" });
        }

        // Handle single ID deletion
        if (id) {
            const filepath = path.join(logsDir, `${id}.json`);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return NextResponse.json({ message: `Successfully deleted log ${id}`, count: 1 });
            }
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }

        // Handle bulk delete by userName
        if (!userName) {
            return NextResponse.json({ error: "UserName or ID is required" }, { status: 400 });
        }

        const files = fs.readdirSync(logsDir).filter(f => f.endsWith(".json"));
        let count = 0;

        for (const file of files) {
            const filepath = path.join(logsDir, file);
            const content = fs.readFileSync(filepath, "utf-8");
            const data = JSON.parse(content);

            if (data.user_info?.name?.toLowerCase() === userName.toLowerCase()) {
                fs.unlinkSync(filepath);
                count++;
            }
        }

        return NextResponse.json({
            message: `Successfully cleared ${count} logs for ${userName}`,
            count
        });
    } catch (error: any) {
        console.error("Error clearing logs:", error);
        return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
    }
}
