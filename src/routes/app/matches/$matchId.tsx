import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, AlertCircle, Target, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
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
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/matches/$matchId')({
  component: ScorecardComponent,
  loader: ({ params }) => ({ matchId: params.matchId }),
});

interface RawAPIBatsman {
  batId: number;
  batName: string;
  batShortName?: string;
  isCaptain: boolean;
  isKeeper: boolean;
  runs: number;
  balls: number;
  dots?: number;
  fours: number;
  sixes: number;
  mins?: number;
  strikeRate: number;
  outDesc: string;
  bowlerId?: number;
  fielderId1?: number;
  wicketCode?: string;
  isOverseas: boolean;
  inMatchChange?: string;
  playingXIChange?: string;
}

interface RawAPIBowler {
  bowlerId: number;
  bowlName: string;
  bowlShortName?: string;
  isCaptain: boolean;
  isKeeper: boolean;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  no_balls?: number;
  wides?: number;
  dots?: number;
  balls?: number;
  runsPerBall?: number;
  isOverseas: boolean;
  inMatchChange?: string;
  playingXIChange?: string;
}

interface RawAPIFallOfWicket {
  batId: number;
  batName: string;
  wktNbr: number;
  wktOver: number;
  wktRuns: number;
  ballNbr: number;
}

interface RawScorecardInningsData {
  matchId: number;
  inningsId: number;
  timeScore?: number;
  batTeamDetails: {
    batTeamId: number;
    batTeamName: string;
    batTeamShortName: string;
    batsmenData: { [key: string]: RawAPIBatsman };
  };
  bowlTeamDetails: {
    bowlTeamId: number;
    bowlTeamName: string;
    bowlTeamShortName: string;
    bowlersData: { [key: string]: RawAPIBowler };
  };
  scoreDetails: {
    ballNbr: number;
    isDeclared: boolean;
    isFollowOn: boolean;
    overs: number;
    revisedOvers?: number;
    runRate: number;
    runs: number;
    wickets: number;
    runsPerBall?: number;
  };
  extrasData: {
    noBalls: number;
    total: number;
    byes: number;
    penalty: number;
    wides: number;
    legByes: number;
  };
  ppData?: {
    [key: string]: {
      ppId: number;
      ppOversFrom: number;
      ppOversTo: number;
      ppType: string;
      runsScored: number;
    };
  };
  wicketsData: { [key: string]: RawAPIFallOfWicket };
  partnershipsData?: { [key: string]: any };
}

