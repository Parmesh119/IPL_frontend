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
import { useMutation } from "@tanstack/react-query";
import { addTeamAction } from "@/lib/actions";
import { toast } from "sonner";
import { useTheme } from "../theme-provider";
import { useRouter } from "@tanstack/react-router";

interface AddTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTeamDialog({ isOpen, onClose }: AddTeamDialogProps) {

    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Team>({
        resolver: zodResolver(TeamSchema),
    });

    const { mutate: addTeam } = useMutation({
        mutationFn: (data: Team) => addTeamAction(data),
        onSuccess: () => {
            toast.success("Team added successfully");
            window.location.href = "/app/team"
            onClose();
        },
        onError: (error: any) => {
            toast.error("Error adding team");
            console.error("Error adding team:", error);
        },
    });

    const { theme } = useTheme();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${theme === "dark" ? "border border-white" : undefined} w-full max-w-md`}>
                <DialogHeader>
                    <DialogTitle>Add Team</DialogTitle>
                    <DialogDescription>Enter the team details below</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit((data) => addTeam(data))} className="flex flex-col space-y-4">
                    <div>
                        <Input placeholder="Name" {...register("name")} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Input placeholder="Owner" {...register("owner")} />
                        {errors.owner && <p className="text-red-500 text-sm">{errors.owner.message}</p>}
                    </div>
                    <div>
                        <Input placeholder="Coach" {...register("coach")} />
                        {errors.coach && <p className="text-red-500 text-sm">{errors.coach.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" type="button" onClick={onClose}>Cancel</Button>
                        <Button className="cursor-pointer" type="submit">Add</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
