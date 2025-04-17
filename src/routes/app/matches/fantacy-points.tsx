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
import { getBackendUrl } from '@/lib/actions';
import { authService } from '@/lib/auth';
import { get } from 'lodash';

// Define the interfaces for the data
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
  runs: number;
  maidens: number;
  economy: string;
  name: string;
  nickName: string;
  balls: number;
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

  // Use useRef to track if we've already sent the request
  const pointsSentRef = useRef(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedBatsmen = localStorage.getItem('fantasy_batsmen');
        const storedBowlers = localStorage.getItem('fantasy_bowlers');

        if (storedBatsmen) {
          const batsmen = JSON.parse(storedBatsmen) as RawInningsBatsman[];
          console.log("Batsmen Data:", batsmen);
          setBatsmenData(batsmen);
        }

        if (storedBowlers) {
          const bowlers = JSON.parse(storedBowlers) as RawInningsBowler[];
          console.log("Bowlers Data:", bowlers);
          setBowlersData(bowlers);
        }

        setDataLoaded(true);

      } catch (error) {
        console.error("Error loading data:", error);
        setDataLoaded(true); // Still set loaded to true to avoid infinite loading state
      }
    };
    loadData();
  }, []);

  // Effect to send points data to backend once data is loaded
  useEffect(() => {
    // Only proceed if data is loaded and we haven't sent points yet
    if (dataLoaded && !pointsSentRef.current && (batsmenData.length > 0 || bowlersData.length > 0)) {
      sendPointsToBackend();
    }
  }, [dataLoaded, batsmenData, bowlersData]);

  const calculateBatsmanPoints = (batsman: RawInningsBatsman) => {
    let points = 0;
    points += batsman.runs;

    if (batsman.fours) points += batsman.fours * 4;
    if (batsman.sixes) points += batsman.sixes * 6;

    const strikeRate = parseFloat(batsman.strkRate);
    if (batsman.balls && batsman.balls >= 10 && !isNaN(strikeRate)) {
      if (strikeRate > 170) points += 6;
      else if (strikeRate >= 150.01 && strikeRate <= 170) points += 4;
      else if (strikeRate >= 130 && strikeRate <= 150) points += 2;
      else if (strikeRate >= 70 && strikeRate < 130) points += 0;
      else if (strikeRate >= 60 && strikeRate < 69.99) points -= 2;
      else if (strikeRate >= 50 && strikeRate < 59.99) points -= 4;
      else if (strikeRate < 50) points -= 6;
    }

    if (batsman.runs) {
      if (batsman.runs >= 100) points += 16;
      else if (batsman.runs >= 75) points += 12;
      else if (batsman.runs >= 50) points += 8;
      else if (batsman.runs >= 25) points += 4;
      if (batsman.outDec !== "not out" && batsman.outDec !== "did not bat") {
        if (batsman.runs === 0) points -= 2;
      }
    }

    // Points for being in playing XI
    points += 4;

    return points;
  };

  const calculateBowlerPoints = (bowler: RawInningsBowler) => {
    let points = 0;
    const overs = parseFloat(bowler.overs);

    batsmenData.forEach((batsman) => {
      const { reason, player, bowler: dismissalBowler } = parseOutDec(batsman.outDec);

      if (dismissalBowler === bowler.name) {
        if (reason === "run out" && player === bowler.name) {
          console.log(`Run out by bowler ${bowler.name}, no wicket points added.`);
        } else if (reason === "leg before wicket" || reason === "bowled") {
          points += 30;
          points += 8;
        } else {
          points += 30;
        }
      }
    });

    if (bowler.maidens) points += (bowler.maidens * 12);
    if (bowler.wickets === 3) points += 4;
    if (bowler.wickets === 4) points += 8;
    if (bowler.wickets === 5) points += 12;

    const economyRate = parseFloat(bowler.economy);
    if (overs >= 2 && !isNaN(economyRate)) {
      if (economyRate < 5) points += 6;
      else if (economyRate >= 5.00 && economyRate < 5.99) points += 4;
      else if (economyRate >= 6.00 && economyRate <= 6.99) points += 2;
      else if (economyRate >= 7.00 && economyRate <= 9.99) points += 0;
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
          fieldingPoints[player] = (fieldingPoints[player] || 0) + 12; // Add 12 points for stumping
        }
      } else if (reason === "run out") {
        if (player) {
          const isWK = batsmenData.some((b) => b.name === player && b.isKeeper);
          const isBowler = bowlersData.some((b) => b.name === player);

          if (isWK || isBowler) {
            fieldingPoints[player] = (fieldingPoints[player] || 0) + 6; // Add 6 points for WK or bowler
          } else {
            fieldingPoints[player] = (fieldingPoints[player] || 0) + 12; // Add 12 points for others
          }
        }
      }
    });

    // Add extra points for players who took 3 or more catches
    Object.keys(fieldingPoints).forEach((player) => {
      const catchCount = batsmenData.filter((batsman) => {
        const { reason, player: catcher } = parseOutDec(batsman.outDec);
        return reason === "caught" && catcher === player;
      }).length;

      if (catchCount >= 3) {
        fieldingPoints[player] += 4; // Add 4 extra points for 3 or more catches
      }
    });

    return points;
  };

  const parseOutDec = (outDec: string) => {
    if (!outDec || outDec === "not out" || outDec === "did not bat") {
      return { reason: outDec, player: null, bowler: null };
    }

    let reason = "";
    let player = null;
    let bowler = null;

    if (outDec.startsWith("c and b ")) {
      reason = "caught and bowled";
      bowler = outDec.replace("c and b ", "").trim(); // Extract bowler name
    } else if (outDec.startsWith("b ")) {
      reason = "bowled";
      bowler = outDec.replace("b ", "").trim(); // Extract bowler name
    } else if (outDec.startsWith("c ")) {
      reason = "caught";
      const parts = outDec.split(" b ");
      if (parts.length === 2) {
        player = parts[0].replace("c ", "").trim(); // Extract player who took the catch
        bowler = parts[1].trim(); // Extract bowler name
      }
    } else if (outDec.startsWith("lbw b ")) {
      reason = "leg before wicket";
      bowler = outDec.replace("lbw b ", "").trim(); // Extract bowler name
    } else if (outDec.startsWith("st ")) {
      reason = "stumped";
      const parts = outDec.split(" b ");
      if (parts.length === 2) {
        player = parts[0].replace("st ", "").trim(); // Extract player who did the stumping
        bowler = parts[1].trim(); // Extract bowler name
      }
    } else if (outDec.startsWith("run out")) {
      reason = "run out";
      const match = outDec.match(/\((.*?)\)/); // Extract player name inside parentheses
      if (match) {
        player = match[1].trim(); // Extract player who caused the run out
      }
    }

    return { reason, player, bowler };
  };

  // Function to send points to backend
  const sendPointsToBackend = async () => {
    try {
      // Skip if we've already sent the points
      if (pointsSentRef.current) {
        return;
      }

      // Create a map of player name to total points (batting + bowling)
      const pointsMap: Record<string, number> = {};

      // Add batsmen points
      let iplTeam1 = "";
      batsmenData.forEach(batsman => {
        if (!iplTeam1) {
          iplTeam1 = batsman.teamName;
        }
        pointsMap[batsman.name] = calculateBatsmanPoints(batsman);
      });

      // Add or update with bowler points
      let iplTeam2 = "";
      bowlersData.forEach((bowler) => {
        if (!iplTeam2 && bowler.teamSName !== iplTeam1) {
          iplTeam2 = bowler.teamName; // Set team 2 from bowlers data if it's different from team 1
        }
        if (pointsMap[bowler.name]) {
          pointsMap[bowler.name] += calculateBowlerPoints(bowler);
        } else {
          pointsMap[bowler.name] = calculateBowlerPoints(bowler);
        }
      });

      const match_id = new URLSearchParams(window.location.search).get('match_id') || undefined;
      
      const payload: FantasyPointsRequest = {
        points: pointsMap,
        match_id,
        iplTeam1: iplTeam1,
        iplTeam2: iplTeam2,
      };

      // Validate request payload
      const validatedPayload = FantasyPointsRequestSchema.parse(payload);
      
      // Make the API call
      const accessToken = await authService.getAccessToken();
      const response = await axios.post(`http://localhost:8080/api/ipl/matches/fantacy-points`,
        validatedPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      // Validate response
      const validatedResponse = FantasyPointsResponseSchema.parse(response.data);

      if (validatedResponse.success) {
        console.log('Fantasy points data sent successfully:', validatedResponse.message);
      } else {
        console.error('Failed to send fantasy points:', validatedResponse.message);
      }

      // Mark that we've sent the points to prevent duplicate calls
      pointsSentRef.current = true;

    } catch (error) {
      console.error('Error sending fantasy points data:', error);
    }
  };

  // Use Tailwind dark mode prefix for classes
  const containerClasses = "p-4 max-w-full mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen";
  const tableHeaderClasses = "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white";
  const tableRowClasses = "hover:bg-gray-50 dark:hover:bg-gray-700";
  const tableBorderClasses = "border border-gray-200 dark:border-gray-700";
  const tableCellClasses = `p-2 ${tableBorderClasses}`;
  const tableClasses = `min-w-full bg-white dark:bg-gray-800 ${tableBorderClasses}`;

  return (
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="tracking-wider">
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Matches</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Fantasy-Points</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className={containerClasses}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fantasy Points</h1>
        </div>

        {dataLoaded ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Batsmen Points</h2>
              <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <table className={tableClasses}>
                  <thead>
                    <tr className={tableHeaderClasses}>
                      <th className={tableCellClasses}>Name</th>
                      <th className={tableCellClasses}>Team</th>
                      <th className={tableCellClasses}>Runs</th>
                      <th className={tableCellClasses}>Balls</th>
                      <th className={tableCellClasses}>4s</th>
                      <th className={tableCellClasses}>6s</th>
                      <th className={tableCellClasses}>SR</th>
                      <th className={tableCellClasses}>Fantasy Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batsmenData.map((batsman) => (
                      <tr key={batsman.id} className={tableRowClasses}>
                        <td className={tableCellClasses}>
                          {batsman.name}
                          {batsman.isCaptain && " (C)"}
                          {batsman.isKeeper && " (WK)"}
                        </td>
                        <td className={tableCellClasses}>
                          {batsman.teamSName || "N/A"}
                        </td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.runs ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.balls ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.fours ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.sixes ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{batsman.strkRate}</td>
                        <td className={`${tableCellClasses} text-center font-semibold`}>
                          {calculateBatsmanPoints(batsman)}
                        </td>
                      </tr>
                    ))}
                    {batsmenData.length === 0 && (
                      <tr>
                        <td colSpan={8} className={`${tableCellClasses} text-center py-4`}>No batsmen data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bowlers Points</h2>
              <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <table className={tableClasses}>
                  <thead>
                    <tr className={tableHeaderClasses}>
                      <th className={tableCellClasses}>Name</th>
                      <th className={tableCellClasses}>Team</th>
                      <th className={tableCellClasses}>Overs</th>
                      <th className={tableCellClasses}>Maidens</th>
                      <th className={tableCellClasses}>Runs</th>
                      <th className={tableCellClasses}>Wickets</th>
                      <th className={tableCellClasses}>Economy</th>
                      <th className={tableCellClasses}>Fantasy Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlersData.map((bowler) => (
                      <tr key={bowler.id} className={tableRowClasses}>
                        <td className={tableCellClasses}>
                          {bowler.name}
                          {bowler.isCaptain && " (C)"}
                          {bowler.isKeeper && " (WK)"}
                        </td>
                        <td className={tableCellClasses}>
                          {bowler.teamSName || "N/A"}
                        </td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.overs}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.maidens ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.runs ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.wickets ?? 0}</td>
                        <td className={`${tableCellClasses} text-center`}>{bowler.economy}</td>
                        <td className={`${tableCellClasses} text-center font-semibold`}>
                          {calculateBowlerPoints(bowler)}
                        </td>
                      </tr>
                    ))}
                    {bowlersData.length === 0 && (
                      <tr>
                        <td colSpan={8} className={`${tableCellClasses} text-center py-4`}>No bowlers data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading fantasy points data...</p>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}