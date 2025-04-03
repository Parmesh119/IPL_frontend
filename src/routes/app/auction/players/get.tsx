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

export const Route = createFileRoute("/app/auction/players/get")({
  component: getPlayersAuction,
});

function getPlayersAuction() {
  const [playersData, setPlayersData] = useState<Auction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sellPrice, setSellPrice] = useState(""); // State for sell price
  const [selectedTeamId, setSelectedTeamId] = useState(""); // State for selected team's ID
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control alert dialog visibility

  const getPlayer = useMutation({
    mutationFn: async () => {
      const players = await getPlayersForAuction();
      return players || [];
    },
    onSuccess: (data) => {
      setPlayersData(data);
      setLoading(false); 
    },
    onError: () => {
      toast.error("Error while fetching players for auction.");
      setLoading(false); 
    },
  });

  const { data: team } = useQuery<Team[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const players = await getAllTeams();
      if (!players) {
        return [];
      }
      return players;
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
      window.history.back();
    },
    onError: () => {
      toast.error("Error while marking player as sold.");
    },
  });

  const unsoldMutation = useMutation({
    mutationFn: async (player: Auction) => {
      await markPlayerUnsold(player);
    },
    onSuccess: () => {
      toast.success("Player marked as unsold.");
      setIsAlertOpen(false);
    },
    onError: () => {
      toast.error("Error while marking player as unsold.");
    },
  });

  useEffect(() => {
    getPlayer.mutate();
  }, []);

  const handleSaveChanges = () => {
    if (!sellPrice || !selectedTeamId) {
      toast.error("Please provide a sell price and select a team.");
      return;
    }
    
    const payload = {
      player: playersData[currentIndex],
      sellPrice,
      teamId: selectedTeamId,
    };

    soldMutation.mutate(payload);

    getPlayer.mutate();
  };

  const handleMarkUnsold = () => {
    const player = playersData[currentIndex];
    unsoldMutation.mutate({
      ...player,
      status: "Unsold",
    });
  };

  const handleNextPlayer = () => {
    setLoading(true);
    getPlayer.mutate();
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

        {/* Main Content */}
        <div className="w-full min-h-200 m-auto flex flex-col items-center justify-center bg-background text-foreground px-8 py-12">
          {playersData.length > 0 ? (
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
                    {playersData[currentIndex].name && (
                      <p>
                        <strong>Name:</strong> {playersData[currentIndex].name}
                      </p>
                    )}
                    {playersData[currentIndex].country && (
                      <p>
                        <strong>Country:</strong>{" "}
                        {playersData[currentIndex].country}
                      </p>
                    )}
                    {playersData[currentIndex].role && (
                      <p>
                        <strong>Role:</strong> {playersData[currentIndex].role}
                      </p>
                    )}
                  </div>

                  {/* IPL Details */}
                  <div className="w-1/2 space-y-2">
                    <h2 className="text-xl font-semibold mb-2 border-b border-border pb-2">
                      IPL Information
                    </h2>
                    {playersData[currentIndex].iplTeam && (
                      <p>
                        <strong>IPL Team:</strong>{" "}
                        {playersData[currentIndex].iplTeam || ""}
                      </p>
                    )}
                    {playersData[currentIndex].basePrice && (
                      <p>
                        <strong>Base Price:</strong>{" "}
                        {playersData[currentIndex].basePrice}
                      </p>
                    )}
                    {playersData[currentIndex].status && (
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-4 py-1 rounded-lg text-white text-md font-semibold ${
                            playersData[currentIndex].status === "Sold"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {playersData[currentIndex].status}
                        </span>
                      </p>
                    )}
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
                              team?.find((t) => t.name === value)?.id || ""
                            )
                          } // Update selected team's ID
                        >
                          <SelectTrigger id="team" className="col-span-3">
                            <SelectValue placeholder="Select Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {team?.map((teamItem) => (
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
                      <Button onClick={handleSaveChanges}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Alert Dialog for Mark as Unsold */}
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="hover:bg-gray-700 text-white text-lg font-semibold px-4 py-4 rounded-md"
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
                  disabled={loading || playersData.length === 0}
                  className="border-primary text-primary text-lg font-semibold px-6 py-3 rounded-lg"
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
