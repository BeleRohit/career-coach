import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { targetRole, currentSkills } = await req.json();

        if (!targetRole || !currentSkills) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `Target Role: ${targetRole}\nCurrent Skills: ${currentSkills}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPTS.SKILL_ANALYZER },
                { role: "user", content: prompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Low temperature for more deterministic JSON output
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(content);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Analyze API error:", error);
        return NextResponse.json(
            { error: "Failed to generate skill analysis", details: error.message },
            { status: 500 }
        );
    }
}
