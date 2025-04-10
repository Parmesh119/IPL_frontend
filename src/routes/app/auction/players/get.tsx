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
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/auction/players/get")({
  component: getPlayersAuction,
});

function getPlayersAuction() {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<Auction>();
  const [loading, setLoading] = useState(false);
  const [sellPrice, setSellPrice] = useState(0.0);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);

  // Ref to track if fetchPlayer.mutate() has already been called
  const isFetchPlayerCalled = useRef(false);

  const fetchPlayer = useMutation({
    mutationFn: async () => {
      const player = await getPlayersForAuction();
      return player;
    },
    onSuccess: (data) => {
      setIsPlayer(true);
      setPlayerData(data);
      setLoading(false);
    },
    onError: (error: any) => {
      setIsPlayer(false);
      const errorMessage = error.response?.data?.error || "Error while fetching player for auction.";
      setPlayerData(undefined)
      toast.error(errorMessage);
      setLoading(false);
    },
  });

  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const teams = await getAllTeams();
      return teams || [];
    },
    
  });

  useEffect(() => {
    if (!isLoadingTeams && teams?.length === 0) {
      toast.error("No teams found. Please create a team to get started.");
      localStorage.setItem("iplAuctionStarted", "false");
      navigate({ to: '/app/team' });
    }
  }, [isLoadingTeams, teams, navigate]);

  const soldMutation = useMutation({
    mutationFn: async (payload: { player: Auction; sellPrice: number; teamId: string }) => {
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
      } else if(errorMessage.includes("Team has reached the maximum number of players.")) {
        toast.error("Team has reached the maximum number of players!!");
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

    // Extract numeric value from basePrice (e.g., "1.92 Cr" -> 1.92)
    const sanitizedBasePrice = parseFloat(
      playerData?.basePrice.toString().replace(/[^\d.]/g, "") || "0"
    );

    // Ensure sellPrice is a valid number
    const sanitizedSellPrice = parseFloat(sellPrice.toString());

    if (isNaN(sanitizedSellPrice)) {
      toast.error("Sell price must be a valid number.");
      return;
    }

    if (sanitizedSellPrice < sanitizedBasePrice) {
      toast.error("Sell price cannot be less than base price.");
      return;
    }

    const payload = {
      player: playerData!,
      sellPrice: sanitizedSellPrice,
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

  const handleResetAuction = () => {
    localStorage.setItem("iplAuctionStarted", "false");
    toast.success("Auction has been reset!");
    changeStatus.mutate({
      ...playerData!
    });
    navigate({ to: '/app/auction' });
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

        <div className="w-full min-h-200 m-auto flex flex-col items-center justify-center bg-background text-foreground px-4 sm:px-6 md:px-8 py-8 md:py-12">
          
          {playerData ? (
            isPlayer ? (
              <div className="w-full h-full border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-lg bg-card tracking-wider">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary text-center md:text-left">
                    Player Information
                  </h1>
                  
                  {/* Reset Auction Button positioned on the right */}
                  <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="cursor-pointer text-white text-sm font-semibold px-3 py-1 rounded-md mt-4 md:mt-0">
                        Reset Auction
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle >Reset Auction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reset the auction? This will end the current auction session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="cursor-pointer" onClick={handleResetAuction}>
                          Reset Auction
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center mt-8">
                    <LoaderCircle className="animate-spin w-12 h-12 md:w-14 md:h-14 text-primary" />
                    <p className="mt-4 text-base md:text-lg text-muted-foreground">
                      Loading next player...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8 text-base md:text-lg">
                    {/* Player Details */}
                    <div className="w-full md:w-1/2 space-y-2">
                      <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-2">
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
                    <div className="w-full md:w-1/2 space-y-2">
                      <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-2">
                        IPL Information
                      </h2>
                      <p>
                        <strong>Base Price:</strong> {playerData.basePrice + " Cr"}
                      </p>
                      <p>
                        <strong>IPL Team:</strong> {playerData.iplTeam}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-3 py-1 rounded-lg text-white text-sm md:text-md font-semibold ${playerData.status === "Sold"
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
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 cursor-pointer hover:bg-gray-700 text-white text-base md:text-lg font-semibold px-3 py-2 md:px-4 md:py-4 rounded-md w-full sm:w-auto">
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
                            type="number"
                            placeholder="Sell Price"
                            className="col-span-3"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(Number(e.target.value))} // Update sell price
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
                        className="hover:bg-gray-700 cursor-pointer text-white text-base md:text-lg font-semibold px-3 py-2 md:px-4 md:py-4 rounded-md w-full sm:w-auto"
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
                    className="cursor-pointer border-primary text-primary text-base md:text-lg font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg w-full sm:w-auto"
                  >
                    Next Player →
                  </Button>
                </div>
              </div>
            ) : <div className="flex items-center justify-center">
              No Player Found.
            </div>) : (
            <div className="flex items-center justify-center">
              No Player Found.
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
}