// components/AddPlayerDialog.tsx
"use client"

import React, { useState } from "react";
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
import { type Player, PlayerSchema } from "@/schemas/players" // Adjust path
import { useTheme } from "@/components/theme-provider"
import { z } from "zod"

interface AddPlayerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    newPlayer: Player;
    setNewPlayer: (player: Player) => void;
    teams: any[]; // Replace 'any[]' with the actual type of your 'teams' data
    roles: string[];
    IPL_TEAMS: string[];
    battingStyles: string[];
    bowlingStyles: string[];
    handleAddPlayer: () => void;
    handleCancelAdd: () => void;
}

type ValidationErrors = {
    [key: string]: string;
};

const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({
    open,
    setOpen,
    newPlayer,
    setNewPlayer,
    teams,
    roles,
    IPL_TEAMS,
    handleAddPlayer,
    handleCancelAdd,
}) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPlayer((prev: Player) => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRoleChange = (role: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, role }));
        
        // Clear error for role field
        if (validationErrors.role) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.role;
                return newErrors;
            });
        }
    };

    const handleIPLTeamChange = (iplTeam: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, iplTeam }));
        
        // Clear error for iplTeam field
        if (validationErrors.iplTeam) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.iplTeam;
                return newErrors;
            });
        }
    }

    const handleTeamChange = (teamId: string) => {
        setNewPlayer((prev: Player) => ({ ...prev, teamId }));
        
        // Clear error for teamId field
        if (validationErrors.teamId) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.teamId;
                return newErrors;
            });
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayer((prev: Player) => ({ ...prev, country: e.target.value }));
        
        // Clear error for country field
        if (validationErrors.country) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.country;
                return newErrors;
            });
        }
    }

    const validateAndSubmit = () => {
        const selectedTeam = teams.find((team) => team.name === newPlayer.teamId);
        const playerToValidate = {
            ...newPlayer, 
            teamId: selectedTeam?.id,
            age: newPlayer.age === undefined ? undefined : Number(newPlayer.age),
            sellPrice: Number(newPlayer.sellPrice) == null ? null : Number(newPlayer.sellPrice),
            basePrice: Number(newPlayer.basePrice), 
            iplTeam: String(newPlayer.iplTeam), 
            battingStyle: String(newPlayer.battingStyle), 
            role: String(newPlayer.role), 
            country: String(newPlayer.country), 
            status: newPlayer.status ?? "Pending", 
            bowlingStyle: newPlayer.bowlingStyle ? String(newPlayer.bowlingStyle) : undefined,
        };

        try {
            const validationResult = PlayerSchema.parse(playerToValidate);
            
            // Additional validation for bowling style
            if ((validationResult.role === "Bowler" || validationResult.role === "All-rounder") && !validationResult.bowlingStyle) {
                setValidationErrors({
                    bowlingStyle: "Bowling style is required for Bowlers and All-rounders."
                });
                return;
            }
            
            // Clear all validation errors and proceed
            setValidationErrors({});
            handleAddPlayer();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Convert Zod errors to our format
                const newErrors: ValidationErrors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.') || 'field';
                    newErrors[path] = err.message;
                });
                setValidationErrors(newErrors);
            }
        }
    };

    const { theme } = useTheme()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 text-white tracking-wider w-full sm:w-auto cursor-pointer" variant="outline">Add Player</Button>
            </DialogTrigger>
            <DialogContent className={`"sm:max-w-[425px]" tracking-wider border ${theme === "dark" ? "border-zinc-100" : "border-black"}`}>
                <DialogHeader>
                    <DialogTitle>Add Player</DialogTitle>
                    <DialogDescription>
                        Add a new player to the list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="name" className="text-right pt-2">
                            Name
                        </Label>
                        <div className="col-span-3">
                            <Input 
                                id="name" 
                                placeholder="Player Name" 
                                autoFocus 
                                name="name" 
                                value={newPlayer.name} 
                                onChange={handleInputChange} 
                                className={validationErrors.name ? "border-red-500" : ""}
                            />
                            {validationErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="country" className="text-right pt-2">
                            Country
                        </Label>
                        <div className="col-span-3">
                            <Input 
                                id="country" 
                                placeholder="Country" 
                                name="country" 
                                value={newPlayer.country} 
                                onChange={handleCountryChange} 
                                className={validationErrors.country ? "border-red-500" : ""}
                            />
                            {validationErrors.country && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="iplTeam" className="text-right pt-2">
                            IPL Team
                        </Label>
                        <div className="col-span-3">
                            <Select 
                                onValueChange={handleIPLTeamChange} 
                                defaultValue=""
                            >
                                <SelectTrigger className={`cursor-pointer ${validationErrors.iplTeam ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select IPL TEAM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {IPL_TEAMS.map(ipl => (
                                        <SelectItem className="cursor-pointer" key={String(ipl)} value={ipl}>{ipl}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.iplTeam && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.iplTeam}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="role" className="text-right pt-2">
                            Role
                        </Label>
                        <div className="col-span-3">
                            <Select 
                                onValueChange={handleRoleChange} 
                                defaultValue={newPlayer.role}
                            >
                                <SelectTrigger className={`cursor-pointer ${validationErrors.role ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem className="cursor-pointer" key={String(role)} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.role && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="team" className="text-right pt-2">
                            Team
                        </Label>
                        <div className="col-span-3">
                            <Select 
                                onValueChange={handleTeamChange} 
                                defaultValue={newPlayer.teamId}
                            >
                                <SelectTrigger className={`cursor-pointer ${validationErrors.teamId ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select Team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(teams ?? []).map(team => (
                                        <SelectItem className="cursor-pointer" key={String(team.id)} value={String(team.name)}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {validationErrors.teamId && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.teamId}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="basePrice" className="text-right pt-2">
                            Base Price
                        </Label>
                        <div className="col-span-3">
                            <Input 
                                id="basePrice" 
                                placeholder="Base Price" 
                                type="number" 
                                name="basePrice" 
                                value={newPlayer.basePrice} 
                                onChange={handleInputChange} 
                                className={validationErrors.basePrice ? "border-red-500" : ""}
                            />
                            {validationErrors.basePrice && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.basePrice}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="sellPrice" className="text-right pt-2">
                            Sell Price
                        </Label>
                        <div className="col-span-3">
                            <Input 
                                id="sellPrice" 
                                placeholder="Sell Price" 
                                type="number" 
                                name="sellPrice" 
                                value={newPlayer.sellPrice || ""} 
                                onChange={handleInputChange} 
                                className={validationErrors.sellPrice ? "border-red-500" : ""}
                            />
                            {validationErrors.sellPrice && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.sellPrice}</p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button className="cursor-pointer" type="button" variant="secondary" onClick={handleCancelAdd}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer" type="submit" onClick={validateAndSubmit}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPlayerDialog;