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
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <BrainCircuit className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h2 className="font-semibold">AI Career Coach</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Always available to mentor you</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                <div className="flex flex-col gap-6 pb-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex max-w-[85%] gap-4",
                                message.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {message.role === "assistant" ? (
                                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                        <BrainCircuit className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white dark:text-zinc-900" />
                                    </div>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed",
                                    message.role === "user"
                                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                                        : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
                                )}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex max-w-[85%] gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                    <BrainCircuit className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                                </div>
                            </div>
                            <div className="rounded-2xl px-5 py-3.5 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-1.5 h-[52px]">
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="pr-12 py-6 rounded-full border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 placeholder:text-zinc-500"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1.5 rounded-full h-9 w-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <p className="text-center text-[11px] text-zinc-500 mt-3 font-medium">
                    AI Career Coach can make mistakes. Consider verifying important career decisions.
                </p>
            </div>
        </div>
    );
}
