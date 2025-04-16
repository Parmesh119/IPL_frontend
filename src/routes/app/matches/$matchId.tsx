import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, AlertCircle, Target, CheckCircle } from 'lucide-react';
import { useMemo } from 'react'; // Removed useState as it wasn't used
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
import { Link } from '@tanstack/react-router';

// --- Route Definition (Keep As Is) ---
export const Route = createFileRoute('/app/matches/$matchId')({
  component: ScorecardComponent,
  loader: ({ params }) => ({ matchId: params.matchId }),
});


// --- React Component (FIXED HOOK ORDER) ---

function ScorecardComponent() {
  // --- ALL HOOK CALLS AT THE TOP ---
  const { matchId } = Route.useLoaderData(); // Hook 1

  const { data: rawData, isLoading, isError, error, refetch } = useQuery<ActualRawScorecardResponse, Error>( // Hook 2
    {
      queryKey: ['scoreboard', matchId],
      queryFn: () => fetchScorecardWithLimit(matchId),
      enabled: !!matchId,
      staleTime: 1000 * 60 * 1,
      refetchInterval: 1000 * 60 * 1,
    }
  );

  // Hook 3: Transform data (runs even if rawData is initially null/undefined)
  const scorecardData = useMemo(() => {
    if (!rawData) return null; // Handle null rawData inside the memo
    try {
      return transformDataForScoreboard(rawData, matchId);
    } catch (transformError) {
      console.error("Error transforming data for scoreboard:", transformError);
      return null;
    }
  }, [rawData, matchId]);

  // Hook 4: Calculate last updated date (runs unconditionally)
  const lastUpdatedDate = useMemo(() => {
    // Handle potentially null scorecardData or missing timestamp inside
    if (scorecardData?.responseLastUpdated && scorecardData.responseLastUpdated > 0) {
      return new Date(scorecardData.responseLastUpdated * 1000).toLocaleString();
    }
    return 'N/A';
  }, [scorecardData?.responseLastUpdated]); // Dependency on the potentially changing timestamp

  // Hook 5: Derive team names (runs unconditionally)
  const derivedTeams = useMemo(() => {
    const teams: { name: string | undefined, sName: string | undefined }[] = [];
    // Handle potentially null scorecardData inside
    if (scorecardData?.scoreCard) {
      for (const inning of scorecardData.scoreCard) {
        if (inning.batTeamName && inning.batTeamSName && !teams.some(t => t.sName === inning.batTeamSName)) {
          teams.push({ name: inning.batTeamName, sName: inning.batTeamSName });
        }
        // Limit to 2 teams for simplicity
        if (teams.length >= 2) break;
      }
    }
    // Attempt to get opponent from bowler data if only one innings batting team found
    if (teams.length === 1 && scorecardData?.scoreCard?.[0]?.bowler?.length > 0) {
      // This requires bowler names matching team names, which isn't guaranteed by API structure.
      // A more robust approach would need different API data or more complex logic.
      // Placeholder: just return what we have.
    }

    return {
      team1Name: teams[0]?.name,
      team1SName: teams[0]?.sName,
      team2Name: teams[1]?.name,
      team2SName: teams[1]?.sName,
    };
  }, [scorecardData?.scoreCard]); // Dependency on the scorecard array

  // --- Destructure derivedTeams AFTER all hook calls ---
  const { team1Name, team1SName, team2Name, team2SName } = derivedTeams;

  // --- CONDITIONAL RENDERING CHECKS (Now safe, as hooks are done) ---

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-lg text-gray-600">Loading Scoreboard...</span>
      </div>
    );
  }

  // --- Error State (Fetch Error) ---
  // Check rawData specifically because useQuery might return !isLoading and !isError but data could still be undefined briefly
  if (isError || !rawData) {
    const message = error?.message || (isError ? 'An unknown fetch error occurred.' : 'Failed to load scorecard data.');
    return (
      <div className="container mx-auto p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Scoreboard</h2>
        <p className="text-red-600">{message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  // --- Error State (Transformation Failed) ---
  // Check scorecardData AFTER checking rawData, as transformation depends on rawData
  if (!scorecardData) {
    return (
      <div className="container mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Data Processing Issue</h2>
        <p className="text-yellow-600">Could not process the scoreboard data received from the API.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition duration-200"
        >
          Retry Fetch
        </button>
      </div>
    );
  }
  return (
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="tracking-wider">
              <BreadcrumbItem>
                <Link to="/app/matches"><BreadcrumbLink href="#">Matches</BreadcrumbLink></Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{`${team1SName} vs ${team2SName}`}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Scoreboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* --- Header Section --- */}
      <div className={`p-4 rounded-lg shadow-md text-center ${scorecardData.isMatchComplete ? 'bg-green-100 border border-green-300' : 'bg-blue-100 border border-blue-300'}`}>
        <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-800">
          {team1Name && team2Name
            ? `${team1Name} vs ${team2Name}`
            : team1Name
              ? team1Name
              : 'Match Scorecard'}
          {team1SName && team2SName
            ? ` (${team1SName} vs ${team2SName})`
            : team1SName ? ` (${team1SName})` : ''}
        </h1>
        {scorecardData.isMatchComplete ? (
          <p className="text-lg font-semibold text-green-700 flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" /> {scorecardData.status}
          </p>
        ) : (
          <p className="text-lg font-semibold text-blue-700 flex items-center justify-center gap-2">
            <Target className="h-5 w-5" /> {scorecardData.status}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">Last Updated: {lastUpdatedDate}</p>
      </div>

      {/* --- Scoreboard Tabs --- */}
      <div className="mt-4">
        {/* Ensure ScoreboardTab is defined or imported */}
        <ScoreboardTab scorecardData={scorecardData} />
      </div>
    </div>
    </SidebarInset>
  );
}

interface RawFallOfWicketDetail {
  batsmanId: number;
  batsmanName: string;
  overNbr: number;
  runs: number;
  ballNbr: number;
}
interface RawFowObject {
  fow: RawFallOfWicketDetail[];
}
interface RawInningsBatsman {
  id: number;
  balls?: number;
  runs?: number;
  fours?: number;
  sixes?: number;
  strkRate: string;
  name: string;
  nickName?: string;
  outDec: string;
  isOverseas?: boolean;
  isCaptain?: boolean;
  isKeeper?: boolean;
  inMatchChange?: string;
  playingXIChange?: string;
}
interface RawInningsBowler {
  id: number;
  overs: string;
  wickets?: number;
  runs?: number;
  maidens?: number;
  economy: string;
  name: string;
  nickName?: string;
  balls: number;
  isOverseas?: boolean;
  isCaptain?: boolean;
  isKeeper?: boolean;
  inMatchChange?: string;
  playingXIChange?: string;
}
interface RawInningsExtras {
  legByes?: number;
  byes?: number;
  wides?: number;
  noBalls?: number;
  total: number;
  penalty?: number;
}
interface RawPowerPlayData {
  powerPlay?: { id: number; ovrFrom: number; ovrTo: number; ppType: string; run: number }[];
}
interface RawInningsData {
  inningsId: number;
  batsman: RawInningsBatsman[];
  bowler: RawInningsBowler[];
  fow?: RawFowObject;
  extras?: RawInningsExtras;
  pp?: RawPowerPlayData;
  score?: number;
  wickets?: number;
  overs?: number;
  runRate?: number;
  batTeamName?: string;
  batTeamSName?: string;
  ballNbr?: number;
  rpb?: number;
  partnership?: object;
}
interface ActualRawScorecardResponse {
  scorecard: RawInningsData[];
  isMatchComplete: boolean;
  appIndex?: {
    seoTitle?: string;
    webURL?: string;
  };
  status: string;
  responseLastUpdated: string;
}
interface BatsmanScore {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strkRate: string;
  outDec: string;
  isOverseas: boolean;
  isCaptain: boolean;
  isKeeper: boolean;
}
interface BowlerFigure {
  id: number;
  name: string;
  overs: string;
  maidens: string;
  runs: number;
  wickets: number;
  economy: string;
  balls: number;
}
interface Extras {
  total: number;
  byes: number;
  lb: number;
  wds: number;
  nbs: number;
}
interface FallOfWicket {
  id: number;
  name: string;
  wicketNumber: number;
  overs: number;
  score: number;
}
interface InningsScorecard {
  matchId: number;
  inningsId: number;
  score: number;
  wickets: number;
  overs: number;
  runRate: number;
  batTeamName: string;
  batTeamSName: string;
  ballNbr: number;
  batsman: BatsmanScore[];
  bowler: BowlerFigure[];
  extras: Extras;
  fow: FallOfWicket[];
}
interface TransformedScorecardData {
  scoreCard: InningsScorecard[];
  status: string;
  isMatchComplete: boolean;
  responseLastUpdated: number;
}

// --- Re-add Helper Functions ---
const API_HIT_LIMIT = 5;

const fetchScorecardWithLimit = async (matchId: string): Promise<ActualRawScorecardResponse> => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const apiHitsKey = `apiHits_${today}`;
  const apiHits = JSON.parse(localStorage.getItem(apiHitsKey) || '0');


  try {
    // if (apiHits >= API_HIT_LIMIT) {
    //   toast.error(`API hit limit reached for today. Please try again tomorrow.`);
    //   return Promise.reject(new Error("API hit limit reached for today."));
    // }
    const options = {
      method: 'GET',
      url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`,
      headers: {
        'x-rapidapi-key': "a095a2501amsh82e9617579e89e3p13ef94jsn2e302d634f12",
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    // Increment the API hit count
    localStorage.setItem(apiHitsKey, JSON.stringify(apiHits + 1));

    if (!response.data || !Array.isArray(response.data.scorecard) || typeof response.data.status !== 'string') {
      throw new Error("Invalid API response structure received.");
    }

    return response.data as ActualRawScorecardResponse;
  } catch (error) {
    console.error("Error fetching scorecard:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error fetching scorecard: ${error.response?.status} - ${error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Error fetching scorecard: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching scorecard");
  }
};

const transformDataForScoreboard = (rawData: ActualRawScorecardResponse, matchIdParam: string): TransformedScorecardData => {
  const matchIdNumber = parseInt(matchIdParam, 10) || 0;

  const transformedScorecard: InningsScorecard[] = rawData.scorecard.map((inning) => {
    const batsmen: BatsmanScore[] = (inning.batsman || []).map((b) => ({
      id: b.id,
      name: b.nickName || b.name,
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
      strkRate: (b.balls ?? 0) > 0 ? b.strkRate : "0.0",
      outDec: b.outDec || ((b.balls ?? 0) > 0 ? 'not out' : 'did not bat'),
      isOverseas: b.isOverseas ?? false,
      isCaptain: b.isCaptain ?? false,
      isKeeper: b.isKeeper ?? false,
    }));
    const bowlers: BowlerFigure[] = (inning.bowler || [])
      .filter(b => b.overs && parseFloat(b.overs) >= 0)
      .map(b => ({
        id: b.id,
        name: b.nickName || b.name,
        overs: b.overs,
        maidens: String(b.maidens ?? 0),
        runs: b.runs ?? 0,
        wickets: b.wickets ?? 0,
        economy: b.economy || "-",
        balls: b.balls ?? 0,
      }));
    const extras: Extras = {
      total: inning.extras?.total ?? 0,
      byes: inning.extras?.byes ?? 0,
      lb: inning.extras?.legByes ?? 0,
      wds: inning.extras?.wides ?? 0,
      nbs: inning.extras?.noBalls ?? 0,
    };
    const fow: FallOfWicket[] = (inning.fow?.fow || [])
      .sort((a, b) => a.overNbr - b.overNbr)
      .map((w, wicketIndex) => ({
        id: w.batsmanId,
        name: w.batsmanName,
        wicketNumber: wicketIndex + 1,
        overs: w.overNbr,
        score: w.runs,
      }));

    return {
      matchId: matchIdNumber,
      inningsId: inning.inningsId,
      score: inning.score ?? 0,
      wickets: inning.wickets ?? 0,
      overs: inning.overs ?? 0,
      runRate: inning.runRate ?? 0,
      batTeamName: inning.batTeamName ?? 'N/A',
      batTeamSName: inning.batTeamSName ?? 'N/A',
      ballNbr: inning.ballNbr ?? 0,
      batsman: batsmen,
      bowler: bowlers,
      extras: extras,
      fow: fow,
    };
  });
  const lastUpdatedTimestamp = parseInt(rawData.responseLastUpdated, 10);
  return {
    scoreCard: transformedScorecard,
    status: rawData.status || 'Status unavailable',
    isMatchComplete: rawData.isMatchComplete,
    responseLastUpdated: !isNaN(lastUpdatedTimestamp) ? lastUpdatedTimestamp : 0,
  };
};

function ScoreboardTab({ scorecardData }: { scorecardData: TransformedScorecardData | null }) {
  if (!scorecardData?.scoreCard || scorecardData.scoreCard.length === 0) {
    return <div className="text-center p-6 text-gray-500">Scoreboard data is unavailable or incomplete for display.</div>;
  }
  return (
    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scorecardData.scoreCard.map((inning) => (
          <div key={inning.inningsId} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col min-h-[400px]">
            <div className="bg-gray-100 p-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">
                Innings {inning.inningsId}: <span className="font-bold">{inning.batTeamName} ({inning.batTeamSName})</span>
              </h2>
              <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                <span className="font-bold text-xl">{inning.score}/{inning.wickets}</span>
                <span>Overs: {inning.overs}</span>
                <span>Run Rate: {typeof inning.runRate === 'number' ? inning.runRate.toFixed(2) : '-'}</span>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-1">
              <div className="p-2">
                <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10">Batting</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-20">
                      <tr>
                        <th scope="col" className="px-3 py-2">Batsman</th>
                        <th scope="col" className="px-3 py-2 w-1/3">Status</th>
                        <th scope="col" className="px-2 py-2 text-center">R</th>
                        <th scope="col" className="px-2 py-2 text-center">B</th>
                        <th scope="col" className="px-2 py-2 text-center">4s</th>
                        <th scope="col" className="px-2 py-2 text-center">6s</th>
                        <th scope="col" className="px-3 py-2 text-center">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inning.batsman.length > 0 ? (
                        inning.batsman.map((batsman) => (
                          <tr key={`${inning.inningsId}-bat-${batsman.id}`} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-1.5 font-medium">
                              {batsman.name}
                              {batsman.isCaptain && <span title="Captain" className='ml-1 text-orange-500 font-normal'>(c)</span>}
                              {batsman.isKeeper && <span title="Wicketkeeper" className='ml-1 text-green-500 font-normal'>(wk)</span>}
                              {batsman.isOverseas && <span title="Overseas Player" className='ml-1 text-blue-500 font-normal'>*</span>}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-gray-500">{batsman.outDec}</td>
                            <td className="px-2 py-1.5 text-center font-semibold">{batsman.runs}</td>
                            <td className="px-2 py-1.5 text-center">{batsman.balls}</td>
                            <td className="px-2 py-1.5 text-center">{batsman.fours}</td>
                            <td className="px-2 py-1.5 text-center">{batsman.sixes}</td>
                            <td className="px-3 py-1.5 text-center">{batsman.strkRate}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="text-center py-4 text-gray-500">Batting data not available yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-3 py-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600">
                  Extras: <span className="font-bold">{inning.extras?.total ?? 0}</span>
                  <span className="text-xs ml-2 text-gray-500">
                    (B: {inning.extras?.byes ?? 0}, LB: {inning.extras?.lb ?? 0}, WD: {inning.extras?.wds ?? 0}, NB: {inning.extras?.nbs ?? 0})
                  </span>
                </p>
              </div>
              {inning.fow && inning.fow.length > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10">Fall of Wickets</h3>
                  <div className="text-xs text-gray-600 space-x-2 overflow-x-auto whitespace-nowrap pb-1">
                    {inning.fow.map((wicket) => (
                      <span key={`${inning.inningsId}-fow-${wicket.wicketNumber}`} className="inline-block border border-gray-200 rounded px-1.5 py-0.5 mr-1 mb-1 bg-gray-50">
                        {wicket.score}-{wicket.wicketNumber} <span className='font-medium'>({wicket.name}</span>, {wicket.overs} ov)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-2 border-t border-gray-100">
                <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10">Bowling</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[450px] text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-20">
                      <tr>
                        <th scope="col" className="px-3 py-2">Bowler</th>
                        <th scope="col" className="px-2 py-2 text-center">O</th>
                        <th scope="col" className="px-2 py-2 text-center">M</th>
                        <th scope="col" className="px-2 py-2 text-center">R</th>
                        <th scope="col" className="px-2 py-2 text-center">W</th>
                        <th scope="col" className="px-3 py-2 text-center">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inning.bowler.length > 0 ? (
                        inning.bowler.map((bowler) => (
                          <tr key={`${inning.inningsId}-bowl-${bowler.id}`} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-1.5 font-medium">{bowler.name}</td>
                            <td className="px-2 py-1.5 text-center">{bowler.overs}</td>
                            <td className="px-2 py-1.5 text-center">{bowler.maidens}</td>
                            <td className="px-2 py-1.5 text-center">{bowler.runs}</td>
                            <td className="px-2 py-1.5 text-center font-semibold">{bowler.wickets}</td>
                            <td className="px-3 py-1.5 text-center">{bowler.economy}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="text-center py-4 text-gray-500">Bowling data not available for this innings yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
  );
}