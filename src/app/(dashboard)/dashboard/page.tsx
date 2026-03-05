import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrainCircuit, BookOpen, Target, ArrowRight, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch counts and data from Supabase using concurrent requests
    const [
        { count: roadmapsCount, data: roadmapsData },
        { count: journalCount, data: journalsData },
        { count: coachSessionsCount }
    ] = await Promise.all([
        supabase.from("roadmaps").select("*", { count: "exact" }).eq("user_id", user?.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("journal_entries").select("created_at", { count: "exact" }).eq("user_id", user?.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("career_sessions").select("*", { count: "exact", head: true }).eq("user_id", user?.id)
    ]);

    const latestRoadmap = roadmapsData?.[0] || null;
    const latestJournal = journalsData?.[0] || null;

    let activePhaseData = null;
    let fallbackRole = "No active roadmap";
    let progressPercentage = 0;

    if (latestRoadmap && latestRoadmap.roadmap_data) {
        fallbackRole = latestRoadmap.target_role || "Frontend Engineer";
        const rd = latestRoadmap.roadmap_data;
        // Determine the first phase that is not 100% complete, or just fallback to the first phase
        const phases = [rd.months_3, rd.months_6, rd.months_12].filter(Boolean);

        let totalItems = 0;
        let completedItems = 0;

        for (const phase of phases) {
            if (phase.items) {
                totalItems += phase.items.length;
                completedItems += phase.items.filter((i: any) => i.completed).length;
                if (!activePhaseData && phase.items.some((i: any) => !i.completed)) {
                    activePhaseData = {
                        name: phase.duration,
                        completed: phase.items.filter((i: any) => i.completed).length,
                        total: phase.items.length
                    };
                }
            }
        }

        if (!activePhaseData && phases.length > 0) {
            activePhaseData = {
                name: "Completed",
                completed: 1,
                total: 1
            };
        }

        if (totalItems > 0) {
            progressPercentage = Math.round((completedItems / totalItems) * 100);
        }
    }
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Here is an overview of your career progress.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
                        <Target className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roadmapsCount || 0}</div>
                        <p className="text-xs text-zinc-500 truncate">{latestRoadmap ? `${fallbackRole} track` : "No active track"}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                        <BookOpen className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{journalCount || 0}</div>
                        <p className="text-xs text-zinc-500">
                            {latestJournal ? `Last entry: ${formatDistanceToNow(new Date(latestJournal.created_at), { addSuffix: true })}` : "No entries yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coach Sessions</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coachSessionsCount || 0}</div>
                        <p className="text-xs text-zinc-500">Total insights saved</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Current Roadmap</CardTitle>
                        <CardDescription>Your progress towards becoming a {latestRoadmap ? fallbackRole : "professional"}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {latestRoadmap ? (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Total Progress</span>
                                        <span className="text-zinc-500">{progressPercentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                                {activePhaseData && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Current Phase ({activePhaseData.name})</span>
                                            <span className="text-zinc-500">{activePhaseData.completed} / {activePhaseData.total}</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-zinc-400 dark:bg-zinc-500 rounded-full opacity-50" style={{ width: `${(activePhaseData.completed / activePhaseData.total) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 text-zinc-500">
                                <Map className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                                <p>You haven't generated a roadmap yet.</p>
                            </div>
                        )}
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/roadmap">View Full Roadmap <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Continue your career journey</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/chat">
                                <BrainCircuit className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Talk to Coach</span>
                                    <span className="text-xs text-zinc-500">Get career advice</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/analyzer">
                                <Target className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Analyze Skills</span>
                                    <span className="text-xs text-zinc-500">Find skill gaps</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/journal">
                                <BookOpen className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Write Reflection</span>
                                    <span className="text-xs text-zinc-500">Log your progress</span>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
