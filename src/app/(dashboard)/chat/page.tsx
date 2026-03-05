"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Message = {
    id: string;
    role: "assistant" | "user";
    content: string;
};

const INITIAL_MESSAGE: Message = {
    id: "initial-coach-msg",
    role: "assistant",
    content: "Hi! I'm your AI Career Coach. Tell me a bit about your current situation, interests, and where you'd like to go in your career. We can explore potential paths together.",
};

const PROMPT_CHIPS = [
    "Help me update my resume",
    "I want to switch careers",
    "What skills should I learn next?",
    "Prepare me for an interview."
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Fetch existing session on load
    useEffect(() => {
        async function fetchSession() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if user already has an active session
            const { data: sessionData, error } = await supabase
                .from("career_sessions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (sessionData && sessionData.messages.length > 0) {
                setSessionId(sessionData.id);
                setMessages(sessionData.messages as Message[]);
            } else if (!error || error.code === 'PGRST116') {
                // If no session exists, create a new one to save future messages
                const { data: newSession } = await supabase
                    .from("career_sessions")
                    .insert([{ user_id: user.id, messages: [INITIAL_MESSAGE], title: "Career Exploration" }])
                    .select()
                    .single();

                if (newSession) {
                    setSessionId(newSession.id);
                }
            }
        }
        fetchSession();
    }, [supabase]);

    const saveMessagesToDB = async (updatedMessages: Message[], currentSessionId: string | null) => {
        if (!currentSessionId) return;
        await supabase
            .from("career_sessions")
            .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
            .eq("id", currentSessionId);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add user message immediately
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessagesWithUser = [...messages, userMsg];
        setMessages(updatedMessagesWithUser);
        setInput("");
        setIsLoading(true);
        saveMessagesToDB(updatedMessagesWithUser, sessionId);

        try {
            // Create message payload including the new user message
            const messagesPayload = updatedMessagesWithUser.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: messagesPayload }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            const assistantMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: data.content,
            };
            const finalMessages = [...updatedMessagesWithUser, assistantMsg];
            setMessages(finalMessages);
            saveMessagesToDB(finalMessages, sessionId);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: "I'm sorry, I encountered an error while processing your request. Please check your API keys and try again.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                        <div className="relative h-12 w-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border-2 border-zinc-50 dark:border-zinc-800 shadow-sm">
                            <BrainCircuit className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">AI Career Coach</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Ask me anything about goals, interviews, salaries, or career pivots.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                <div className="flex flex-col gap-6 pb-4 md:p-4">
                    <div className="flex items-center py-4 opacity-70">
                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                            New conversation • Today
                        </span>
                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                    </div>

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex max-w-[85%] gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300",
                                message.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {message.role === "assistant" ? (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm shrink-0">
                                        <BrainCircuit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
                                        <User className="h-4 w-4 text-white dark:text-zinc-900" />
                                    </div>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-sm",
                                    message.role === "user"
                                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                                        : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
                                )}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}

                    {messages.length === 1 && !isLoading && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-12 animate-in fade-in duration-700">
                            {PROMPT_CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => setInput(chip)}
                                    className="text-sm px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-800/50 transition-all text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-left shadow-sm active:scale-95"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex max-w-[85%] gap-4 animate-in fade-in">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm shrink-0">
                                    <BrainCircuit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <div className="rounded-2xl px-5 py-3.5 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-1.5 h-[52px] shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <div className="p-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 relative z-10 transition-all">
                <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What's on your mind career-wise?"
                        className="pr-14 py-7 md:text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-indigo-500/30 dark:focus-visible:ring-indigo-500/30 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 rounded-xl h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm"
                    >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <p className="text-center text-xs text-zinc-500 mt-3 font-medium max-w-3xl mx-auto">
                    AI Career Coach can make mistakes. Consider verifying important career decisions.
                </p>
            </div>
        </div>
    );
}
