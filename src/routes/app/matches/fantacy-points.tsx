import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { z } from 'zod';
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
// Assuming getBackendUrl is not needed if URL is hardcoded/env var based
// import { getBackendUrl } from '@/lib/actions';
import { authService } from '@/lib/auth';
import { Link } from '@tanstack/react-router';
interface RawInningsBatsman {
  id: number;
  balls: number;
  runs: number;
  fours: number;
  sixes: number;
  strkRate: string;
  name: string;
  nickName: string;
  outDec: string;
  isOverseas: boolean;
  isCaptain: boolean;
  isKeeper: boolean;
  inMatchChange: string;
  playingXIChange: string;
  teamName: string;
  teamSName: string;
}

interface RawInningsBowler {
  id: number;
  overs: string;
  wickets: number;
  runs: number; // Runs conceded
  maidens: number;
  economy: string;
  name: string;
  nickName: string;
  balls: number; // Balls bowled
  isOverseas: boolean;
  isCaptain: boolean;
  isKeeper: boolean;
  inMatchChange: string;
  playingXIChange: string;
  teamName: string;
  teamSName: string;
}

// Define Zod schema for the API request payload
const FantasyPointsRequestSchema = z.object({
  points: z.record(z.string(), z.number()),
  match_id: z.string().optional(),
  iplTeam1: z.string(),
  iplTeam2: z.string(),
});

type FantasyPointsRequest = z.infer<typeof FantasyPointsRequestSchema>;

// Define Zod schema for the API response
const FantasyPointsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const Route = createFileRoute('/app/matches/fantacy-points')({
  component: FantasyPointsComponent,
});

