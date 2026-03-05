import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrainCircuit, BookOpen, Target, ArrowRight, Map, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fullName = user?.user_metadata?.full_name;
    const firstName = fullName ? fullName.split(' ')[0] : (user?.email?.split('@')[0] || "there");

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
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, <span className="capitalize">{firstName}</span></h1>
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
                        {roadmapsCount !== null && roadmapsCount > 0 ? (
                            <>
                                <div className="text-2xl font-bold">{roadmapsCount}</div>
                                <p className="text-xs text-zinc-500 truncate">{latestRoadmap ? `${fallbackRole} track` : "Active track"}</p>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-1">
                                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">0</div>
                                <Link href="/roadmap" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center">
                                    Start your first roadmap <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                        <BookOpen className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {journalCount !== null && journalCount > 0 ? (
                            <>
                                <div className="text-2xl font-bold">{journalCount}</div>
                                <p className="text-xs text-zinc-500">
                                    {latestJournal ? `Last entry: ${formatDistanceToNow(new Date(latestJournal.created_at), { addSuffix: true })}` : "No entries yet"}
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-1">
                                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">0</div>
                                <Link href="/journal" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center">
                                    Write your first reflection <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coach Sessions</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {coachSessionsCount !== null && coachSessionsCount > 0 ? (
                            <>
                                <div className="text-2xl font-bold">{coachSessionsCount}</div>
                                <p className="text-xs text-zinc-500">Total insights saved</p>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-1">
                                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">0</div>
                                <Link href="/chat" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center">
                                    Begin coaching session <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle>Current Roadmap</CardTitle>
                        <CardDescription>{latestRoadmap ? `Your progress towards becoming a ${fallbackRole}.` : "No roadmap created yet."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
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
                            <div className="text-center py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                <Map className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 mt-2">Build your first roadmap in 2 minutes</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[280px]">
                                    Get a personalized, step-by-step career plan tailored to your exact skills and goals.
                                </p>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto" asChild>
                                    <Link href="/roadmap">Generate Roadmap Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </div>
                        )}
                        {latestRoadmap && (
                            <Button variant="outline" className="w-full mt-4" asChild>
                                <Link href="/roadmap">View Full Roadmap <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Explore Tools</CardTitle>
                        <CardDescription>Everything you need to advance</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/roadmap">
                                <Map className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start font-normal">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Learning Roadmaps</span>
                                    <span className="text-xs text-zinc-500">Track and generate plans</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/chat">
                                <BrainCircuit className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start font-normal">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Talk to Coach</span>
                                    <span className="text-xs text-zinc-500">Get 1-on-1 career advice</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/analyzer">
                                <Target className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start font-normal">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Analyze Skills</span>
                                    <span className="text-xs text-zinc-500">Find and close skill gaps</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/resume">
                                <FileText className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start font-normal">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Resume Analyzer</span>
                                    <span className="text-xs text-zinc-500">Get AI resume feedback</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4" asChild>
                            <Link href="/journal">
                                <BookOpen className="mr-3 h-5 w-5 text-zinc-500" />
                                <div className="flex flex-col items-start font-normal">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Write Reflection</span>
                                    <span className="text-xs text-zinc-500">Log progress & thoughts</span>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
