"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${firstName} ${lastName}`.trim(),
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-4">
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Check your email</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        We sent a verification link to <span className="font-medium text-zinc-900 dark:text-zinc-200">{email}</span>. Please click the link to verify your account and sign in.
                    </p>
                    <Button asChild variant="outline" className="mt-4 w-full">
                        <Link href="/login">Return to login</Link>
                    </Button>
                </div>
            </div>
        );
    }

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
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in zoom-in-95 duration-500 delay-150">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-sm border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    First name
                                </label>
                                <div className="mt-1">
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="dark:bg-zinc-950"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Last name
                                </label>
                                <div className="mt-1">
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="dark:bg-zinc-950"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

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
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
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
                                Sign up
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
