"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Player } from "@/schemas/players"; // Adjust path
import { useTheme } from "@/components/theme-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlayerAction } from "@/lib/actions";
import { toast } from "sonner";
import { type Team } from "@/schemas/team";

interface EditPlayerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    editPlayer: Player | null;
    setEditPlayer: (player: Player) => void;
    teams: any[];
    roles: string[];
    handleEditPlayer: () => void
    handleCancelEdit: () => void
    id: string;
}

const EditPlayerDialog: React.FC<EditPlayerDialogProps> = ({
    open,
    setOpen,
    editPlayer,
    setEditPlayer,
    roles,
    handleCancelEdit

}) => {

    const queryClient = useQueryClient();
    const { theme } = useTheme();
    let prefetchTeams: Team[] | undefined = queryClient.getQueryData(["teams"]) as any[] || [];;


    const updateMutation = useMutation({
        mutationFn: async (player: Player) => {
            const updatedPlayer = await updatePlayerAction(player);
            return updatedPlayer;
        },
        onSuccess: () => {
            toast.success("Player updated successfully.", {
                style: {
                    background: "linear-gradient(90deg, #38A169, #2F855A)",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "13px",
                    letterSpacing: "1px",
                },
            });
            queryClient.invalidateQueries({ queryKey: ["player"] });
            setOpen(false);
        },
        onError: () => {
            toast.error("Error while updating player!!", {
                style: {
                    background: "linear-gradient(90deg, #E53E3E, #C53030)",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "13px",
                    letterSpacing: "1px",
                },
            });
            setOpen(false);
        },
    });

    if (!editPlayer) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditPlayer({ ...editPlayer, [name]: value });
    };

    const handleRoleChange = (role: string) => {
        setEditPlayer({ ...editPlayer, role });
    };

    const handleTeamChange = (teamId: string) => {

        setEditPlayer({ ...editPlayer, teamId });
    };

    const handleIPLTeam = (iplTeam: string) => {
        setEditPlayer({ ...editPlayer, iplTeam: iplTeam });
    };

    const handleUpdatePlayer = () => {
        const updatedPlayerData = {
            ...editPlayer,

            teamId: prefetchTeams?.find((data) => data.name === editPlayer.teamId)?.id || prefetchTeams?.find((team) => team.name === teamName)?.id,
        };

        updateMutation.mutate(updatedPlayerData);
    };

    const teamName = prefetchTeams?.find((team) => team.id === editPlayer.teamId)?.name || "";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={`"sm:max-w-[425px] tracking-wider border" ${theme === "dark" ? "border-zinc-100" : "border-black"}`}>
                <DialogHeader>
                    <DialogTitle>Edit Player</DialogTitle>
                    <DialogDescription>Modify player details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Name Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input autoFocus id="name" name="name" value={editPlayer.name || ""} onChange={handleInputChange} placeholder="Player Name" className="col-span-3" />
                    </div>

                    {/* Country Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="country" className="text-right">Country</Label>
                        <Input id="country" name="country" value={editPlayer.country || ""} onChange={handleInputChange} placeholder="Country" className="col-span-3" />
                    </div>

                    {/* IPL Team */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ipl" className="text-right">IPL Team</Label>
                        <Input id="ipl" name="ipl" value={editPlayer.iplTeam || ""} onChange={(e) => handleIPLTeam(e.target.value)} placeholder="IPL Team" className="col-span-3" />
                    </div>

                    {/* Role Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select onValueChange={handleRoleChange} defaultValue={editPlayer.role || ""}>
                            <SelectTrigger id="role" className="col-span-3 cursor-pointer">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role} value={role} className="cursor-pointer">{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Team Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="team" className="text-right">Team</Label>
                        <Select onValueChange={handleTeamChange} defaultValue={teamName}>
                            <SelectTrigger id="team" className="col-span-3 cursor-pointer">
                                <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {prefetchTeams && prefetchTeams.map(team => (
                                    <SelectItem key={String(team.id)} value={String(team.id)} className="cursor-pointer">{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Base Price Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="basePrice" className="text-right">Base Price</Label>
                        <Input id="basePrice" name="basePrice" value={editPlayer.basePrice || ""} onChange={handleInputChange} placeholder="Base Price" className="col-span-3" />
                    </div>

                    {/* Sell Price Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sellPrice" className="text-right">Sell Price</Label>
                        <Input id="sellPrice" name="sellPrice" value={editPlayer.sellPrice || ""} onChange={handleInputChange} placeholder="Sell Price" className="col-span-3" />
                    </div>
                </div>

                <DialogFooter className="flex sm:w-full justify-between">

                    <Button type="button" variant="secondary" onClick={handleCancelEdit} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleUpdatePlayer} className="cursor-pointer">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPlayerDialog;