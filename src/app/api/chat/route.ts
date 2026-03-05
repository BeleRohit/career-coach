import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPTS.CAREER_COACH },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const responseContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({ content: responseContent });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Failed to generate response", details: error.message },
            { status: 500 }
        );
    }
}
