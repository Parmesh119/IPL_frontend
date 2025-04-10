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
import { type Team, TeamSchema } from "@/schemas/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTeamAction } from "@/lib/actions";
import { toast } from "sonner";
import { useTheme } from "../theme-provider";
import { Label } from "../ui/label";

interface AddTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onTeamAdded: () => void;
}

export function AddTeamDialog({ isOpen, onClose, onTeamAdded }: AddTeamDialogProps) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Team>({
        resolver: zodResolver(TeamSchema),
    });

    const { mutate: addTeam } = useMutation({
        mutationFn: (data: Team) => addTeamAction(data),
        onSuccess: () => {
            toast.success("Team added successfully");
            reset();
            onClose();
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            onTeamAdded
        },
        onError: (error: any) => {
            toast.error(`Error adding team: ${error.message || "Unknown error"}`);
            console.error("Error adding team:", error);
        },
    });

    const { theme } = useTheme();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                reset();
            }
        }}>
            <DialogContent className={`${theme === "dark" ? "border border-gray-700" : ""} w-full max-w-md`}>
                <DialogHeader>
                    <DialogTitle>Add Team</DialogTitle>
                    <DialogDescription>Enter the team details below</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit((data) => addTeam(data))} className="flex flex-col space-y-4">
                    <div>
                        <Label htmlFor="name" className="mb-2 font-medium tracking-wider text-md">Team Name</Label>
                        <Input id="name" placeholder="Name" {...register("name")} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="owner" className="mb-2 font-medium tracking-wider text-md">Owner</Label>
                        <Input id="owner" placeholder="Owner" {...register("owner")} />
                        {errors.owner && <p className="text-red-500 text-sm mt-1">{errors.owner.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="coach" className="mb-2 font-medium tracking-wider text-md">Coach</Label>
                        <Input id="coach" placeholder="Coach" {...register("coach")} />
                        {errors.coach && <p className="text-red-500 text-sm mt-1">{errors.coach.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => {
                            onClose();
                            reset();
                        }} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting ? 'Adding...' : 'Add Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}