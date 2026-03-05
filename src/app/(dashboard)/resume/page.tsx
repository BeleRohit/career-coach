"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, TrendingUp, X, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type AnalysisResult = {
    gaps: string[];
    weakPhrasing: { original: string; improved: string }[];
    missingKeywords: string[];
    overallScore: number;
    summary: string;
};

export default function ResumeAnalyzerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [targetRole, setTargetRole] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setError(null);
        } else {
            setError("Please select a valid PDF file.");
            setFile(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type === "application/pdf") {
            setFile(dropped);
            setError(null);
        } else {
            setError("Only PDF files are supported.");
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const analyzeResume = async () => {
        if (!file || !targetRole.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("targetRole", targetRole);

            const res = await fetch("/api/resume", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to analyze resume.");
            }

            setResult(data.analysis);
        } catch (err: any) {
            setError(err.message || "Something went wrong during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Upload your resume and enter a target role to get instant, AI-powered feedback on gaps, phrasing, and missing keywords.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* UPOLAD & INPUT SECTION */}
                <div className={cn("space-y-6 transition-all duration-500", result ? "lg:col-span-4" : "lg:col-span-12 max-w-2xl mx-auto w-full")}>
                    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Analysis Settings</CardTitle>
                            <CardDescription>Upload your PDF and define your goal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="targetRole">Target Role</Label>
                                <Input
                                    id="targetRole"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    disabled={isAnalyzing}
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Resume Document</Label>
                                {!file ? (
                                    <div
                                        onClick={triggerFileSelect}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className="mt-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Click to upload or drag & drop</p>
                                        <p className="text-sm text-zinc-500">PDF up to 5MB</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="application/pdf"
                                            className="hidden"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                                                <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            disabled={isAnalyzing}
                                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm flex items-start gap-2 border border-red-100 dark:border-red-500/20">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                size="lg"
                                disabled={!file || !targetRole.trim() || isAnalyzing}
                                onClick={analyzeResume}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <BrainCircuit className="mr-2 h-4 w-4 animate-pulse" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate AI Feedback
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RESULTS SECTION */}
                {result && (
                    <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                        {/* Summary & Score */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Card className="sm:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-indigo-100 dark:border-zinc-800">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <BrainCircuit className="h-5 w-5 text-indigo-500" /> Analyst Summary
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                                        {result.summary}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col items-center justify-center p-6 text-center border-zinc-200 dark:border-zinc-800">
                                <div className="relative">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                                        <circle
                                            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * result.overallScore) / 100}
                                            className={cn(
                                                "transition-all duration-1000 ease-out",
                                                result.overallScore >= 80 ? "text-green-500" : result.overallScore >= 60 ? "text-amber-500" : "text-red-500"
                                            )}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold">{result.overallScore}</span>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-zinc-500 mt-2">ATS Match Score</span>
                            </Card>
                        </div>

                        {/* Keyword Matches */}
                        <Card className="border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-3 flex flex-row items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Target className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Missing Keywords</CardTitle>
                                    <CardDescription>Terms expected for a {targetRole}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords.length > 0 ? (
                                        result.missingKeywords.map((kw, i) => (
                                            <span key={i} className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                                                {kw}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Your keyword coverage looks great!
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Experience Gaps */}
                        <Card className="border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-3 flex flex-row items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Critical Gaps Detected</CardTitle>
                                    <CardDescription>Areas where your experience falls short</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {result.gaps.length > 0 ? (
                                        result.gaps.map((gap, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                                                {gap}
                                            </li>
                                        ))
                                    ) : (
                                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> No major experience gaps detected!
                                        </span>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Phrasing Improvements */}
                        <Card className="border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-3 flex flex-row items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Impact & Phrasing Improvements</CardTitle>
                                    <CardDescription>Rewrite bullet points to show quantifiable impact</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {result.weakPhrasing.length > 0 ? (
                                        result.weakPhrasing.map((phrase, i) => (
                                            <div key={i} className="grid md:grid-cols-2 gap-3 text-sm">
                                                <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 block mb-1">Current (Weak)</span>
                                                    <span className="text-zinc-700 dark:text-zinc-300">"{phrase.original}"</span>
                                                </div>
                                                <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 relative">
                                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 block mb-1">Suggested (Strong)</span>
                                                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">"{phrase.improved}"</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Your phrasing is strong and quantified.
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                )}
            </div>
        </div>
    );
}

