import { User, Home, ChevronUp, User2, Shield, Trophy, Settings, LayoutDashboard } from "lucide-react"
import { BadgeCheck, LogOut, Moon, Sun, ReceiptIndianRupeeIcon } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Link } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import { useMutation } from "@tanstack/react-query"
import { getUserDetails } from "@/lib/actions"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Dashboard",
        url: "/app/dashboard/",
        icon: LayoutDashboard,
    },
    {
        title: "Players",
        url: "/app/players/",
        icon: User,
    },
    {
        title: "Teams",
        url: "/app/teams/",
        icon: Shield,
    },
    {
        title: "Matches",
        url: "#",
        icon: Trophy,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {

    useEffect(() => {
        profileMutation.mutate()
    }, [])
    const { setTheme, theme } = useTheme()
    const [username, setUsername] = useState("")
    const navigate = useNavigate()

    const hadleLogout = () => {
        localStorage.clear()
        navigate({ to: "/auth/login" })
    }
    
    const profileMutation = useMutation({
        mutationFn: getUserDetails,
        onSuccess: (data) => {
            setUsername(data.username)
        },
        onError: (error) => {
            toast.error("Error fetching user details")
            console.log(error.message)
        }
    })

    return (
        <Sidebar className="rounded-xl">
            <SidebarContent className="cursor-pointer" >
                <SidebarGroup>
                    <SidebarGroupLabel className="tracking-wider">Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center space-x-2">
                                    <User2 />
                                    <span>{username ? username : "User"}</span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                sideOffset={10}
                                className="w-[--radix-popper-anchor-width] ml-24"
                            >
                                <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer flex items-center space-x-2">
                                    <ReceiptIndianRupeeIcon className="w-4 h-4" />
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setTheme(theme === "light" ? "dark" : "light")
                                    }}
                                    className="cursor-pointer flex items-center space-x-2"
                                >
                                    {theme === "light" ? (
                                        <Moon className="w-4 h-4" />
                                    ) : (
                                        <Sun className="w-4 h-4" />
                                    )}
                                    <span>Change mode</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={hadleLogout}
                                    className="cursor-pointer flex items-center space-x-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
