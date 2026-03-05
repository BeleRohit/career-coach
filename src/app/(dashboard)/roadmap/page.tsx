"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Map, CheckCircle2, Circle, Clock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type RoadmapItem = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    type: "skill" | "project";
};

type RoadmapPhase = {
    duration: string;
    items: RoadmapItem[];
};

export default function RoadmapPage() {
    const [hasRoadmap, setHasRoadmap] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [roadmapData, setRoadmapData] = useState<Record<string, RoadmapPhase> | null>(null);
    const [inputRole, setInputRole] = useState("");
    const [inputSkills, setInputSkills] = useState("");
    const [roadmapRole, setRoadmapRole] = useState("");
    const [roadmapId, setRoadmapId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    // Fetch latest generated roadmap on mount
    useState(() => {
        async function fetchRoadmap() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("roadmaps")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data && data.roadmap_data && data.roadmap_data.type !== "analyzer") {
                setRoadmapData(data.roadmap_data as Record<string, RoadmapPhase>);
                setRoadmapRole(data.target_role);
                setRoadmapId(data.id);
                setHasRoadmap(true);
            }
        }
        fetchRoadmap();
    });

    const calculateProgress = (items: RoadmapItem[]) => {
        if (!items || items.length === 0) return 0;
        const completed = items.filter((i) => i.completed).length;
        return Math.round((completed / items.length) * 100);
    };

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputRole || !inputSkills) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetRole: inputRole,
                    currentSkills: inputSkills
                }),
            });
            if (!response.ok) throw new Error("Failed to generate roadmap");
            const data = await response.json();
            setRoadmapData(data);
            setRoadmapRole(inputRole);
            setHasRoadmap(true);

            // Save new roadmap to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: insertedData, error: insertError } = await supabase.from("roadmaps").insert([{
                    user_id: user.id,
                    target_role: inputRole,
                    roadmap_data: data,
                }]).select().single();

                if (insertError) {
                    console.error("Error saving roadmap to Supabase:", insertError);
                }

                if (insertedData) {
                    setRoadmapId(insertedData.id);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate roadmap. Please check your Groq API key.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleItemCompletion = async (phaseKey: string, itemId: string) => {
        if (!roadmapData || !roadmapId) return;

        // Create a deep copy to mutate safely
        const updatedData = JSON.parse(JSON.stringify(roadmapData)) as Record<string, RoadmapPhase>;

        if (updatedData[phaseKey] && updatedData[phaseKey].items) {
            const item = updatedData[phaseKey].items.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                setRoadmapData(updatedData);

                // Persist the updated data to Supabase
                const { error: updateError } = await supabase
                    .from("roadmaps")
                    .update({ roadmap_data: updatedData })
                    .eq("id", roadmapId);

                if (updateError) {
                    console.error("Supabase update error:", updateError);
                    alert("Failed to save progress offline. Note: Progress changes might not persist.");
                }

                // Notify Next.js router to clear cache and refresh server components on next navigation
                router.refresh();
            }
        }
    };

    if (!hasRoadmap || !roadmapData) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Map className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                        Learning Roadmap
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                        Generate a personalized, step-by-step career plan.
                    </p>
                </div>
                <Card className="shadow-sm border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center py-12">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mb-4 dark:border-zinc-800 dark:border-t-zinc-100"></div>
                                <p className="text-zinc-500 font-medium">AI is crafting your roadmap...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleGenerate} className="flex flex-col items-center w-full max-w-md">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                                    <Map className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Build Your Roadmap</h3>
                                <p className="text-zinc-500 mb-6 w-full">
                                    Tell us where you want to go and what you already know.
                                </p>

                                <div className="w-full space-y-4 text-left">
                                    <div className="space-y-2">
                                        <label htmlFor="role" className="text-sm font-medium">Target Role</label>
                                        <Input
                                            id="role"
                                            placeholder="e.g. Data Scientist"
                                            value={inputRole}
                                            onChange={(e) => setInputRole(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="skills" className="text-sm font-medium">Current Skills</label>
                                        <Textarea
                                            id="skills"
                                            placeholder="e.g. Python, basic SQL..."
                                            value={inputSkills}
                                            onChange={(e) => setInputSkills(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="mt-6 w-full" size="lg" disabled={!inputRole || !inputSkills}>
                                    Generate New Roadmap
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Map className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                        {roadmapRole} Roadmap
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                        Your tailored progressive learning plan for the next 12 months.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setHasRoadmap(false)}>
                    Regenerate
                </Button>
            </div>

            <Tabs defaultValue="3-months" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                    <TabsTrigger value="3-months" className="text-base rounded-md">3 Months</TabsTrigger>
                    <TabsTrigger value="6-months" className="text-base rounded-md">6 Months</TabsTrigger>
                    <TabsTrigger value="12-months" className="text-base rounded-md">12 Months</TabsTrigger>
                </TabsList>

                <TabsContent value="3-months" className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    {roadmapData.months_3 && <PhaseView phaseKey="months_3" phase={roadmapData.months_3} title="Foundation & Frameworks" />}
                </TabsContent>

                <TabsContent value="6-months" className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    {roadmapData.months_6 && <PhaseView phaseKey="months_6" phase={roadmapData.months_6} title="Full-Stack & Databases" />}
                </TabsContent>

                <TabsContent value="12-months" className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    {roadmapData.months_12 && <PhaseView phaseKey="months_12" phase={roadmapData.months_12} title="Architecture & Scale" />}
                </TabsContent>
            </Tabs>
        </div>
    );

    function PhaseView({ phaseKey, phase, title }: { phaseKey: string; phase: RoadmapPhase; title: string }) {
        const progress = calculateProgress(phase.items);

        return (
            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 pb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 flex items-center gap-1.5 mb-1">
                                <Clock className="h-4 w-4" /> {phase.duration}
                            </p>
                            <CardTitle className="text-2xl">{title}</CardTitle>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Phase Progress</span>
                            <span className="text-zinc-500 font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {phase.items && phase.items.map((item, idx) => (
                            <div
                                key={item.id || idx}
                                className={cn(
                                    "flex gap-4 p-4 rounded-xl border transition-colors relative overflow-hidden group",
                                    item.completed
                                        ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                            >
                                {/* Visual completion indication line */}
                                {item.completed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100"></div>}

                                <div className="flex-shrink-0 mt-0.5">
                                    <button
                                        onClick={() => toggleItemCompletion(phaseKey, item.id || idx.toString())}
                                        className="focus:outline-none rounded-full focus-visible:ring-2 ring-zinc-900 ring-offset-1 transition-all"
                                    >
                                        {item.completed ? (
                                            <CheckCircle2 className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400 dark:hover:text-zinc-600" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={cn(
                                            "font-semibold text-lg",
                                            item.completed ? "text-zinc-500 line-through dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"
                                        )}>
                                            {item.title}
                                        </h4>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
                                            item.type === "project"
                                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                        )}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm leading-relaxed",
                                        item.completed ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        {item.description}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
}