function FantasyPointsComponent() {
  const [batsmenData, setBatsmenData] = useState<RawInningsBatsman[]>([]);
  const [bowlersData, setBowlersData] = useState<RawInningsBowler[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const pointsSentRef = useRef(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedBatsmen = localStorage.getItem('fantasy_batsmen');
        const storedBowlers = localStorage.getItem('fantasy_bowlers');

        if (storedBatsmen) {
          const batsmen = JSON.parse(storedBatsmen) as RawInningsBatsman[];
          console.log("Loaded Batsmen Data:", batsmen);
          setBatsmenData(batsmen);
        } else {
            console.log("No batsmen data found in localStorage.");
        }

        if (storedBowlers) {
          const bowlers = JSON.parse(storedBowlers) as RawInningsBowler[];
          console.log("Loaded Bowlers Data:", bowlers);
          setBowlersData(bowlers);
        } else {
            console.log("No bowlers data found in localStorage.");
        }

        setDataLoaded(true);

      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setDataLoaded(true); // Still set loaded to true to avoid infinite loading state
      }
    };
    loadData();
  }, []);

  // Effect to send points data to backend once data is loaded and available
  useEffect(() => {
    // Only proceed if data is loaded, we haven't sent points yet,
    // and there's actually data to process.
    if (dataLoaded && !pointsSentRef.current && (batsmenData.length > 0 || bowlersData.length > 0)) {
      console.log("Data loaded and points not sent yet. Attempting to send points.");
      sendPointsToBackend();
    } else if (dataLoaded && pointsSentRef.current) {
        console.log("Data loaded, but points have already been sent.");
    } else if (dataLoaded && batsmenData.length === 0 && bowlersData.length === 0) {
        console.log("Data loaded, but no player data available to calculate points.");
    }

  }, [dataLoaded, batsmenData, bowlersData]); // Dependencies: run when loading finishes or data changes


  // --- Point Calculation Logic (UNCHANGED as requested) ---

  const calculateBatsmanPoints = (batsman: RawInningsBatsman): number => {
    let points = 0;
    points += batsman.runs;
    if (batsman.fours) points += batsman.fours * 4;
    if (batsman.sixes) points += batsman.sixes * 6;
    const strikeRate = parseFloat(batsman.strkRate);
    if (batsman.balls >= 10 && !isNaN(strikeRate)) {
        if (strikeRate > 170) points += 6;
        else if (strikeRate >= 150.01 && strikeRate <= 170) points += 4;
        else if (strikeRate >= 130 && strikeRate <= 150) points += 2;
        else if (strikeRate >= 60 && strikeRate <= 69.99) points -= 2;
        else if (strikeRate >= 50 && strikeRate <= 59.99) points -= 4;
        else if (strikeRate < 50) points -= 6;
    }
     if (batsman.runs) {
      if (batsman.runs >= 100) points += 16;
      else if (batsman.runs >= 75) points += 12;
      else if (batsman.runs >= 50) points += 8;
      else if (batsman.runs >= 25) points += 4;
      if (batsman.outDec !== "not out" && batsman.outDec !== "did not bat") {
        if (batsman.runs === 0 && !batsman.outDec.startsWith("run out")) {
            points -= 2;
        }
      }
    }
    points += 4;
    return points;
  };

  const calculateBowlerPoints = (bowler: RawInningsBowler): number => {
    let points = 0;
    const overs = parseFloat(bowler.overs);
    batsmenData.forEach((batsman) => {
      const { reason, player, bowler: dismissalBowler } = parseOutDec(batsman.outDec);
      if (dismissalBowler === bowler.name) {
        if (reason === "run out" && player === bowler.name) {
          console.log(`Run out involving bowler ${bowler.name}, no standard wicket points added based on original code comment.`);
        } else if (reason === "leg before wicket" || reason === "bowled") {
          points += 30;
          points += 8;
        } else if (reason !== "run out") {
          points += 30;
        }
      }
    });
    if (bowler.maidens) points += (bowler.maidens * 12);
    if (bowler.wickets === 3) points += 4;
    if (bowler.wickets === 4) points += 8;
    if (bowler.wickets === 5) points += 12;
    if (bowler.wickets > 5) points += 12;
    const economyRate = parseFloat(bowler.economy);
    if (overs >= 2 && !isNaN(economyRate)) {
      if (economyRate < 5) points += 6;
      else if (economyRate >= 5.00 && economyRate <= 5.99) points += 4;
      else if (economyRate >= 6.00 && economyRate <= 6.99) points += 2;
      else if (economyRate >= 10.00 && economyRate <= 10.99) points -= 2;
      else if (economyRate >= 11.00 && economyRate <= 11.99) points -= 4;
      else if (economyRate > 12.00) points -= 6;
    }
    points += 4;
    const fieldingPoints: { [key: string]: number } = {};
    batsmenData.forEach((batsman) => {
      const { reason, player, bowler } = parseOutDec(batsman.outDec);
      if (reason === "caught") {
        if (player) {
          fieldingPoints[player] = (fieldingPoints[player] || 0) + 8;
        }
      } else if (reason === "stumped") {
        if (player) {
          fieldingPoints[player] = (fieldingPoints[player] || 0) + 12;
        }
      } else if (reason === "run out") {
        if (player) {
           const isWK = batsmenData.some((b) => b.name === player && b.isKeeper);
           const isBowler = bowlersData.some((b) => b.name === player);
           if (isWK || isBowler) {
             fieldingPoints[player] = (fieldingPoints[player] || 0) + 6;
           } else {
             fieldingPoints[player] = (fieldingPoints[player] || 0) + 12;
           }
        }
      }
    });
    Object.keys(fieldingPoints).forEach((player) => {
      const catchCount = batsmenData.filter((batsman) => {
        const { reason, player: catcher } = parseOutDec(batsman.outDec);
        return reason === "caught" && catcher === player;
      }).length;
      if (catchCount >= 3) {
        fieldingPoints[player] += 4;
      }
    });
    const bowlersFieldingPoints = fieldingPoints[bowler.name] || 0;
    points += bowlersFieldingPoints;
    return points;
  };


  const parseOutDec = (outDec: string): { reason: string, player: string | null, bowler: string | null } => {
     // Keeping user's original parsing logic exactly
    if (!outDec || outDec === "not out" || outDec === "did not bat") {
      return { reason: outDec, player: null, bowler: null };
    }
    let reason = "";
    let player = null;
    let bowler = null;
    if (outDec.startsWith("c and b ")) {
      reason = "caught and bowled";
      bowler = outDec.replace("c and b ", "").trim();
      player = bowler;
    } else if (outDec.startsWith("b ")) {
      reason = "bowled";
      bowler = outDec.replace("b ", "").trim();
    } else if (outDec.startsWith("c ")) {
      reason = "caught";
      const parts = outDec.split(" b ");
      if (parts.length === 2) {
        player = parts[0].replace("c ", "").trim();
        bowler = parts[1].trim();
      }
    } else if (outDec.startsWith("lbw b ")) {
      reason = "leg before wicket";
      bowler = outDec.replace("lbw b ", "").trim();
    } else if (outDec.startsWith("st ")) {
      reason = "stumped";
      const parts = outDec.split(" b ");
      if (parts.length === 2) {
        player = parts[0].replace("st ", "").trim();
        bowler = parts[1].trim();
      }
    } else if (outDec.startsWith("run out")) {
      reason = "run out";
      const match = outDec.match(/\((.*?)\)/);
      if (match) {
        player = match[1].trim();
      }
    } else {
        reason = "other";
        console.warn("Unparsed outDec format:", outDec);
    }
    return { reason, player, bowler };
  };

  // --- Function to send points to backend (Using original aggregation logic) ---
  const sendPointsToBackend = async () => {
    try {
      if (pointsSentRef.current || !dataLoaded) {
          console.log(`Skipping sendPointsToBackend: pointsSentRef=${pointsSentRef.current}, dataLoaded=${dataLoaded}`);
          return;
      }
      const pointsMap: Record<string, number> = {};
      let iplTeam1 = "";
      let iplTeam2 = "";
      console.log("Calculating batting points for payload...");
      batsmenData.forEach((batsman) => {
        if (!iplTeam1) { iplTeam1 = batsman.teamName || "UnknownTeam1"; }
        else if (!iplTeam2 && batsman.teamName && batsman.teamName !== iplTeam1) { iplTeam2 = batsman.teamName; }
        const calculatedPoints = calculateBatsmanPoints(batsman);
        pointsMap[batsman.name] = calculatedPoints;
        console.log(` -> ${batsman.name} (Batting): ${calculatedPoints}`);
      });
      console.log("Calculating bowling points for payload (will ADD to existing batting points)...");
      bowlersData.forEach((bowler) => {
         if (!iplTeam1) { iplTeam1 = bowler.teamName || "UnknownTeam1"; }
         else if (!iplTeam2 && bowler.teamName && bowler.teamName !== iplTeam1) { iplTeam2 = bowler.teamName; }
        const calculatedPoints = calculateBowlerPoints(bowler);
        if (pointsMap[bowler.name]) {
          console.log(` -> ${bowler.name} (Bowling - ADDING): ${calculatedPoints}. Previous: ${pointsMap[bowler.name]}. New Total: ${pointsMap[bowler.name] + calculatedPoints}`);
          pointsMap[bowler.name] += calculatedPoints;
        } else {
          console.log(` -> ${bowler.name} (Bowling - ASSIGNING): ${calculatedPoints}`);
          pointsMap[bowler.name] = calculatedPoints;
        }
      });
       if (iplTeam1 && !iplTeam2) {
           console.warn("Could not determine second IPL team name.");
           iplTeam2 = "UnknownTeam2";
       }
        if (!iplTeam1) {
            console.error("Could not determine any IPL team names.");
            iplTeam1 = "UnknownTeam1";
            iplTeam2 = "UnknownTeam2";
        }
      const match_id = new URLSearchParams(window.location.search).get("match_id") || undefined;
      const payload: FantasyPointsRequest = {
        points: pointsMap,
        match_id,
        iplTeam1: iplTeam1,
        iplTeam2: iplTeam2,
      };
      console.log("--- Sending Payload to Backend ---");
      console.log("Match ID:", payload.match_id);
      console.log("Team 1:", payload.iplTeam1);
      console.log("Team 2:", payload.iplTeam2);
      console.log("Points Map:", JSON.stringify(payload.points, null, 2));
      console.log("---------------------------------");
      const validatedPayload = FantasyPointsRequestSchema.parse(payload);
      const accessToken = await authService.getAccessToken();
      if (!accessToken) {
          console.error("No access token found. Cannot send points.");
          return;
      }
      const backendUrl = `http://localhost:8080/api/ipl/matches/fantacy-points`;
      const response = await axios.post(
        backendUrl,
        validatedPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const validatedResponse = FantasyPointsResponseSchema.parse(response.data);
      if (validatedResponse.success) {
        console.log("Fantasy points data sent successfully:", validatedResponse.message || "Success");
        pointsSentRef.current = true;
      } else {
        console.error("Backend reported failure sending fantasy points:", validatedResponse.message || "No message provided.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
            console.error("Payload or Response Validation Error:", error.errors);
      } else if (axios.isAxiosError(error)) {
            console.error("Axios Error sending fantasy points data:", error.response?.status, error.response?.data || error.message);
      } else {
            console.error("Generic Error sending fantasy points data:", error);
      }
    }
  };

  // --- Rendering Logic ---
  const containerClasses = "px-4 mb-6 max-w-full mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen";
  const tableHeaderClasses = "bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10"; // Keep header sticky
  const tableRowClasses = "hover:bg-gray-50 dark:hover:bg-gray-700";
  const tableBorderClasses = "border border-gray-200 dark:border-gray-700";
  const tableCellClasses = `p-2 text-sm text-gray-900 dark:text-white ${tableBorderClasses}`;
  const tableClasses = `min-w-full bg-white dark:bg-gray-800 ${tableBorderClasses} divide-y divide-gray-200 dark:divide-gray-700`;
  
  return (
    <SidebarInset className="w-full flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 mb-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <Link to="/app/matches"><BreadcrumbLink href="#">Matches</BreadcrumbLink></Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Fantasy Points</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Scrollable Content Area */}
      {/* The main container now handles scrolling for the entire page content if needed */}
      <div className={`${containerClasses} flex-grow overflow-y-auto mb-6`}>
        <div className="flex justify-between items-center pt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fantasy Points Display</h1>
        </div>

        {!dataLoaded ? (
          <div className="text-center p-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading fantasy points data...</p>
            {/* Consider adding a spinner here */}
          </div>
        ) : (batsmenData.length === 0 && bowlersData.length === 0) ? (
           <div className="text-center p-8 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md">
            <p className="text-lg text-yellow-800 dark:text-yellow-200">No player data found in local storage.</p>
          </div>
        ) : (
          <>
            {/* Batsmen Table */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Batsmen Points (Display Only)</h2>
              {/* Removed max-h and outer overflow-y-auto from this div */}
              <div className="overflow-x-auto shadow rounded-lg border dark:border-gray-700">
                <table className={tableClasses}>
                  <thead className={tableHeaderClasses}>
                    <tr>
                      <th className={`${tableCellClasses} sticky left-0 bg-gray-100 dark:bg-gray-800 z-20`}>Name</th>
                      <th className={tableCellClasses}>Team</th>
                      <th className={tableCellClasses}>Runs</th>
                      <th className={tableCellClasses}>Balls</th>
                      <th className={tableCellClasses}>4s</th>
                      <th className={tableCellClasses}>6s</th>
                      <th className={tableCellClasses}>SR</th>
                      <th className={tableCellClasses}>Fantasy Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {batsmenData.map((batsman) => (
                      <tr key={`disp-bat-${batsman.id}-${batsman.name}`} className={tableRowClasses}>
                        <td className={`${tableCellClasses} sticky left-0 bg-white dark:bg-gray-800 z-10 whitespace-nowrap`}>
                          {batsman.name}
                          {batsman.isCaptain && <span className="ml-1 text-xs font-semibold text-blue-600 dark:text-blue-400">(C)</span>}
                          {batsman.isKeeper && <span className="ml-1 text-xs font-semibold text-green-600 dark:text-green-400">(WK)</span>}
                        </td>
                        <td className={tableCellClasses}>{batsman.teamSName || "N/A"}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.runs ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.balls ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.fours ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.sixes ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.strkRate || "0.00"}</td>
                        <td className={`${tableCellClasses} text-center font-semibold`}>
                          {calculateBatsmanPoints(batsman)}
                        </td>
                      </tr>
                    ))}
                    {batsmenData.length === 0 && (
                      <tr>
                        <td colSpan={8} className={`${tableCellClasses} text-center py-4 text-gray-500 dark:text-gray-400`}>No batsmen data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowlers Table */}
            {/* Add some margin-bottom if needed */}
            <div className="mb-8"> 
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bowlers Points (Display Only)</h2>
               {/* Removed max-h and outer overflow-y-auto from this div */}
               <div className="overflow-x-auto shadow rounded-lg border dark:border-gray-700">
                <table className={tableClasses}>
                  <thead className={tableHeaderClasses}>
                    <tr>
                      <th className={`${tableCellClasses} sticky left-0 bg-gray-100 dark:bg-gray-800 z-20`}>Name</th>
                      <th className={tableCellClasses}>Team</th>
                      <th className={tableCellClasses}>Overs</th>
                      <th className={tableCellClasses}>Mdns</th>
                      <th className={tableCellClasses}>Runs</th>
                      <th className={tableCellClasses}>Wkts</th>
                      <th className={tableCellClasses}>Econ</th>
                      <th className={tableCellClasses}>Fantasy Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {bowlersData.map((bowler) => (
                      <tr key={`disp-bowl-${bowler.id}-${bowler.name}`} className={tableRowClasses}>
                        <td className={`${tableCellClasses} sticky left-0 bg-white dark:bg-gray-800 z-10 whitespace-nowrap`}>
                          {bowler.name}
                          {bowler.isCaptain && <span className="ml-1 text-xs font-semibold text-blue-600 dark:text-blue-400">(C)</span>}
                        </td>
                        <td className={tableCellClasses}>{bowler.teamSName || "N/A"}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.overs}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.maidens ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.runs ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.wickets ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.economy || "0.00"}</td>
                        <td className={`${tableCellClasses} text-center font-semibold`}>
                          {calculateBowlerPoints(bowler)}
                        </td>
                      </tr>
                    ))}
                    {bowlersData.length === 0 && (
                      <tr>
                        <td colSpan={8} className={`${tableCellClasses} text-center py-4 text-gray-500 dark:text-gray-400`}>No bowlers data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div> {/* End of scrollable content area */}
    </SidebarInset>
  );
}