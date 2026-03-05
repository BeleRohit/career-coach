"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Sparkles, Calendar, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type JournalEntry = {
    id: string;
    title: string;
    content: string;
    date: string;
    tags: string[];
    ai_summary?: string;
};

export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    useState(() => {
        async function fetchEntries() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("journal_entries")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                setEntries(data.map(d => ({
                    id: d.id,
                    title: d.title,
                    content: d.content,
                    date: d.created_at,
                    tags: d.tags || [],
                    ai_summary: d.ai_summary,
                })));
            }
        }
        fetchEntries();
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newContent || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const aiInsight = "You're consistently reflecting on your progress. This new entry highlights your focus on continual improvement. Keep it up!"; // Would be replaced by actual LLM call in future iteration

            const { data, error } = await supabase.from("journal_entries").insert([{
                user_id: user.id,
                title: newTitle,
                content: newContent,
                tags: ["reflection"],
                ai_summary: aiInsight,
            }]).select().single();

            if (error) throw error;

            if (data) {
                setEntries([{
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    date: data.created_at,
                    tags: data.tags,
                    ai_summary: data.ai_summary,
                }, ...entries]);

                setNewTitle("");
                setNewContent("");
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save journal entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                        Career Journal
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                        Document your learning journey, reflections, and insights.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px] bg-white dark:bg-zinc-950">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>Create Journal Entry</DialogTitle>
                                <DialogDescription>
                                    Write down your thoughts, achievements, or what you learned today. Our AI will analyze patterns over time.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Mastered CSS Grid today"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="content" className="text-sm font-medium">Reflection</label>
                                    <Textarea
                                        id="content"
                                        placeholder="What did you work on? What challenges did you face?"
                                        className="min-h-[150px]"
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={!newTitle || !newContent || isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Entry"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {entries.map((entry) => (
                    <Card key={entry.id} className="shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden group">
                        <CardHeader className="pb-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl leading-tight mb-2">{entry.title}</CardTitle>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(entry.date)}
                                        </span>
                                        <div className="flex gap-2">
                                            {entry.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-200/50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {entry.content}
                            </p>
                        </CardContent>

                        {entry.ai_summary && (
                            <CardFooter className="bg-purple-50/50 dark:bg-purple-950/20 border-t border-purple-100 dark:border-purple-900/40 p-4 mx-4 mb-4 mt-2 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 h-6 w-6 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-700 dark:text-purple-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-1">AI Mentor Insight</p>
                                        <p className="text-sm text-purple-800 dark:text-purple-400 leading-relaxed">{entry.ai_summary}</p>
                                    </div>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                ))}

                {entries.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <BookOpen className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No journal entries yet</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-2">
                            Start writing down your thoughts, progress, and reflections to get AI-powered insights on your journey.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-6">
                            Create your first entry
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