interface ActualRawScorecardResponse {
  scoreCard: RawScorecardInningsData[];
  matchHeader?: any;
  isMatchComplete: boolean;
  status: string;
  videos?: any[];
  responseLastUpdated: number;
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
  teamSName?: string;
  teamName?: string;
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
  teamSName?: string;
  teamName?: string;
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

const API_HIT_LIMIT = 5;

const fetchScorecardWithLimit = async (matchId: string): Promise<ActualRawScorecardResponse> => {
  const today = new Date().toISOString().split('T')[0];
  const apiHitsKey = `apiHits_${today}`;
  const apiHits = JSON.parse(localStorage.getItem(apiHitsKey) || '0');

  const options = {
    method: 'GET',
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`,
    headers: {
      'x-rapidapi-key': "41f3001a6emsh0110854b5b87aaep1692c5jsn31b8a2ce925f",
      'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);

    if (!response.data || !Array.isArray(response.data.scoreCard) || typeof response.data.status !== 'string') {
      console.error("Invalid API structure received:", response.data);
      throw new Error("Invalid API response structure received.");
    }

    localStorage.setItem(apiHitsKey, JSON.stringify(apiHits + 1));
    return response.data as ActualRawScorecardResponse;

  } catch (error) {
    console.error("Error fetching scorecard:", error);
    if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMessage = typeof errorData === 'string' ? errorData : (errorData?.message || error.message);
      throw new Error(`API Error fetching scorecard: ${error.response?.status} - ${errorMessage}`);
    } else if (error instanceof Error) {
      throw new Error(`Error fetching scorecard: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching scorecard");
  }
};

const transformDataForScoreboard = (rawData: ActualRawScorecardResponse, matchIdParam: string): TransformedScorecardData => {
    const matchIdNumber = parseInt(matchIdParam, 10) || 0;

    const transformedScorecard: InningsScorecard[] = rawData.scoreCard.map((inning) => {
        const batTeamSName = inning.batTeamDetails.batTeamShortName;
        const batTeamName = inning.batTeamDetails.batTeamName;
        const bowlTeamSName = inning.bowlTeamDetails.bowlTeamShortName;
        const bowlTeamName = inning.bowlTeamDetails.bowlTeamName;

        const batsmen: BatsmanScore[] = Object.values(inning.batTeamDetails.batsmenData || {}).map((b): BatsmanScore => ({
            id: b.batId,
            name: b.batShortName || b.batName,
            runs: b.runs ?? 0,
            balls: b.balls ?? 0,
            fours: b.fours ?? 0,
            sixes: b.sixes ?? 0,
            strkRate: b.strikeRate?.toFixed(2) ?? "0.00",
            outDec: b.outDesc || (b.balls > 0 ? 'not out' : 'did not bat'),
            isOverseas: b.isOverseas ?? false,
            isCaptain: b.isCaptain ?? false,
            isKeeper: b.isKeeper ?? false,
            teamSName: batTeamSName,
            teamName: batTeamName,
        }));

         const bowlers: BowlerFigure[] = Object.values(inning.bowlTeamDetails.bowlersData || {})
            .filter(b => typeof b.overs === 'number' && b.overs >= 0)
            .map((b): BowlerFigure => ({
                id: b.bowlerId,
                name: b.bowlShortName || b.bowlName,
                overs: b.overs.toFixed(1),
                maidens: String(b.maidens ?? 0),
                runs: b.runs ?? 0,
                wickets: b.wickets ?? 0,
                economy: b.economy?.toFixed(2) ?? "-",
                balls: b.balls ?? 0,
                teamSName: bowlTeamSName,
                teamName: bowlTeamName,
            }));

        const extras: Extras = {
            total: inning.extrasData?.total ?? 0,
            byes: inning.extrasData?.byes ?? 0,
            lb: inning.extrasData?.legByes ?? 0,
            wds: inning.extrasData?.wides ?? 0,
            nbs: inning.extrasData?.noBalls ?? 0,
        };

        const fow: FallOfWicket[] = Object.values(inning.wicketsData || {})
            .sort((a, b) => a.ballNbr - b.ballNbr)
            .map((w): FallOfWicket => ({
                id: w.batId,
                name: w.batName,
                wicketNumber: w.wktNbr,
                overs: w.wktOver,
                score: w.wktRuns,
            }));

        return {
            matchId: matchIdNumber,
            inningsId: inning.inningsId,
            score: inning.scoreDetails?.runs ?? 0,
            wickets: inning.scoreDetails?.wickets ?? 0,
            overs: inning.scoreDetails?.overs ?? 0,
            runRate: inning.scoreDetails?.runRate ?? 0,
            batTeamName: batTeamName,
            batTeamSName: batTeamSName,
            ballNbr: inning.scoreDetails?.ballNbr ?? 0,
            batsman: batsmen,
            bowler: bowlers,
            extras: extras,
            fow: fow,
        };
    });

    const lastUpdatedTimestamp = rawData.responseLastUpdated;

    return {
        scoreCard: transformedScorecard,
        status: rawData.status || 'Status unavailable',
        isMatchComplete: rawData.isMatchComplete ?? false,
        responseLastUpdated: typeof lastUpdatedTimestamp === 'number' ? lastUpdatedTimestamp : 0,
    };
};

function ScorecardComponent() {
  const { matchId } = Route.useLoaderData();
  const navigate = useNavigate();

  const { data: rawData, isLoading, isError, error, refetch } = useQuery<ActualRawScorecardResponse, Error>({
    queryKey: ['scoreboard', matchId],
    queryFn: () => fetchScorecardWithLimit(matchId),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 1,
  });

  const scorecardData = useMemo(() => {
    if (!rawData) return null;
    try {
      return transformDataForScoreboard(rawData, matchId);
    } catch (transformError) {
      console.error("Error transforming data for scoreboard:", transformError);
      toast.error("Failed to process scoreboard data.");
      return null;
    }
  }, [rawData, matchId]);

  const lastUpdatedDate = useMemo(() => {
    if (scorecardData?.responseLastUpdated && scorecardData.responseLastUpdated > 0) {
      return new Date(scorecardData.responseLastUpdated * 1000).toLocaleString();
    }
    return 'N/A';
  }, [scorecardData?.responseLastUpdated]);

  const derivedTeams = useMemo(() => {
    const teams: { name: string | undefined; sName: string | undefined }[] = [];
    if (scorecardData?.scoreCard) {
      for (const inning of scorecardData.scoreCard) {
        if (inning.batTeamName && inning.batTeamSName && !teams.some((t) => t.sName === inning.batTeamSName)) {
          teams.push({ name: inning.batTeamName, sName: inning.batTeamSName });
        }
        if (teams.length >= 2) break;
      }
    }
    return {
      team1Name: teams[0]?.name,
      team1SName: teams[0]?.sName,
      team2Name: teams[1]?.name,
      team2SName: teams[1]?.sName,
    };
  }, [scorecardData?.scoreCard]);

  const { team1Name, team1SName, team2Name, team2SName } = derivedTeams;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-lg text-gray-600">Loading Scoreboard...</span>
      </div>
    );
  }

  if (isError || !rawData) {
    const message = error?.message || 'Failed to load scorecard data.';
    return (
      <div className="container mx-auto p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Scoreboard</h2>
        <p className="text-red-600">{message}</p>
        <Button
          onClick={() => refetch()}
          variant="destructive"
          className="mt-4"
        >
          Retry Fetch
        </Button>
      </div>
    );
  }

  if (!scorecardData || !scorecardData.scoreCard || scorecardData.scoreCard.length === 0) {
    return (
      <div className="container mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Data Processing Issue</h2>
        <p className="text-yellow-600">Could not process or display the scoreboard data received from the API.</p>
         <Button
          onClick={() => refetch()}
           variant="outline"
           className="mt-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
        >
          Retry Fetch
        </Button>
      </div>
    );
  }

  const handleFantasyPointsClick = () => {
    if (!scorecardData) return;

    const batsmenData = scorecardData.scoreCard.flatMap(inning => inning.batsman);
    const bowlersData = scorecardData.scoreCard.flatMap(inning => inning.bowler);

     if (!Array.isArray(batsmenData) || !Array.isArray(bowlersData)) {
        toast.error("Could not prepare fantasy points data.");
        return;
     }

    try {
        localStorage.setItem('fantasy_batsmen', JSON.stringify(batsmenData));
        localStorage.setItem('fantasy_bowlers', JSON.stringify(bowlersData));

        navigate({
        to: "/app/matches/fantacy-points",
        });
    } catch (storageError) {
        console.error("Error storing fantasy data in localStorage:", storageError);
        toast.error("Could not store data for fantasy points calculation.");
    }
  };


  return (
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="tracking-wider">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link to="/app/matches">Matches</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{`${team1SName || 'Team 1'} vs ${team2SName || 'Team 2'}`}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Scoreboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
         <div className="flex justify-end">
            <Button
                onClick={handleFantasyPointsClick}
                disabled={!scorecardData}
            >
                Fantasy Points
            </Button>
        </div>

        <div
          className={`p-4 rounded-lg shadow-md text-center ${scorecardData.isMatchComplete
            ? 'bg-green-100 border border-green-300'
            : 'bg-blue-100 border border-blue-300'
            }`}
        >
          <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-800">
            {team1Name && team2Name
              ? `${team1Name} vs ${team2Name}`
              : team1Name
                ? team1Name
                : 'Match Scorecard'}
            {team1SName && team2SName
              ? ` (${team1SName} vs ${team2SName})`
              : team1SName
                ? ` (${team1SName})`
                : ''}
          </h1>
          {scorecardData.isMatchComplete ? (
            <p className="text-lg font-semibold text-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" /> {scorecardData.status}
            </p>
          ) : (
            <p className="text-lg font-semibold text-blue-700 flex items-center justify-center gap-2">
              <Target className="h-5 w-5" /> {scorecardData.status || 'In Progress'}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Last Updated: {lastUpdatedDate}</p>
        </div>

        <div className="mt-4">
          <ScoreboardDisplay scorecardData={scorecardData} />
        </div>
      </div>
    </SidebarInset>
  );
}

function ScoreboardDisplay({ scorecardData }: { scorecardData: TransformedScorecardData | null }) {
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
              <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10 border-b">Batting</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky z-10">
                    <tr>
                      <th scope="col" className="px-3 py-2 w-2/5">Batsman</th>
                      <th scope="col" className="px-3 py-2 w-1/4">Status</th>
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
                          <td className="px-3 py-2 font-medium truncate">
                            <div className="flex items-center space-x-1">
                              <span className="truncate max-w-[150px]">{batsman.name}</span>
                              <div className="flex flex-shrink-0">
                                {batsman.isCaptain && <span title="Captain" className="ml-1 text-orange-500 font-normal">(c)</span>}
                                {batsman.isKeeper && <span title="Wicketkeeper" className="ml-1 text-green-500 font-normal">(wk)</span>}
                                {batsman.isOverseas && <span title="Overseas Player" className="ml-1 text-blue-500 font-normal">*</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[120px]">{batsman.outDec}</td>
                          <td className="px-2 py-2 text-center font-semibold">{batsman.runs}</td>
                          <td className="px-2 py-2 text-center">{batsman.balls}</td>
                          <td className="px-2 py-2 text-center">{batsman.fours}</td>
                          <td className="px-2 py-2 text-center">{batsman.sixes}</td>
                          <td className="px-3 py-2 text-center">{batsman.strkRate}</td>
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
                <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10 border-b">Fall of Wickets</h3>
                <div className="text-xs text-gray-600 flex flex-wrap gap-2 overflow-x-auto pb-2">
                  {inning.fow.map((wicket) => (
                    <span key={`${inning.inningsId}-fow-${wicket.wicketNumber}`} className="inline-block border border-gray-200 rounded px-2 py-1 bg-gray-50 hover:bg-gray-100">
                      {wicket.score}-{wicket.wicketNumber} <span className="font-medium truncate max-w-[100px] inline-block align-bottom">{wicket.name}</span>, {wicket.overs.toFixed(1)} ov
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2 border-t border-gray-100">
              <h3 className="text-md font-semibold mb-2 text-gray-600 sticky top-0 bg-white pt-1 pb-1 z-10 border-b">Bowling</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky z-10">
                    <tr>
                      <th scope="col" className="px-3 py-2 w-2/5">Bowler</th>
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
                          <td className="px-3 py-2 font-medium truncate max-w-[180px]">{bowler.name}</td>
                          <td className="px-2 py-2 text-center">{bowler.overs}</td>
                          <td className="px-2 py-2 text-center">{bowler.maidens}</td>
                          <td className="px-2 py-2 text-center">{bowler.runs}</td>
                          <td className="px-2 py-2 text-center font-semibold">{bowler.wickets}</td>
                          <td className="px-3 py-2 text-center">{bowler.economy}</td>
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