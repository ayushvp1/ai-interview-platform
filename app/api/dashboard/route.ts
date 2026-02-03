import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const logsDir = path.join(process.cwd(), "interview_logs");

        if (!fs.existsSync(logsDir)) {
            return NextResponse.json({
                total_interviews: 0,
                average_score: 0,
                by_type: {},
                recent: [],
                top_performers: [],
                parameter_averages: {}
            });
        }

        const files = fs.readdirSync(logsDir).filter(f => f.endsWith(".json"));
        const interviews: any[] = [];

        for (const file of files) {
            const filepath = path.join(logsDir, file);
            const content = fs.readFileSync(filepath, "utf-8");
            interviews.push(JSON.parse(content));
        }

        // Calculate statistics
        const totalInterviews = interviews.length;
        const scores = interviews.map(i => i.evaluation?.overall_score || i.evaluation?.score || 0);
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // By type
        const byType: Record<string, { count: number; avgScore: number }> = {};
        interviews.forEach(i => {
            const type = i.user_info?.interview_type || "Unknown";
            if (!byType[type]) byType[type] = { count: 0, avgScore: 0 };
            byType[type].count++;
            byType[type].avgScore += i.evaluation?.overall_score || i.evaluation?.score || 0;
        });
        Object.keys(byType).forEach(k => {
            byType[k].avgScore = Math.round(byType[k].avgScore / byType[k].count);
        });

        // Recent interviews
        const recent = interviews
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map(i => ({
                name: i.user_info?.name || "Anonymous",
                type: i.user_info?.interview_type || "Unknown",
                score: i.evaluation?.overall_score || i.evaluation?.score || 0,
                date: i.timestamp
            }));

        // Top performers
        const topPerformers = interviews
            .sort((a, b) => (b.evaluation?.overall_score || 0) - (a.evaluation?.overall_score || 0))
            .slice(0, 5)
            .map(i => ({
                name: i.user_info?.name || "Anonymous",
                type: i.user_info?.interview_type || "Unknown",
                score: i.evaluation?.overall_score || i.evaluation?.score || 0
            }));

        // Parameter averages
        const parameterTotals: Record<string, { total: number; count: number }> = {};
        interviews.forEach(i => {
            const params = i.evaluation?.parameter_scores;
            if (params) {
                Object.entries(params).forEach(([key, val]: [string, any]) => {
                    if (!parameterTotals[key]) parameterTotals[key] = { total: 0, count: 0 };
                    parameterTotals[key].total += val.score || 0;
                    parameterTotals[key].count++;
                });
            }
        });
        const parameterAverages: Record<string, number> = {};
        Object.entries(parameterTotals).forEach(([key, val]) => {
            parameterAverages[key] = Math.round(val.total / val.count);
        });

        return NextResponse.json({
            total_interviews: totalInterviews,
            average_score: averageScore,
            by_type: byType,
            recent,
            top_performers: topPerformers,
            parameter_averages: parameterAverages
        });
    } catch (error: any) {
        console.error("Error getting stats:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
