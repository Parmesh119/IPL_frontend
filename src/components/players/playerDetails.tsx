import React, { useState } from "react";
import { type Player } from "@/schemas/players";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { useTheme } from "@/components/theme-provider";
import EditPlayerDialog from "./EditPlayerDialog"; // Import the edit dialog

interface PlayerDetailsProps {
  player: Player;
  teams: { id: string; name: string }[];
  roles: string[];
  battingStyles: string[];
  bowlingStyles: string[];
  handleUpdatePlayer: (updatedPlayer: Player) => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ 
  player, 
  teams = [],
  roles = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"],
  battingStyles = ["Right-handed", "Left-handed"], 
  bowlingStyles = ["Fast", "Spin", "Medium"], 
  handleUpdatePlayer 
}) => {
  const { theme } = useTheme();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player>(player);

  const handleEditPlayer = () => {
    handleUpdatePlayer(editingPlayer);
    setIsEditOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingPlayer(player); // Reset to original values
    setIsEditOpen(false);
  };

  // Find team name for display
  const teamName = teams.find(t => t.name === player.teamId)?.name || player.teamId;

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-8 tracking-wider">
      <Card className={`${theme === "dark" ? "border border-white bg-gray-800" : "bg-white border border-black"} shadow-md p-10`}>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">User Information</h2>
            <Button 
              className={`${theme !== "dark" ? " bg-black text-white" : "text-black bg-white"} text-md cursor-pointer`}
              onClick={() => {
                setEditingPlayer(player); // Ensure we start with current player data
                setIsEditOpen(true);
              }}
            >
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
            {/* Personal Details */}
            <div className="text-lg">
              <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Name :</Label>
                  <p className="font-semibold">{player.name}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Country :</Label>
                  <p className="font-semibold">{player.country}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Age :</Label>
                  <p className="font-semibold">{player.age}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Role :</Label>
                  <p className="font-semibold">{player.role}</p>
                </div>
              </div>
            </div>

            {/* Team & Financial Details */}
            <div className="text-lg">
              <h3 className="font-semibold text-lg mb-4">Team & Financial Details</h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Team :</Label>
                  <p className="font-semibold">{teamName || "N/A"}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Base Price :</Label>
                  <p className="font-semibold">{player.basePrice}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Sell Price :</Label>
                  <p className="font-semibold">{player.sellPrice || "N/A"}</p>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <Label className="w-24 sm:w-32">Status :</Label>
                  <Badge className={`px-4 py-1 font-bold tracking-widest ${player.status === "Sold" ? "bg-green-500" : player.status === "Unsold" ? "bg-red-500" : "bg-blue-500"}`}>{player.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Playing Style */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Playing Style</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row">
                <Label className="w-32">Batting Style :</Label>
                <p className="font-semibold">{player.battingStyle}</p>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Label className="w-32">Bowling Style :</Label>
                <p className="font-semibold">{player.bowlingStyle || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
       
      </Card>

      {/* Edit Player Dialog */}
      <EditPlayerDialog 
        open={isEditOpen}
        setOpen={setIsEditOpen}
        editPlayer={editingPlayer}
        setEditPlayer={setEditingPlayer}
        teams={teams} 
        roles={roles} 
        battingStyles={battingStyles} 
        bowlingStyles={bowlingStyles} 
        handleEditPlayer={handleEditPlayer}
        handleCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default PlayerDetails;