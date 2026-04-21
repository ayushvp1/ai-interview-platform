import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
        }

        const cwd = process.cwd();
        const logsDir = path.join(cwd, "interview_logs");
        
        console.log(`[API-GET] Looking for report ID: ${id}`);

        if (!fs.existsSync(logsDir)) {
            return NextResponse.json({ error: "Logs directory not found" }, { status: 404 });
        }

        // Try exact matches and partial matches
        const files = fs.readdirSync(logsDir);
        const found = files.find(f => 
            f === id || 
            f === `${id}.json` || 
            f.includes(id)
        );

        if (!found) {
            console.error(`[API-GET] No file found for ${id}`);
            return NextResponse.json({ 
                error: "Report file not found", 
                id,
                availableCount: files.length 
            }, { status: 404 });
        }

        const filepath = path.join(logsDir, found);
        const content = fs.readFileSync(filepath, "utf-8");
        const data = JSON.parse(content);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }
}
