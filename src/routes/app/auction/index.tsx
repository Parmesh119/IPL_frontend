import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Trophy, Hammer, Users } from "lucide-react";
import { useTheme } from '@/components/theme-provider';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getPlayersForAuction } from "@/lib/actions";

export const Route = createFileRoute('/app/auction/')({
    component: AuctionRoute,
});

function AuctionRoute() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [auctionStarted, setAuctionStarted] = useState(false);
    const effectRan = useRef(false); // Ref to track if the effect has already run

    useEffect(() => {
        // Ensure the effect runs only once
        if (effectRan.current) return;

        const auctionStatus = localStorage.getItem('iplAuctionStarted');
        if (auctionStatus === 'true') {
            setAuctionStarted(true);
            navigate({ to: "/app/auction/players/get" });
        }

        effectRan.current = true; // Mark the effect as run

        // Cleanup function to reset the ref when the component unmounts
        return () => {
            effectRan.current = false;
        };
    }, [navigate]);

    const handleStartAuction = async () => {
        setIsLoading(true);
        try {
            await getPlayersForAuction();
            localStorage.setItem('iplAuctionStarted', 'true');
            setAuctionStarted(true);
            navigate({ to: "/app/auction/players/get" });
        } catch (err) {
            setError("Failed to start auction");
            console.error("Auction start error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarInset className="w-full">
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList className='tracking-wider'>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Auction</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Overview</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <Separator className="mb-4" />
            <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
                <div className={`w-full max-w-2xl border ${theme === "dark" ? "bg-gray-800" : "bg-card/120 border-border"} rounded-xl p-10 text-center shadow-xl dark:shadow-2xl`}>
                    <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        IPL Auction
                    </h1>
                    <p className="text-lg text-muted-foreground mt-3">
                        Conduct a virtual IPL-style auction with your teammates. Manage bids, assign players, and track results seamlessly.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleStartAuction}
                            disabled={isLoading}
                            className="cursor-pointer px-6 py-3 text-lg w-full sm:w-auto flex items-center gap-2"
                        >
                            {isLoading ? "Loading..." : (
                                <>
                                    <Hammer className="w-5 h-5" />
                                    Start Auction
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => navigate({ to: "/app/team" })}
                            variant="outline"
                            className={`border cursor-pointer ${theme !== "dark" ? undefined : "border-white"} px-6 py-3 text-lg w-full sm:w-auto flex items-center gap-2`}
                        >
                            <Users className="w-5 h-5" />
                            View Teams
                        </Button>
                    </div>

                    {error && (
                        <p className="mt-4 text-sm text-red-500">{error}</p>
                    )}
                </div>
            </div>
        </SidebarInset>
    );
}