"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Send, User, Play, Clock, ChevronRight, Trophy, TrendingUp, MessageSquare, Shield, Target, History, ArrowLeft, Mic, MicOff, Volume2, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; role: "assistant" | "user"; content: string };

type InterviewScores = {
    communication: number;
    relevance: number;
    confidence: number;
    structure: number;
};

type AnswerFeedback = {
    question: string;
    strengths: string;
    improvements: string;
};

type InterviewReport = {
    completed: boolean;
    overallScore: number;
    scores: InterviewScores;
    answerFeedback: AnswerFeedback[];
    topImprovements: string[];
    summary: string;
};

type HistoryEntry = {
    id: string;
    role: string;
    company: string;
    type: string;
    score: number;
    date: string;
    voiceMode: boolean;
};

type Phase = "setup" | "interview" | "report";

export default function InterviewSimulatorPage() {
    // Setup state
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [interviewType, setInterviewType] = useState<"Behavioral" | "Technical" | "Mixed">("Mixed");
    const [voiceMode, setVoiceMode] = useState(true);

    // Interview state
    const [phase, setPhase] = useState<Phase>("setup");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQuestions] = useState(6);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [report, setReport] = useState<InterviewReport | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Voice state
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [useTextInput, setUseTextInput] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const supabase = createClient();

    // Timer
    useEffect(() => {
        if (phase === "interview") {
            timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Load history
    useEffect(() => {
        async function loadHistory() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from("career_sessions")
                .select("*")
                .eq("user_id", user.id)
                .eq("title", "interview_simulation")
                .order("created_at", { ascending: false });
            if (data) {
                setHistory(data.map((d: any) => ({
                    id: d.id,
                    role: d.messages?.[0]?.role_title || "Unknown",
                    company: d.messages?.[0]?.company || "",
                    type: d.messages?.[0]?.interview_type || "Mixed",
                    score: d.messages?.[0]?.score || 0,
                    date: new Date(d.created_at).toLocaleDateString(),
                    voiceMode: d.messages?.[0]?.voice_mode || false,
                })));
            }
        }
        loadHistory();
    }, [supabase, phase]);

    // ─── TTS: Speak text aloud ───
    const speakText = useCallback(async (text: string) => {
        if (!voiceMode || useTextInput) return;
        setIsSpeaking(true);
        try {
            const res = await fetch("/api/sarvam/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (data.audio) {
                const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                audioRef.current = audio;
                audio.onended = () => setIsSpeaking(false);
                audio.onerror = () => setIsSpeaking(false);
                await audio.play();
            } else {
                setIsSpeaking(false);
            }
        } catch {
            setIsSpeaking(false);
        }
    }, [voiceMode, useTextInput]);

    // ─── STT: Record & Transcribe ───
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                setIsTranscribing(true);
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                const formData = new FormData();
                formData.append("file", audioBlob, "recording.webm");

                try {
                    const res = await fetch("/api/sarvam/stt", { method: "POST", body: formData });
                    const data = await res.json();
                    if (data.transcript) {
                        setInput(data.transcript);
                    }
                } catch {
                    console.error("Transcription failed");
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch {
            console.error("Microphone access denied");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    // ─── Start interview ───
    const startInterview = async () => {
        if (!role.trim()) return;
        setPhase("interview");
        setMessages([]);
        setQuestionNumber(0);
        setElapsedTime(0);
        setUseTextInput(!voiceMode);
        setIsLoading(true);

        try {
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `Start the interview. I am interviewing for the role of ${role}${company ? ` at ${company}` : ""}. This is a ${interviewType} interview.` }],
                    role, company, interviewType, totalQuestions,
                }),
            });
            const data = await res.json();
            const firstMsg: Message = { id: "intro", role: "assistant", content: data.content };
            setMessages([firstMsg]);
            setQuestionNumber(1);
            // Speak the first question
            if (voiceMode) speakText(data.content);
        } catch {
            setMessages([{ id: "err", role: "assistant", content: "Failed to start the interview. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Try parsing a report
    const tryParseReport = (content: string): InterviewReport | null => {
        try {
            const jsonString = content.replace(/```json\n?|\n?```/gi, "").trim();
            const parsed = JSON.parse(jsonString);
            if (parsed.completed && parsed.overallScore !== undefined) return parsed as InterviewReport;
        } catch { /* not JSON */ }
        return null;
    };

    // ─── Send answer ───
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Stop TTS if playing
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsSpeaking(false); }

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const payload = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: payload, role, company, interviewType, totalQuestions }),
            });
            const data = await res.json();

            const possibleReport = tryParseReport(data.content);
            if (possibleReport) {
                setReport(possibleReport);
                setPhase("report");
                if (timerRef.current) clearInterval(timerRef.current);
                saveToHistory(possibleReport);
            } else {
                const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.content };
                setMessages([...updatedMessages, aiMsg]);
                setQuestionNumber((q) => q + 1);
                if (voiceMode && !useTextInput) speakText(data.content);
            }
        } catch {
            setMessages((prev) => [...prev, { id: "err", role: "assistant", content: "Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveToHistory = async (r: InterviewReport) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("career_sessions").insert([{
            user_id: user.id,
            title: "interview_simulation",
            messages: [{ role_title: role, company, interview_type: interviewType, score: r.overallScore, voice_mode: voiceMode, report: r }],
        }]);
    };

    const resetToSetup = () => {
        setPhase("setup");
        setMessages([]);
        setReport(null);
        setQuestionNumber(0);
        setElapsedTime(0);
        setShowHistory(false);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };

    // ═══════════════════ SETUP SCREEN ═══════════════════
    if (phase === "setup") {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Simulator</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Practice with a realistic AI interviewer. Get scored and improve.
                    </p>
                </div>

                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-indigo-500" /> Configure Your Session
                        </CardTitle>
                        <CardDescription>Set up your mock interview parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="role">Target Role <span className="text-red-500">*</span></Label>
                            <Input id="role" placeholder="e.g. Senior Product Manager" value={role} onChange={(e) => setRole(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company <span className="text-zinc-400 text-xs">(optional)</span></Label>
                            <Input id="company" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Interview Type</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["Behavioral", "Technical", "Mixed"] as const).map((type) => (
                                    <button key={type} onClick={() => setInterviewType(type)} className={cn("py-3 px-4 rounded-xl text-sm font-medium border transition-all", interviewType === type ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-700")}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Voice Mode Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-colors", voiceMode ? "bg-indigo-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500")}>
                                    {voiceMode ? <Volume2 className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Voice Mode</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Powered by Sarvam AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setVoiceMode(!voiceMode)}
                                className={cn("relative inline-flex h-7 w-12 items-center rounded-full transition-colors", voiceMode ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600")}
                            >
                                <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform", voiceMode ? "translate-x-6" : "translate-x-1")} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>The interview includes <strong className="text-zinc-900 dark:text-zinc-100">{totalQuestions} questions</strong> and typically takes 10–15 minutes.</span>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg" disabled={!role.trim()} onClick={startInterview}>
                            <Play className="mr-2 h-4 w-4" /> Start Interview
                        </Button>
                    </CardContent>
                </Card>

                {/* History */}
                {history.length > 0 && (
                    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
                            <CardTitle className="flex items-center justify-between text-base">
                                <span className="flex items-center gap-2"><History className="h-4 w-4 text-zinc-500" /> Previous Sessions ({history.length})</span>
                                <ChevronRight className={cn("h-4 w-4 text-zinc-400 transition-transform", showHistory && "rotate-90")} />
                            </CardTitle>
                        </CardHeader>
                        {showHistory && (
                            <CardContent className="space-y-3 pt-0">
                                {history.map((h) => (
                                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                {h.role}{h.company ? ` @ ${h.company}` : ""}
                                                {h.voiceMode && <Mic className="h-3 w-3 text-indigo-500" />}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{h.type} · {h.date}</p>
                                        </div>
                                        <div className={cn("text-lg font-bold", h.score >= 8 ? "text-green-600" : h.score >= 6 ? "text-amber-600" : "text-red-500")}>
                                            {h.score}/10
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                )}
            </div>
        );
    }

    // ═══════════════════ REPORT SCREEN ═══════════════════
    if (phase === "report" && report) {
        const scoreColor = (s: number) => s >= 8 ? "text-green-600" : s >= 6 ? "text-amber-500" : "text-red-500";
        const scoreBg = (s: number) => s >= 8 ? "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20" : s >= 6 ? "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20" : "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20";

        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Interview Complete 🎉</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">{role}{company ? ` — ${company}` : ""} · {interviewType} · {formatTime(elapsedTime)}</p>
                    </div>
                    <Button variant="outline" onClick={resetToSetup}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                </div>

                {/* Overall Score + Summary */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card className={cn("sm:col-span-2 bg-gradient-to-br border-zinc-200 dark:border-zinc-800", scoreBg(report.overallScore))}>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Trophy className="h-5 w-5 text-indigo-500" /> Summary</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">{report.summary}</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center border-zinc-200 dark:border-zinc-800">
                        <div className="relative">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * report.overallScore) / 10} className={cn("transition-all duration-1000 ease-out", scoreColor(report.overallScore))} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold">{report.overallScore}</span>
                                <span className="text-xs text-zinc-500">/10</span>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-500 mt-2">Overall Score</span>
                    </Card>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                        { label: "Communication", key: "communication", icon: MessageSquare },
                        { label: "Relevance", key: "relevance", icon: Target },
                        { label: "Confidence", key: "confidence", icon: Shield },
                        { label: "Structure", key: "structure", icon: TrendingUp },
                    ] as const).map(({ label, key, icon: Icon }) => (
                        <Card key={key} className="border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4 text-center">
                                <Icon className="h-5 w-5 mx-auto mb-2 text-zinc-400" />
                                <p className={cn("text-2xl font-bold", scoreColor(report.scores[key]))}>{report.scores[key]}</p>
                                <p className="text-xs text-zinc-500 mt-1">{label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Answer Feedback */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader><CardTitle className="text-base">Answer-by-Answer Feedback</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {report.answerFeedback.map((fb, i) => (
                            <div key={i} className="p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Q{i + 1}: {fb.question}</p>
                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 block mb-1">✓ Strengths</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{fb.strengths}</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">△ To Improve</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{fb.improvements}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Top Improvements */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader><CardTitle className="text-base">🎯 Top Things to Improve</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {report.topImprovements.map((imp, i) => (
                                <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                    <span className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Sarvam credit */}
                {voiceMode && (
                    <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 pb-4">Voice powered by Sarvam AI</p>
                )}
            </div>
        );
    }

    // ═══════════════════ INTERVIEW SCREEN ═══════════════════
    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className={cn("absolute -inset-1 rounded-full blur opacity-20 transition-colors", isSpeaking ? "bg-gradient-to-r from-green-500 to-emerald-500 opacity-40 animate-pulse" : "bg-gradient-to-r from-indigo-500 to-purple-500")}></div>
                        <div className="relative h-10 w-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border-2 border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-base leading-tight">Interview — {role}</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{interviewType}{company ? ` · ${company}` : ""}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Voice/Text toggle */}
                    {voiceMode && (
                        <button onClick={() => setUseTextInput(!useTextInput)} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" title={useTextInput ? "Switch to voice" : "Switch to text"}>
                            {useTextInput ? <Keyboard className="h-4 w-4 text-zinc-600 dark:text-zinc-400" /> : <Mic className="h-4 w-4 text-indigo-600" />}
                        </button>
                    )}
                    <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {formatTime(elapsedTime)}
                    </div>
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                        Q {Math.min(questionNumber, totalQuestions)} / {totalQuestions}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-zinc-50/30 dark:bg-zinc-950/50">
                <div className="flex flex-col gap-6 pb-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex max-w-[85%] gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300", message.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                            <div className="flex-shrink-0 mt-1">
                                {message.role === "assistant" ? (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                        <BrainCircuit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm">
                                        <User className="h-4 w-4 text-white dark:text-zinc-900" />
                                    </div>
                                )}
                            </div>
                            <div className={cn("rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-sm", message.role === "user" ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50")}>
                                {message.content}
                            </div>
                        </div>
                    ))}

                    {/* Speaking indicator */}
                    {isSpeaking && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 animate-pulse pl-12">
                            <Volume2 className="h-3.5 w-3.5" /> Speaking...
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex max-w-[85%] gap-4 animate-in fade-in">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                    <BrainCircuit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <div className="rounded-2xl px-5 py-3.5 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-2 h-[52px] shadow-sm">
                                <span className="text-xs text-zinc-500 mr-1">Thinking</span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"></span>
                            </div>
                        </div>
                    )}

                    {/* Transcribing indicator */}
                    {isTranscribing && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 animate-pulse ml-auto pr-4">
                            <Mic className="h-3.5 w-3.5" /> Transcribing your answer...
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
                {/* Voice input mode */}
                {voiceMode && !useTextInput ? (
                    <div className="flex flex-col items-center gap-3">
                        {input && (
                            <div className="w-full max-w-3xl mx-auto p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
                                {input}
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isLoading || isTranscribing || isSpeaking}
                                className={cn(
                                    "relative h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50",
                                    isRecording
                                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                )}
                            >
                                {isRecording && <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />}
                                {isRecording ? <MicOff className="h-6 w-6 relative z-10" /> : <Mic className="h-6 w-6" />}
                            </button>
                            {input && (
                                <Button onClick={handleSend} disabled={isLoading || isTranscribing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12">
                                    <Send className="h-4 w-4 mr-2" /> Submit Answer
                                </Button>
                            )}
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                            {isRecording ? "Listening... tap to stop" : isSpeaking ? "AI is speaking..." : "Tap the mic to answer"}
                            <span className="mx-2">·</span>
                            Powered by Sarvam AI
                        </p>
                    </div>
                ) : (
                    /* Text input mode */
                    <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." className="pr-14 py-7 md:text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-indigo-500/30 placeholder:text-zinc-400 shadow-sm" disabled={isLoading} />
                        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="absolute right-2 rounded-xl h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
