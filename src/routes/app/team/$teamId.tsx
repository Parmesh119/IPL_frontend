import { createFileRoute, Link } from '@tanstack/react-router'
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react"; // Example icon import

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Using Input for visual similarity, but set to readOnly
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export const Route = createFileRoute('/app/team/$teamId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      teamId: params.teamId,
    };
  },
})

const teamData = {
  name: "Kaivan",
  amountSpent: 100, // Assuming 100 is the total spent budget or similar
  totalPlayers: 19,
  batsmenCount: 4,
  bowlersCount: 10,
  allRoundersCount: 5,
  playersBought: [
    {
      srNo: 1,
      player: "Riyan Parag",
      iplTeam: "RR",
      role: "Batsman",
      price: 9.5,
    },
    {
      srNo: 2,
      player: "Player Two", // Placeholder
      iplTeam: "CSK", // Placeholder
      role: "Bowler", // Placeholder
      price: 8.0, // Placeholder
    },
    {
      srNo: 3,
      player: "Player Three", // Placeholder
      iplTeam: "MI", // Placeholder
      role: "All Rounder", // Placeholder
      price: 11.2, // Placeholder
    },
  ],
};

function RouteComponent() {

  const { teamId } = Route.useLoaderData();

  return <div className='flex flex-col gap-4 w-full'>
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className='tracking-wider'>
              <BreadcrumbItem>
                <Link to="/app/team"><BreadcrumbLink>Teams</BreadcrumbLink></Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Team Information</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className='text-red-600'>

        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* 1. Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {/* Optional Back Button */}
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-semibold tracking-tight">
                Team : {teamData.name}
              </h1>
            </div>
            <Button size="sm">Edit</Button>
          </div>

          {/* 2. Team Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="teamName">Name</Label>
              <Input id="teamName" value={teamData.name} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="amountSpent">Amount Spent</Label>
              <Input id="amountSpent" value={teamData.amountSpent} readOnly className="mt-1" />
              {/* Green "M" icon from image - this would require custom styling or an SVG */}
              {/* <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">M</div> */}
              {/* Note: Positioning the 'M' exactly like the image needs careful absolute positioning relative to the input's parent div */}
            </div>
            <div>
              <Label htmlFor="totalPlayers">Total Players</Label>
              <Input id="totalPlayers" value={teamData.totalPlayers} readOnly className="mt-1" />
            </div>
          </div>



          {/* 3. Players Bought Summary */}
          <h2 className="text-xl font-semibold tracking-tight mb-4">Players Bought</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Batsmen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamData.batsmenCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Bowlers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamData.bowlersCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">All Rounders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamData.allRoundersCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Players Table */}
          <Card>
            {/* Optional: Add CardHeader for table title if desired */}
            {/* <CardHeader><CardTitle>Player List</CardTitle></CardHeader> */}
            <CardContent className="p-0"> {/* Remove padding if table borders touch card edge */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Sr. No.</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>IPL Team</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData.playersBought.map((player) => (
                    <TableRow key={player.srNo}>
                      <TableCell className="font-medium">{player.srNo}</TableCell>
                      <TableCell>{player.player}</TableCell>
                      <TableCell>{player.iplTeam}</TableCell>
                      <TableCell>{player.role}</TableCell>
                      <TableCell className="text-right">{player.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {/* Optional: Add CardFooter for pagination or summary */}
          </Card>

        </div>
      </div>
    </SidebarInset>
  </div>
}
