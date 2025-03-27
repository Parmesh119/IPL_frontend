import { User, Home, ChevronUp, User2, Shield, Trophy, Settings, LayoutDashboard } from "lucide-react"

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

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Players",
        url: "#",
        icon: User,
    },
    {
        title: "Teams",
        url: "#",
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

    const navigate = useNavigate()
    
    const hadleLogout = () => {
        localStorage.clear()
        navigate({ to: "/auth/login" })
    }


    return (
        <Sidebar>
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
                                        <span>Username</span>
                                        <ChevronUp className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    sideOffset={10}
                                    className="w-[--radix-popper-anchor-width] ml-24"
                                >
                                    <DropdownMenuItem className="cursor-pointer">
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <span>Billing</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <span>Change mode</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={hadleLogout} className="cursor-pointer">
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
