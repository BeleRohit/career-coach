"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh(); // Refresh to apply middleware session
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-center mb-6">
                    <Button variant="ghost" size="sm" asChild className="text-zinc-500">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>
                    </Button>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in zoom-in-95 duration-500 delay-150">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-sm border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="dark:bg-zinc-950"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="dark:bg-zinc-950"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-100 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
