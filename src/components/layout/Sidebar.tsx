"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, BrainCircuit, Target, Map, BookOpen, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Career Coach", href: "/chat", icon: BrainCircuit },
    { name: "Skill Gap", href: "/analyzer", icon: Target },
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Settings", href: "/profile", icon: Settings },
];

export function Sidebar({ userEmail, userName }: { userEmail: string, userName?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const displayName = userName || (userEmail ? userEmail.split("@")[0] : "User");

    return (
        <div className="flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-[100dvh]">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                <Link href="/" className="flex items-center gap-2 group">
                    <Compass className="h-6 w-6 text-zinc-900 dark:text-zinc-100 group-hover:rotate-12 transition-transform" />
                    <span className="font-semibold text-lg tracking-tight">AI Career</span>
                </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-4 py-6 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-50"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "flex-shrink-0 h-5 w-5 transition-colors",
                                    isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 mb-4"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                                {displayName[0]}
                            </span>
                        </div>
                        <div className="flex flex-col max-w-[120px]">
                            <span className="text-sm font-medium leading-none truncate" title={displayName}>{displayName}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Free Plan</span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}
