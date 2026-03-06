import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get("file") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
        }

        // Forward to Sarvam STT API
        const sarvamForm = new FormData();
        sarvamForm.append("file", audioFile);
        sarvamForm.append("model", "saaras:v3");
        sarvamForm.append("language_code", "en-IN");

        const res = await fetch("https://api.sarvam.ai/speech-to-text", {
            method: "POST",
            headers: {
                "api-subscription-key": process.env.SARVAM_API_KEY || "",
            },
            body: sarvamForm,
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Sarvam STT Error:", errText);
            return NextResponse.json({ error: "STT failed" }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json({ transcript: data.transcript || "" });
    } catch (error: any) {
        console.error("STT Proxy Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
