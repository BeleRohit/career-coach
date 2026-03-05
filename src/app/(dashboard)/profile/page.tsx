"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Settings, User, Bell, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    useState(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                setName(user.user_metadata?.full_name || "User");
            }
        }
        fetchProfile();
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await supabase.auth.updateUser({
                data: { full_name: name }
            });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                    Profile Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                    Manage your account preferences and personal information.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
                <aside className="md:col-span-1 space-y-1">
                    <Button variant="ghost" className="w-full justify-start bg-zinc-100 dark:bg-zinc-900 font-medium">
                        <User className="mr-2 h-4 w-4" />
                        Account
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => alert("Notifications preferences coming soon!")}>
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => alert("Privacy controls coming soon!")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Privacy
                    </Button>
                </aside>

                <div className="md:col-span-3 space-y-6">
                    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your photo and personal details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-semibold text-zinc-500 overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 capitalize">
                                        {name ? name[0] : "U"}
                                    </div>
                                    <Button variant="outline" type="button">Change Avatar</Button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-900"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving Changes..." : "Save Changes"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-red-200 dark:border-red-900/50">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                            <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2">
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                                Delete Account
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="pt-4">
                        <Button variant="outline" className="text-zinc-600 dark:text-zinc-400">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
