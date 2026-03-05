import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const targetRole = formData.get("targetRole") as string;

        if (!file || !targetRole) {
            return NextResponse.json(
                { error: "Missing file or target role" },
                { status: 400 }
            );
        }

        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Extract text from PDF (dynamic import to avoid build-time canvas polyfill errors)
        const buffer = Buffer.from(await file.arrayBuffer());
        let resumeText = "";
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdf = require("pdf-parse");
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
        } catch (error) {
            console.error("PDF Parsing Error:", error);
            return NextResponse.json(
                { error: "Failed to parse PDF document. Ensure it is a valid, text-based PDF." },
                { status: 400 }
            );
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: "No readable text found in PDF. Make sure it is not an image-only scan." },
                { status: 400 }
            );
        }

        // 3. Query Groq for Analysis
        const prompt = `You are an expert tech recruiter and ATS optimization tool.
I am providing you with the extracted text of a candidate's resume and their target role. 
Analyze the resume strictly against the target role. 

Target Role: ${targetRole}

Resume Text:
"""
${resumeText.substring(0, 15000)} // Rough cutoff to avoid token limits if the PDF is gigantic
"""

Provide your analysis in the following strict JSON format. Do not include markdown blocks, just the raw JSON object:
{
  "gaps": ["Actionable gap 1", "Actionable gap 2"],
  "weakPhrasing": [
    {
      "original": "Weak bullet point from resume",
      "improved": "Action-oriented, quantified improvement"
    }
  ],
  "missingKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "overallScore": 85,
  "summary": "2-3 sentences of overall advice"
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert career coach and technical recruiter. Output valid JSON only.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 2048,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No response from AI");
        }

        // Strip markdown code blocks if the model accidentally included them
        const jsonString = content.replace(/```json\n?|\n?```/gi, '').trim();
        const analysis = JSON.parse(jsonString);

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("Resume Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze resume" },
            { status: 500 }
        );
    }
}
