import { useState, useEffect } from "react";
import type { Auction } from "@/schemas/auction";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useMutation } from "@tanstack/react-query";
import { getPlayersForAuction } from "@/lib/actions";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/lib/actions";
import { type Team } from "@/schemas/team";
import { markPlayerSold } from "@/lib/actions";
import { markPlayerUnsold } from "@/lib/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRef } from "react";
import { changeStatusPlayer } from "@/lib/actions";

export const Route = createFileRoute("/app/auction/players/get")({
  component: getPlayersAuction,
});

function getPlayersAuction() {
  const [playerData, setPlayerData] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Ref to track if fetchPlayer.mutate() has already been called
  const isFetchPlayerCalled = useRef(false);

  const fetchPlayer = useMutation({
    mutationFn: async () => {
      const player = await getPlayersForAuction();
      return player;
    },
    onSuccess: (data) => {
      setPlayerData(data);
      setLoading(false);
    },
    onError: () => {
      toast.error("Error while fetching player for auction.");
      setLoading(false);
    },
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const teams = await getAllTeams();
      return teams || [];
    },
  });

  const soldMutation = useMutation({
    mutationFn: async (payload: { player: Auction; sellPrice: string; teamId: string }) => {
      await markPlayerSold({
        ...payload.player,
        sellPrice: payload.sellPrice,
        teamId: payload.teamId,
      });
    },
    onSuccess: () => {
      toast.success("Player marked as sold.");
      setIsDialogOpen(false);
      setLoading(true);
      fetchPlayer.mutate();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data || "Error while marking player as sold.";

      if (errorMessage.includes("Team budget exceeded")) {
        toast.error("Team budget exceeded!!");
      } else {
        toast.error("Error while marking player as sold.");
      }
    },
  });

  const unsoldMutation = useMutation({
    mutationFn: async (player: Auction) => {
      await markPlayerUnsold(player);
    },
    onSuccess: () => {
      toast.success("Player marked as unsold.");
      setIsAlertOpen(false);
      setLoading(true);
      fetchPlayer.mutate();
    },
    onError: () => {
      toast.error("Error while marking player as unsold.");
    },
  });

  // Ensure fetchPlayer.mutate() is called only once
  useEffect(() => {
    if (!isFetchPlayerCalled.current) {
      isFetchPlayerCalled.current = true;
      fetchPlayer.mutate();
    }
  }, [fetchPlayer]);

  useEffect(() => {
    const disableRefresh = (event: KeyboardEvent) => {
      // Disable F5 and Ctrl+R
      if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
        event.stopPropagation();
        toast.error("Page refresh is disabled. Use the 'Next Player' button.");
      }
    };
  
    // Add the event listener for keydown
    window.addEventListener("keydown", disableRefresh);
  
    return () => {
      // Cleanup the event listener on component unmount
      window.removeEventListener("keydown", disableRefresh);
    };
  }, []);

  const handleSaveChanges = () => {
    if (!sellPrice || !selectedTeamId) {
      toast.error("Please provide a sell price and select a team.");
      return;
    }

    const sanitizedSellPrice = parseInt(sellPrice.replace(/[^0-9]/g, ""), 10);
    const sanitizedBasePrice = parseInt(
      playerData?.basePrice.toString().replace(/[^0-9]/g, "") || "0",
      10
    );

    if (isNaN(sanitizedSellPrice)) {
      toast.error("Sell price must be a valid number.");
      return;
    }

    if (sanitizedBasePrice > sanitizedSellPrice) {
      toast.error("Sell price cannot be less than base price.");
      return;
    }

    const payload = {
      player: playerData!,
      sellPrice,
      teamId: selectedTeamId,
    };

    soldMutation.mutate(payload);
  };

  const handleMarkUnsold = () => {
    if (!playerData) return;
    unsoldMutation.mutate({
      ...playerData,
      status: "Unsold",
    });
  };

  const changeStatus = useMutation({
    mutationFn: async (player: Auction) => {
      await changeStatusPlayer(player);
    },
  });

  const handleNextPlayer = () => {
    changeStatus.mutate(playerData!);
    setLoading(true);
    fetchPlayer.mutate();
  };

  return (
    <>
      <SidebarInset className="w-full">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList className="tracking-wider">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Auction</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Players</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bid</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Separator className="mb-4" />

        <div className="w-full min-h-200 m-auto flex flex-col items-center justify-center bg-background text-foreground px-8 py-12">
          {playerData ? (
            <div className="w-full h-full border border-border rounded-xl p-8 shadow-lg bg-card tracking-wider">
              <h1 className="text-3xl font-bold text-primary mb-6 text-center">
                Player Information
              </h1>

              {loading ? (
                <div className="flex flex-col items-center mt-8">
                  <LoaderCircle className="animate-spin w-14 h-14 text-primary" />
                  <p className="mt-4 text-lg text-muted-foreground">
                    Loading next player...
                  </p>
                </div>
              ) : (
                <div className="flex justify-between gap-8 text-lg">
                  {/* Player Details */}
                  <div className="w-1/2 space-y-2">
                    <h2 className="text-xl font-semibold mb-2 border-b border-border pb-2">
                      Personal Details
                    </h2>
                    <p>
                      <strong>Name:</strong> {playerData.name}
                    </p>
                    <p>
                      <strong>Country:</strong> {playerData.country}
                    </p>
                    <p>
                      <strong>Role:</strong> {playerData.role}
                    </p>
                  </div>

                  {/* IPL Details */}
                  <div className="w-1/2 space-y-2">
                    <h2 className="text-xl font-semibold mb-2 border-b border-border pb-2">
                      IPL Information
                    </h2>
                    <p>
                      <strong>Base Price:</strong> {playerData.basePrice}
                    </p>
                    <p>
                      <strong>IPL Team:</strong> {playerData.iplTeam}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 px-4 py-1 rounded-lg text-white text-md font-semibold ${playerData.status === "Sold"
                          ? "bg-green-500"
                          : "bg-red-500"
                          }`}
                      >
                        {playerData.status}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center gap-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 cursor-pointer hover:bg-gray-700 text-white text-lg font-semibold px-4 py-4 rounded-md">
                      Sell Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Mark Player As Sold</DialogTitle>
                      <DialogDescription>
                        Make changes to Player. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sellPrice" className="text-right">
                          Sell Price
                        </Label>
                        <Input
                          id="sellPrice"
                          placeholder="Sell Price"
                          className="col-span-3"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)} // Update sell price
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="team" className="text-right">
                          Team
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setSelectedTeamId(
                              teams?.find((t) => t.name === value)?.id || ""
                            )
                          } // Update selected team's ID
                        >
                          <SelectTrigger id="team" className="col-span-3">
                            <SelectValue placeholder="Select Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams?.map((teamItem) => (
                              <SelectItem
                                key={teamItem.id}
                                value={teamItem.name}
                              >
                                {teamItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="cursor-pointer" onClick={handleSaveChanges}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Alert Dialog for Mark as Unsold */}
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="hover:bg-gray-700 cursor-pointer text-white text-lg font-semibold px-4 py-4 rounded-md"
                    >
                      Mark as Unsold
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark Player as Unsold</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark this player as unsold? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMarkUnsold}>
                        Final Mark as Unsold
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  onClick={handleNextPlayer}
                  disabled={loading || !playerData}
                  className="cursor-pointer border-primary text-primary text-lg font-semibold px-6 py-3 rounded-lg"
                >
                  Next Player →
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              No Player Found.
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
}
