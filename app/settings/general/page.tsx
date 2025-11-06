"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId] = useState<string | null>(searchParams?.get("userId") ?? null);

    const { theme, setTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise((res) => setTimeout(res, 1000)); // simulate delay

            // Save to local storage (you can later integrate API persistence)
            localStorage.setItem("theme", theme);

            toast.success("Theme saved successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save theme");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar userId={userId} />
            <SidebarInset>
                {/* Header & Breadcrumb */}
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                        Home
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>General</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="px-4 py-6">
                    <Card className="mx-auto">
                        <CardHeader>
                            <CardTitle>Theme Settings</CardTitle>
                            <CardDescription>Choose your preferred theme for the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={theme}
                                onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
                                className="flex flex-row items-center space-x-6"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="light" id="light" />
                                    <label htmlFor="light">Light Mode</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="dark" id="dark" />
                                    <label htmlFor="dark">Dark Mode</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="system" id="system" />
                                    <label htmlFor="system">System Default</label>
                                </div>
                            </RadioGroup>


                            <Button
                                onClick={handleSave}
                                className="mt-4 px-6 py-2 flex items-center gap-2"
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
