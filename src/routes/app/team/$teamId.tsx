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


export const Route = createFileRoute('/app/team/$teamId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      teamId: params.teamId,
    };
  },
})

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
      <div className='text-red-600'>{teamId}</div>
    </SidebarInset>
  </div>
}
