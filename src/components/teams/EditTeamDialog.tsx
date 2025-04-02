import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Team, TeamSchema, type TeamDTO } from "@/schemas/team";
import { useMutation } from "@tanstack/react-query";
import { updateTeamAction } from "@/lib/actions"; // Replace with your API call
import { toast } from "sonner";
import { useTheme } from "../theme-provider";

interface EditTeamDialogProps {
    open: boolean;
    onClose: () => void;
    team: TeamDTO;
}

export function EditTeamDialog({ open, onClose, team }: EditTeamDialogProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Team>({
        resolver: zodResolver(TeamSchema),
    });

    const { mutate: updateTeam } = useMutation({
        mutationFn: async (updatedTeam: Team) => {
            // Call your API to update the team details
            const response = await updateTeamAction(updatedTeam); // Replace with your API call
            return response;
        },
        onSuccess: () => {
            toast.success("Team updated successfully");
            window.location.href = `/app/team/${team.id}`; // Redirect to the team page
            onClose();
        },
        onError: (error: any) => {
            toast.error("Error updating team");
            console.error("Error updating team:", error);
        },
    });

    const { theme } = useTheme();

    const handleUpdateTeam = (data: Team) => {
        // Call the mutation to update the team
        updateTeam({ ...team, ...data });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={`${theme === "dark" ? "border border-white" : undefined} w-full max-w-md`}>
                <DialogHeader>
                    <DialogTitle>Update Team Details</DialogTitle>
                    <DialogDescription className="mt-2">Update the team details below</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleUpdateTeam)} className="flex flex-col space-y-4">
                    <div>
                        <Input placeholder="Name" {...register("name")} defaultValue={team.name} autoFocus />
                    </div>
                    <div>
                        <Input placeholder="Owner" {...register("owner")} defaultValue={team.owner} />
                    </div>
                    <div>
                        <Input placeholder="Coach" {...register("coach")} defaultValue={team.coach} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" type="button" onClick={onClose}>Cancel</Button>
                        <Button className="cursor-pointer" type="submit">Update</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}