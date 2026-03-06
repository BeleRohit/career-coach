import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: "Missing text" }, { status: 400 });
        }

        const res = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": process.env.SARVAM_API_KEY || "",
            },
            body: JSON.stringify({
                inputs: [text.substring(0, 500)],
                target_language_code: "en-IN",
                model: "bulbul:v2",
                enable_preprocessing: true,
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Sarvam TTS Error:", errText);
            return NextResponse.json({ error: "TTS failed" }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json({ audio: data.audios?.[0] || null });
    } catch (error: any) {
        console.error("TTS Proxy Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
