import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const id = decodeURIComponent(rawId);
        const cwd = process.cwd();
        const logsDir = path.join(cwd, "interview_logs");
        
        console.log(`[API] Looking for report ID: ${id}`);
        console.log(`[API] Current Working Directory: ${cwd}`);
        console.log(`[API] Logs Directory Path: ${logsDir}`);

        if (!fs.existsSync(logsDir)) {
            console.error(`[API] Error: Logs directory does not exist at ${logsDir}`);
            return NextResponse.json({ error: "Logs directory not found on server" }, { status: 404 });
        }

        // Try direct match with .json
        let filepath = path.join(logsDir, id.endsWith(".json") ? id : `${id}.json`);
        
        if (!fs.existsSync(filepath)) {
            console.log(`[API] Direct match failed for ${filepath}. Searching directory...`);
            const files = fs.readdirSync(logsDir);
            const found = files.find(f => f === id || f === `${id}.json` || f.includes(id));
            
            if (found) {
                filepath = path.join(logsDir, found);
                console.log(`[API] Found match via search: ${found}`);
            } else {
                console.error(`[API] No matching file found for ID: ${id}. Available files: ${files.length}`);
                return NextResponse.json({ 
                    error: "Report file not found", 
                    id,
                    availableFiles: files.length 
                }, { status: 404 });
            }
        }

        const content = fs.readFileSync(filepath, "utf-8");
        const data = JSON.parse(content);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }
}
