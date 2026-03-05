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
                { role: "system", content: SYSTEM_PROMPTS.ROADMAP_GENERATOR },
                { role: "user", content: prompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Low temperature for more structured JSON output
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content || "{}";
        const roadmap = JSON.parse(content);

        // Validate structure briefly
        if (!roadmap.months_3 || !roadmap.months_6 || !roadmap.months_12) {
            throw new Error("Invalid roadmap JSON structure returned from AI");
        }

        return NextResponse.json(roadmap);
    } catch (error: any) {
        console.error("Roadmap API error:", error);
        return NextResponse.json(
            { error: "Failed to generate learning roadmap", details: error.message },
            { status: 500 }
        );
    }
}
