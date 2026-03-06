import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { messages, role, company, interviewType, totalQuestions } = await req.json();

        if (!messages || !Array.isArray(messages) || !role) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const contextPrefix = `You are interviewing the candidate for the role of "${role}"${company ? ` at ${company}` : ""}. This is a ${interviewType || "Mixed"} interview. The interview will have exactly ${totalQuestions || 6} questions total. `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: contextPrefix + SYSTEM_PROMPTS.INTERVIEWER },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2048,
        });

        const responseContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ content: responseContent });
    } catch (error: any) {
        console.error("Interview API error:", error);
        return NextResponse.json(
            { error: "Failed to generate response", details: error.message },
            { status: 500 }
        );
    }
}
