import { useState, useEffect, useRef } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPlayersForAuction, getAllTeams, markPlayerSold, markPlayerUnsold, changeStatusPlayer } from "@/lib/actions";
import { toast } from "sonner";
import {
  LoaderCircle,
  User2,
  DollarSign,
  MapPin,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  ThumbsDown,
  Coins,
  Building,
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Team } from "@/schemas/team";
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
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

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
      setPlayerData(undefined);
      toast.error(errorMessage, {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
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
      toast.error("No teams found. Please create a team to get started.", {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
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
      toast.success("Player marked as sold.", {
        style: {
          background: "linear-gradient(90deg, #38A169, #2F855A)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      setIsDialogOpen(false);
      setLoading(true);
      fetchPlayer.mutate();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data || "Error while marking player as sold.";

      if (errorMessage.includes("Team budget exceeded")) {
        toast.error("Team budget exceeded!!", {
          style: {
            background: "linear-gradient(90deg, #E53E3E, #C53030)",
            color: "white",
            fontWeight: "bolder",
            fontSize: "13px",
            letterSpacing: "1px",
        }
        });
      } else if (errorMessage.includes("Team has reached the maximum number of players.")) {
        toast.error("Team has reached the maximum number of players!!", {
          style: {
            background: "linear-gradient(90deg, #E53E3E, #C53030)",
            color: "white",
            fontWeight: "bolder",
            fontSize: "13px",
            letterSpacing: "1px",
        }
        });
      } else {
        toast.error("Error while marking player as sold.", {
          style: {
            background: "linear-gradient(90deg, #E53E3E, #C53030)",
            color: "white",
            fontWeight: "bolder",
            fontSize: "13px",
            letterSpacing: "1px",
        }
        });
      }
    },
  });

  const unsoldMutation = useMutation({
    mutationFn: async (player: Auction) => {
      await markPlayerUnsold(player);
    },
    onSuccess: () => {
      toast.success("Player marked as unsold.", {
        style: {
          background: "linear-gradient(90deg, #38A169, #2F855A)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      setIsAlertOpen(false);
      setLoading(true);
      fetchPlayer.mutate();
    },
    onError: () => {
      toast.error("Error while marking player as unsold.", {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
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
        toast.error("Page refresh is disabled. Use the 'Next Player' button.", {
          style: {
            background: "linear-gradient(90deg, #E53E3E, #C53030)",
            color: "white",
            fontWeight: "bolder",
            fontSize: "13px",
            letterSpacing: "1px",
        }
        });
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
      toast.error("Please provide a sell price and select a team.", {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      return;
    }

    // Extract numeric value from basePrice (e.g., "1.92 Cr" -> 1.92)
    const sanitizedBasePrice = parseFloat(
      playerData?.basePrice.toString().replace(/[^\d.]/g, "") || "0"
    );

    // Ensure sellPrice is a valid number
    const sanitizedSellPrice = parseFloat(sellPrice.toString());

    if (isNaN(sanitizedSellPrice)) {
      toast.error("Sell price must be a valid number.", {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      return;
    }

    if (sanitizedSellPrice < sanitizedBasePrice) {
      toast.error("Sell price cannot be less than base price.", {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
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
    toast.success("Auction has been reset!", {
      style: {
        background: "linear-gradient(90deg, #38A169, #2F855A)",
        color: "white",
        fontWeight: "bolder",
        fontSize: "13px",
        letterSpacing: "1px",
    }
    });
    changeStatus.mutate({
      ...playerData!
    });
    navigate({ to: '/app/auction' });
  };

  // Set base price based on player data
  useEffect(() => {
    if (playerData?.basePrice) {
      // Set initial sell price to base price
      const basePrice = parseFloat(
        playerData.basePrice.toString().replace(/[^\d.]/g, "") || "0"
      );
      setSellPrice(basePrice);
    }
  }, [playerData]);

  return (
    <SidebarInset className="w-full bg-slate-50 dark:bg-black">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="tracking-wider text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="#" className="text-slate-600 dark:text-slate-400">Auction</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link to="/app/players"><BreadcrumbLink href="#" className="text-slate-600 dark:text-slate-400">Players</BreadcrumbLink></Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">Bid</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Player Auction</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage player bidding and team assignments</p>
            </div>
          </div>

          <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer mt-4 sm:mt-0 flex w-full lg:w-50 items-center gap-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Auction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-rose-600 dark:text-white">Reset Auction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset the auction? This will end the current auction session and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer dark:bg-red-700 dark:text-white  hover:bg-rose-700"
                  onClick={handleResetAuction}
                >
                  Reset Auction
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-sm">
            <LoaderCircle className="animate-spin w-10 h-10 text-blue-500 mb-4" />
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">Loading next player...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preparing player information</p>
          </div>
        ) : isPlayer && playerData ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-sm overflow-hidden">
            {/* Status Bar at top */}
            <div className={cn(
              "w-full h-1.5",
              playerData.status === "Sold" ? "bg-emerald-400" : "bg-amber-400"
            )} />

            <div className="p-6 card shadow-sm dark:bg-gray-700 bg-gray-200 lg:h-120 h-200"  >
              {/* Player Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 h-70 lg:h-40">
              <img
              src={playerData.image_url || "https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png"}
              alt={playerData.name || "Player Image"}
              className="w-40 h-40 object-cover m-auto lg:m-0 rounded-full border bg-white border-gray-300 shadow-md"
            />
                <div className="flex items-center gap-4">
                  <div className="text-center flex flex-col space-y-2 m-auto">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{playerData.name}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-md font-bold  tracking-wider">
                        {playerData.role}
                      </span>
                      <span className="flex items-center gap-1 text-md font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5" /> {playerData.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "px-3 py-1.5 rounded-full m-auto lg:m-0 text-sm font-bold tracking-wider flex items-center gap-1.5",
                  playerData.status === "Sold" ? "bg-emerald-500" : "bg-amber-900 text-white"
                )}>
                  <Tags className="h-3.5 w-3.5" />
                  {playerData.status}
                </div>
              </div>

              {/* Price and Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-5">
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Base Price</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Coins className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="text-xl font-semibold text-teal-600 dark:text-teal-400">
                        {playerData.basePrice} Cr
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">IPL Team</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-base font-medium text-slate-800 dark:text-slate-200">
                        {playerData.iplTeam || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Bidding Actions</h3>

                  <div className="space-y-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="cursor-pointer font-bold tracking-wider w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 h-10 shadow-sm"
                        >
                          <DollarSign className="h-4 w-4" />
                          Sell Player
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Mark Player As Sold</DialogTitle>
                          <DialogDescription>
                            Set the final selling price and assign a team for {playerData.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="sellPrice">
                              Sell Price (in Cr)
                            </Label>
                            <Input
                              id="sellPrice"
                              type="number"
                              step="0.1"
                              placeholder="Enter amount in Crores"
                              defaultValue={0}
                              value={sellPrice}
                              onChange={(e) => setSellPrice(Number(e.target.value))}
                              className="border-slate-200 dark:border-slate-700"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Base price: {playerData.basePrice} Cr
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team">
                              Assign Team
                            </Label>
                            <Select
                              onValueChange={(value) =>
                                setSelectedTeamId(
                                  teams?.find((t) => t.name === value)?.id || ""
                                )
                              }
                            >
                              <SelectTrigger id="team" className="border-slate-200 dark:border-slate-700">
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
                          <Button className="cursor-pointer" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="cursor-pointer dark:bg-gray-200 hover:dark:bg-white"
                            onClick={handleSaveChanges}
                          >
                            Complete Sale
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="cursor-pointer w-full border-rose-200 dark:border-rose-900 text-white dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 h-10"
                        >
                          <ThumbsDown className="h-4 w-4 dark:default text-red-600" />
                          <span className="text-red-500 font-bold tracking-wider">Mark as Unsold</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark Player as Unsold</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to mark {playerData.name} as unsold? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="cursor-pointer bg-red-800 text-white hover:bg-red-700"
                            onClick={handleMarkUnsold}
                          >
                            Mark as Unsold
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="secondary"
                      onClick={handleNextPlayer}
                      disabled={loading || !playerData}
                      className="cursor-pointer border border-gray-100 font-bold tracking-wider w-full h-10 flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      Next Player
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No Player Available</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              There are no more players available for auction at this time or the auction has ended.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/app/auction' })}
                className="cursor-pointer"
              >
                Return to Auction Home
              </Button>
              <Button
                onClick={() => fetchPlayer.mutate()}
                className="cursor-pointer bg-blue-500 hover:bg-blue-600"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}