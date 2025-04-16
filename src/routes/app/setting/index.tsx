import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from '@tanstack/react-query';
import { type Settings } from '@/schemas/setting';
import { updateSettingsAction, getSettingsAction } from "@/lib/actions"

export const Route = createFileRoute('/app/setting/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { theme } = useTheme();
  
  // Initialize state first, before any conditional returns
  const [settings, setSettings] = useState({
    maxPlayers: 23,
    minPlayers: 15,
    budgetLimit: 100,
    maxTeam: 1
  });

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await getSettingsAction();
      return data;
    },
  });

  // Update settings when data loads
  useEffect(() => {
    if (settingsData) {
      setSettings({
        maxPlayers: settingsData.maxPlayers,
        minPlayers: settingsData.minPlayers,
        budgetLimit: settingsData.budgetLimit,
        maxTeam: settingsData.maxTeam,
      });
    }
  }, [settingsData]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const settingsToUpdate: Settings = {
        maxPlayers: settings.maxPlayers,
        minPlayers: settings.minPlayers,
        budgetLimit: settings.budgetLimit,
        maxTeam: settings.maxTeam,
      };
      return await updateSettingsAction(settingsToUpdate);
    },
    onSuccess: (data) => {
      if (data) {
        setSettings(data);
      }
      toast.success('Settings updated successfully!', {
        style: {
          background: "linear-gradient(90deg, #38A169, #2F855A)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
    },
    onError: () => {
      toast.error('Failed to update settings.', {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
    },
  });

  const handleSaveSettings = () => {
    // Validation
    if ((settings.minPlayers ?? 0) > (settings.maxPlayers ?? 0)) {
      toast.error('Minimum players cannot exceed maximum players.', {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      return;
    }
    if ((settings.budgetLimit ?? 0) <= 0) {
      toast.error('Budget limit must be greater than 0.', {
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      });
      return;
    }
    // Send to backend
    updateSettings.mutate();
  };

  // Early returns are now after all hooks have been declared
  if (isLoading) return <div>Loading...</div>;
  if (error) {
    toast.error('Failed to load settings.', {
      style: {
        background: "linear-gradient(90deg, #E53E3E, #C53030)",
        color: "white",
        fontWeight: "bolder",
        fontSize: "13px",
        letterSpacing: "1px",
    }
    });
    return <div>Error loading settings</div>;
  }

  return (
    <div className={`w-full h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <SidebarInset className="w-full">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList className="tracking-wider">
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Separator className="mb-4" />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maximum Players */}
            <Card className={`w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
              <CardHeader>
                <CardTitle>Maximum Players in a Team</CardTitle>
                <CardDescription>Set the maximum number of players allowed in a team.</CardDescription>
              </CardHeader>
              <CardContent className="mt-2">
                <Input
                  type="number"
                  name="maxPlayers"
                  value={settings.maxPlayers}
                  onChange={(e) => setSettings({ ...settings, maxPlayers: Number(e.target.value) })}
                  placeholder="Enter maximum players"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Minimum Players */}
            <Card className={`w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
              <CardHeader>
                <CardTitle>Minimum Players in a Team</CardTitle>
                <CardDescription>Set the minimum number of players required in a team.</CardDescription>
              </CardHeader>
              <CardContent className="mt-2">
                <Input
                  type="number"
                  name="minPlayers"
                  value={settings.minPlayers}
                  onChange={(e) => setSettings({ ...settings, minPlayers: Number(e.target.value) })}
                  placeholder="Enter minimum players"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Budget Limit */}
            <Card className={`w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
              <CardHeader>
                <CardTitle>Budget Limit (in Crores)</CardTitle>
                <CardDescription>Set the maximum budget allowed for a team.</CardDescription>
              </CardHeader>
              <CardContent className="mt-2">
                <Input
                  type="number"
                  name="budgetLimit"
                  value={settings.budgetLimit}
                  onChange={(e) => setSettings({ ...settings, budgetLimit: Number(e.target.value) })}
                  placeholder="Enter budget limit"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Maximum Team can create by one user */}
            <Card className={`w-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
              <CardHeader>
                <CardTitle>Maximum Team</CardTitle>
                <CardDescription>Maximum Team can be create by one user.</CardDescription>
              </CardHeader>
              <CardContent className="mt-2">
                <Input
                  type="number"
                  name="maxTeam"
                  value={settings.maxTeam}
                  onChange={(e) => setSettings({ ...settings, maxTeam: Number(e.target.value) })}
                  placeholder="Enter maximum team"
                  className="w-full"
                />
              </CardContent>
            </Card>

          </div>

          <div className="mt-10 flex justify-center">
            <Button onClick={handleSaveSettings} className="px-6 py-2 cursor-pointer">
              Save Settings
            </Button>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}