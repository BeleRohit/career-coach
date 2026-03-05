import { Sidebar } from "@/components/layout/Sidebar";
import { getUserSession } from "@/lib/supabase/get-session";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUserSession();

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar
                    userEmail={user?.email || "User"}
                    userName={user?.user_metadata?.full_name || ""}
                />
            </div>

            {/* Main content area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white dark:bg-zinc-950">
                <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
