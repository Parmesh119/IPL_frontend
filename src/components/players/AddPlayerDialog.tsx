// components/AddPlayerDialog.tsx
"use client"

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type Player } from "@/schemas/players" // Adjust path
import { useTheme } from "@/components/theme-provider"


interface AddPlayerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    newPlayer: Player;
    setNewPlayer: (player: Player) => void;
    teams: any[]; // Replace 'any[]' with the actual type of your 'teams' data
    roles: string[];
    battingStyles: string[];
    bowlingStyles: string[];
    handleAddPlayer: () => void;
    handleCancelAdd: () => void;
}

const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
    open,
    setOpen,
    newPlayer,
    setNewPlayer,
    teams,
    roles,
    battingStyles,
    bowlingStyles,
    handleAddPlayer,
    handleCancelAdd,
}) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPlayer((prev: Player) => ({ ...prev, [name]: value })); //Explicitly annotate here
    };

    const handleRoleChange = (role: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, role })); //Explicitly annotate here
    };

    const handleTeamChange = (teamId: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, teamId })); //Explicitly annotate here
    };

    const handleBattingStyleChange = (battingStyle: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, battingStyle })); //Explicitly annotate here
    };

    const handleBowlingStyleChange = (bowlingStyle: string | undefined) => {
        setNewPlayer((prev: Player) => ({ ...prev, bowlingStyle: bowlingStyle || "" })); //Explicitly annotate here
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayer((prev: Player) => ({ ...prev, country: e.target.value })) //Explicitly annotate here
    }

    const handleIPLTeam = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayer((prev: Player) => ({ ...prev, iplTeam: e.target.value })) //Explicitly annotate here
    }

    const { theme } = useTheme()

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button className="bg-blue-500 text-white tracking-wider w-full sm:w-auto cursor-pointer" variant="outline">Add Player</Button>
            </DialogTrigger>
            <DialogContent className={`"sm:max-w-[425px] tracking-wider border" ${theme === "dark" ? "border-zinc-100" : "border-black"}`}>
                <DialogHeader>
                    <DialogTitle>Add Player</DialogTitle>
                    <DialogDescription>
                        Add a new player to the list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" placeholder="Player Name" autoFocus name="name" value={newPlayer.name} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="age" className="text-right">
                            Age
                        </Label>
                        <Input id="age" placeholder="Age" type="number" name="age" value={newPlayer.age} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="country" className="text-right">
                            Country
                        </Label>
                        <Input id="country" placeholder="Country" name="country" value={newPlayer.country} onChange={handleCountryChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ipl" className="text-right">
                            IPL Team
                        </Label>
                        <Input id="ipl" placeholder="IPL Team" name="ipl" value={newPlayer.iplTeam} onChange={handleIPLTeam} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right ">
                            Role
                        </Label>
                        <Select onValueChange={handleRoleChange} defaultValue={newPlayer.role}>
                            <SelectTrigger className="col-span-3 cursor-pointer">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem className="cursor-pointer" key={String(role)} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="team" className="text-right ">
                            Team
                        </Label>
                        <Select onValueChange={handleTeamChange} defaultValue={newPlayer.teamId}>
                            <SelectTrigger className="col-span-3 cursor-pointer">
                                <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    (teams ?? []).map(team => (
                                        <SelectItem className="cursor-pointer" key={String(team.id)} value={String(team.name)}>{team.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="battingStyle" className="text-right">
                            Batting Style
                        </Label>
                        <Select onValueChange={handleBattingStyleChange} defaultValue={newPlayer.battingStyle}>
                            <SelectTrigger className="col-span-3 cursor-pointer">
                                <SelectValue placeholder="Select Batting Style" />
                            </SelectTrigger>
                            <SelectContent>
                                {battingStyles.map(style => (
                                    <SelectItem className="cursor-pointer" key={style} value={style}>{style}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {newPlayer.role === "Bowler" || newPlayer.role === "All-rounder" ? (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bowlingStyle" className="text-left">
                                Bowling Style
                            </Label>
                            <Select onValueChange={handleBowlingStyleChange} defaultValue={newPlayer.bowlingStyle}>
                                <SelectTrigger className="col-span-3 cursor-pointer">
                                    <SelectValue placeholder="Select Bowling Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bowlingStyles.map(style => (
                                        <SelectItem className="cursor-pointer" key={style} value={style}>{style}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="basePrice" className="text-right">
                            Base Price
                        </Label>
                        <Input id="basePrice" placeholder="Base Price" type="text" name="basePrice" value={newPlayer.basePrice} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sellPrice" className="text-right">
                            Sell Price
                        </Label>
                        <Input id="sellPrice" placeholder="Sell Price" type="text" name="sellPrice" value={newPlayer.sellPrice || ""} onChange={handleInputChange} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button className="cursor-pointer" type="button" variant="secondary" onClick={handleCancelAdd}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer" type="submit" onClick={handleAddPlayer}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPlayerDialog;