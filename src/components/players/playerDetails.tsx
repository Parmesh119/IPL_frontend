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
    <div className="w-full px-4 m-auto sm:px-6 lg:px-8 tracking-wider">
      <Card
        className={`w-full max-w-4xl mx-auto ${theme === "dark"
          ? "border border-white bg-gray-900 shadow-lg"
          : "bg-white border border-black shadow-md"
          } rounded-xl p-6 sm:p-10`}
      >
        <CardContent>
          {/* Header Section */}
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Player Information</h2>
            <Button
              className={`${theme !== "dark"
                ? " bg-black text-white"
                : "text-black bg-white"
                } text-md cursor-pointer`}
              onClick={() => {
                setEditingPlayer(player);
                setIsEditOpen(true);
              }}
            >
              Edit
            </Button>
          </div>

          {/* Grid Layout for Player Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="text-lg">
              <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
              <div className="space-y-2">
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Name :</Label>
                  <p className="font-semibold">{player.name}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Country :</Label>
                  <p className="font-semibold ">{player.country}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Age :</Label>
                  <p className="font-semibold">{player.age}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Role :</Label>
                  <p className="font-semibold">{player.role}</p>
                </div>
              </div>
            </div>

            {/* Team & Financial Details */}
            <div className="text-lg">
              <h3 className="font-semibold text-lg mb-4">Team & Financial Details</h3>
              <div className="space-y-2">
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Team :</Label>
                  <p className="font-semibold">{teamName || "N/A"}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Base Price :</Label>
                  <p className="font-semibold">{player.basePrice}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-32 sm:w-36">Sell Price :</Label>
                  <p className="font-semibold">{player.sellPrice || "N/A"}</p>
                </div>
                <div className="flex flex-row lg:mt-0 mt-4">
                  <Label className="w-32 sm:w-36">Status :</Label>
                  <Badge
                    className={`px-4 py-1 font-bold tracking-widest ${player.status === "Sold"
                      ? "bg-green-500 text-white"
                      : player.status === "Unsold"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                      }`}
                  >
                    {player.status}
                  </Badge>
                </div>
              </div>
            </div>
            {/* Playing Style Section */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Playing Style</h3>
              <div className="space-y-4">
                <div className="flex flex-row">
                  <Label className="w-36">Batting Style :</Label>
                  <p className="font-semibold">{player.battingStyle}</p>
                </div>
                <div className="flex flex-row">
                  <Label className="w-36">Bowling Style :</Label>
                  <p className="font-semibold">
                    {(player.role === "All-rounder" || player.role === "Bowler")
                      ? player.bowlingStyle
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            {/* Playing Style Section */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">IPL Information</h3>
              <div className="space-y-4">
                <div className="flex flex-row">
                  <Label className="w-36">IPL Team :</Label>
                  <p className="font-semibold">{player.iplTeam}</p>
                </div>
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
        id={player.id || ""}
      />
    </div>

  );
};

export default PlayerDetails;