"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Target, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AnalysisResult = {
    missing_skills: string[];
    recommended_technologies: string[];
    suggested_resources: { title: string; url: string; type: string }[];
};

export default function AnalyzerPage() {
    const [targetRole, setTargetRole] = useState("");
    const [currentSkills, setCurrentSkills] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const supabase = createClient();

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole || !currentSkills || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetRole, currentSkills }),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze skills");
            }

            const data = await response.json();
            setResult(data);

            // Save to database
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("roadmaps").insert([{
                    user_id: user.id,
                    target_role: targetRole,
                    roadmap_data: { type: "analyzer", ...data },
                }]);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to analyze skills. Please ensure your Groq API key is valid.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Target className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                    Skill Gap Analyzer
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                    Discover exactly what you need to learn to land your target role.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Enter your current skills and where you want to go.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAnalyze} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="targetRole" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Target Role
                                </label>
                                <Input
                                    id="targetRole"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-900"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="currentSkills" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Current Skills
                                </label>
                                <Textarea
                                    id="currentSkills"
                                    placeholder="e.g. React, JavaScript, HTML, CSS, basic Node.js..."
                                    value={currentSkills}
                                    onChange={(e) => setCurrentSkills(e.target.value)}
                                    className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={!targetRole || !currentSkills || isLoading}>
                                {isLoading ? "Analyzing Profile..." : "Analyze Skill Gaps"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {!result && !isLoading && (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                            <Target className="h-10 w-10 text-zinc-400 mb-4" />
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Ready to analyze your skills</p>
                            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Fill out the form to see your tailored learning recommendations.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm animate-pulse">
                            <div className="h-10 w-10 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mb-4 dark:border-zinc-800 dark:border-t-zinc-100"></div>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Our AI is analyzing industry requirements for this role...</p>
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="shadow-sm border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-orange-500" />
                                        Missing Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {result.missing_skills.map((skill, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                        Recommended Technologies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.recommended_technologies.map((tech, idx) => (
                                            <span key={idx} className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Suggested Resources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {result.suggested_resources.map((resource, idx) => (
                                            <li key={idx} className="flex items-start justify-between gap-4 text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{resource.title}</p>
                                                    <p className="text-xs text-zinc-500 capitalize">{resource.type}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 shadow-none" asChild>
                                                    <a href={resource.url} target="_blank" rel="noreferrer">View</a>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
