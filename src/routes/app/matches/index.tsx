import { createFileRoute } from '@tanstack/react-router'
import { getAllMatches } from '@/lib/actions'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Timer, Calendar, MapPin } from "lucide-react"
import debounce from 'lodash/debounce'
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
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/app/matches/')({
  component: MatchComponent,
})

type ListMatchRequest = {
  page: number // 1-based page number for UI state
  size: number
  search?: string | null
  type?: string | null
  IPL_TEAMS?: string | null
}

type BackendListMatchRequest = {
  page: number // 0-based page number for backend API
  size: number
  search?: string | null
  type?: string | null  
  IPL_TEAMS?: string | null
}

type Match = {
  id: string // Assuming ID is string, adjust if it's number
  team1: string
  team2: string
  date: string // Consider using Date object if appropriate, but string is often simpler from API
  day: string
  time: string
  venue: string
  team1Score?: string | null
  team2Score?: string | null
  tossResult?: string | null
  isLive?: boolean
}

// Type for the expected Spring Pageable response structure (KEEP FOR FUTURE/CORRECT BACKEND)
type SpringPageable = {
  pageNumber: number
  pageSize: number
}

type MatchesResponse = {
  content: Match[]
  totalPages: number
  totalElements: number
  size: number // Size of the current page
  number: number // 0-based page number (current page index)
  pageable: SpringPageable
}

// Type for the ACTUAL response seen in the screenshot (Array of Matches)
type MatchesArrayResponse = Match[];

function MatchComponent() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ListMatchRequest>({
    page: 1,
    size: 10,
    search: null,
    type: "All",
    IPL_TEAMS: "Chennai Super Kings"
  })

  const [searchInput, setSearchInput] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  // Initialize pagination assuming we *don't* know the total pages/items yet
  const [pagination, setPagination] = useState({
    totalPages: 1, // Assume at least 1 page initially, will be updated
    currentPage: 1,
    totalItems: 0, // Unknown
    pageSize: 10
  })

  // Loading state for view match button
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);

  // Adjust the useMutation hook to expect potentially an array OR the pageable object
  const { mutate, isPending, error } = useMutation<MatchesResponse | MatchesArrayResponse, Error, BackendListMatchRequest>({
    mutationFn: getAllMatches,
    onSuccess: (data) => {

      // *** IMPORTANT FIX BASED ON SCREENSHOT ***
      // Check if the response is an Array directly (as shown in the network tab)
      if (Array.isArray(data)) {
        setMatches(data);
        const receivedCount = data.length;
        const requestedSize = filters.size;
        const currentPage = filters.page;

        // Otherwise, assume there's at least one more page. This is imperfect!
        const guessedTotalPages = (receivedCount < requestedSize) ? currentPage : currentPage + 1;

        setPagination({
          // We can't know the true totalPages or totalItems without backend info
          totalPages: guessedTotalPages, // This is just a guess! Might allow clicking 'Next' incorrectly.
          currentPage: currentPage,
          totalItems: -1, // Indicate unknown total
          pageSize: requestedSize
        });
        console.log("Pagination state after Array handling:", {
          totalPages: guessedTotalPages,
          currentPage: currentPage,
          totalItems: -1,
          pageSize: requestedSize
        });
      }
      // Check if the response has the Spring Pageable structure (keep this for potential future backend fixes)
      else if (data && typeof data.content !== 'undefined' && typeof data.totalPages !== 'undefined' && typeof data.number !== 'undefined') {
        setMatches(data.content || []);
        const totalPages = Number(data.totalPages) || 0;
        const currentPageBackend = Number(data.number) || 0;
        const totalElements = Number(data.totalElements) || 0;
        const pageSize = Number(data.pageable?.pageSize || data.size) || filters.size;

        setPagination({
          totalPages: totalPages,
          currentPage: currentPageBackend + 1, // Convert 0-based to 1-based
          totalItems: totalElements,
          pageSize: pageSize
        });
        console.log("Pagination state after Spring Page handling:", {
          totalPages: totalPages,
          currentPage: currentPageBackend + 1,
          totalItems: totalElements,
          pageSize: pageSize
        });
      }
      // Handle other unexpected formats
      else {
        setMatches([]); // Clear matches if format is unknown
        setPagination({ totalPages: 0, currentPage: 1, totalItems: 0, pageSize: filters.size });
      }
    },
    onError: (err) => {
      setMatches([]) // Clear matches on error
      setPagination({ totalPages: 0, currentPage: 1, totalItems: 0, pageSize: filters.size }) // Reset pagination
    }
  })

  // Handle View Match - makes API call to get match ID
  // Improved handleViewMatch function with better matching logic
  const handleViewMatch = async (match) => {
    try {
      setLoadingMatchId(match.id);

      // Log which match we're trying to find (for debugging)

      // API call to get recent matches
      const options = {
        method: 'GET',
        url: 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent',
        headers: {
          'x-rapidapi-key': '41f3001a6emsh0110854b5b87aaep1692c5jsn31b8a2ce925f',
          'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);

      // Extract all matches from all match types for better search
      let allMatches = [];

      // Process all typeMatches
      response.data.typeMatches.forEach(typeMatch => {
        if (typeMatch.seriesMatches) {
          typeMatch.seriesMatches.forEach(seriesMatch => {
            if (seriesMatch.seriesAdWrapper?.matches) {
              allMatches = [...allMatches, ...seriesMatch.seriesAdWrapper.matches];
            }
          });
        }
      });


      // Create team name variants for more flexible matching
      const team1Variants = [
        match.team1.toLowerCase(),
        ...match.team1.toLowerCase().split(' '),
        match.team1.toLowerCase().replace(/\s+/g, '')
      ];

      const team2Variants = [
        match.team2.toLowerCase(),
        ...match.team2.toLowerCase().split(' '),
        match.team2.toLowerCase().replace(/\s+/g, '')
      ];

      // Special handling for known abbreviations 
      const abbreviations = {
        'dc': ['delhi capitals', 'delhi'],
        'mi': ['mumbai indians', 'mumbai'],
        'rcb': ['royal challengers bangalore', 'bangalore'],
        'csk': ['chennai super kings', 'chennai'],
        'kkr': ['kolkata knight riders', 'kolkata'],
        'srh': ['sunrisers hyderabad', 'hyderabad'],
        'pbks': ['punjab kings', 'punjab'],
        'rr': ['rajasthan royals', 'rajasthan']
      };

      // Add abbreviation variants
      for (const abbr in abbreviations) {
        if (team1Variants.includes(abbr.toLowerCase())) {
          team1Variants.push(...abbreviations[abbr]);
        }
        if (team2Variants.includes(abbr.toLowerCase())) {
          team2Variants.push(...abbreviations[abbr]);
        }
      }


      // First, try to find an exact match (both teams match in either order)
      let matchedGame = allMatches.find(m => {
        const t1Name = (m.matchInfo?.team1?.teamName || '').toLowerCase();
        const t1Short = (m.matchInfo?.team1?.teamSName || '').toLowerCase();
        const t2Name = (m.matchInfo?.team2?.teamName || '').toLowerCase();
        const t2Short = (m.matchInfo?.team2?.teamSName || '').toLowerCase();

        // Case 1: team1 vs team2 (in order)
        const match1 = team1Variants.some(v => t1Name.includes(v) || t1Short.includes(v)) &&
          team2Variants.some(v => t2Name.includes(v) || t2Short.includes(v));

        // Case 2: team2 vs team1 (reversed order)
        const match2 = team1Variants.some(v => t2Name.includes(v) || t2Short.includes(v)) &&
          team2Variants.some(v => t1Name.includes(v) || t1Short.includes(v));

        return match1 || match2;
      });

      // Special case for DC vs MI - if we're looking for that match specifically
      if ((match.team1.includes('DC') && match.team2.includes('MI')) ||
        (match.team1.includes('MI') && match.team2.includes('DC'))) {

        // Search for Delhi Capitals vs Mumbai Indians
        const dcMiMatch = allMatches.find(m => {
          const teams = [
            (m.matchInfo?.team1?.teamName || '').toLowerCase(),
            (m.matchInfo?.team2?.teamName || '').toLowerCase(),
            (m.matchInfo?.team1?.teamSName || '').toLowerCase(),
            (m.matchInfo?.team2?.teamSName || '').toLowerCase()
          ];

          return (teams.some(t => t.includes('delhi') || t === 'dc') &&
            teams.some(t => t.includes('mumbai') || t === 'mi'));
        });

        if (dcMiMatch) {
          matchedGame = dcMiMatch;
        }
      }

      // If we found a match, display the ID
      if (matchedGame) {
        const matchId = matchedGame.matchInfo.matchId;
        navigate({ to: `/app/matches/${matchId}` });
      }
    } catch (error) {

      // Special case handling for known matches when API fails
      if ((match.team1.includes('DC') && match.team2.includes('MI')) ||
        (match.team1.includes('MI') && match.team2.includes('DC'))) {
      } else {
      }
    } finally {
      setLoadingMatchId(null);
    }
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilters(prev => ({
        ...prev,
        search: searchValue || null,
        page: 1 // Reset to first page on new search
      }))
    }, 500),
    []
  )

  // Effect to trigger fetch when filters change
  useEffect(() => {
    const backendRequest: BackendListMatchRequest = {
      page: filters.page - 1, // Convert 1-based UI page to 0-based backend page
      size: filters.size,
      search: filters.search || null,
      type: filters.type === "All" ? null : filters.type,
      IPL_TEAMS: filters.IPL_TEAMS || null, // Include the IPL_TEAM filter
    };

    console.log("Request being sent to backend:", backendRequest); // Debugging log

    mutate(backendRequest);
  }, [filters, mutate]); // Include mutate

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearch(value)
  }

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      type: value,
      page: 1 // Reset to first page
    }))
  }

  const handlePageChange = (newPage: number) => {
    // Basic validation, refinement needed if using guessed totalPages
    if (newPage >= 1 && (pagination.totalItems !== -1 ? newPage <= pagination.totalPages : true)) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top on page change
    }
  }

  // Generate page numbers for pagination control
  const getPageNumbers = () => {
    // This function might show more pages than actually exist if totalPages is guessed
    const { totalPages, currentPage } = pagination;

    // If totalPages is unknown or seems unreliable (like our guess), show limited controls
    if (totalPages <= 1 && matches.length < filters.size) {
      // Only show page 1 if it's the only known page and it's not full
      return [<Button key={1} variant="default" size="sm" className="mx-1" disabled>1</Button>];
    }
    if (totalPages <= 1 && matches.length === filters.size) {
      // If page 1 is full but we don't know total pages, show 1 and allow 'Next'
      return [<Button key={1} variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => handlePageChange(1)} className="mx-1">1</Button>];
    }

    // More robust generation if totalPages is known (or guessed > 1)
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    // Adjust end page based on calculated start page, but don't exceed totalPages if known
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages > 0 ? totalPages : Infinity);

    // Adjust startPage again if endPage calculation caused startPage to be too far back
    // And we know the total pages
    if (totalPages > 0 && endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page & ellipsis if needed
    if (startPage > 1 && totalPages > 0) {
      pages.push(<Button key={1} variant="outline" size="sm" onClick={() => handlePageChange(1)} className="mx-1">1</Button>);
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="mx-1 px-2">...</span>);
      }
    }

    // Generate visible page numbers
    const pageLimit = pagination.totalItems === -1 ? currentPage + 1 : endPage; // Limit loop if total unknown
    for (let i = startPage; i <= pageLimit; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </Button>
      );
    }

    // Add last page & ellipsis if needed (and totalPages is known)
    if (totalPages > 0 && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="mx-1 px-2">...</span>);
      }
      pages.push(<Button key={totalPages} variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className="mx-1">{totalPages}</Button>);
    }

    return pages;
  }

  // --- RENDER LOGIC ---
  const showPagination = pagination.totalItems === -1 ? (matches.length > 0) : (pagination.totalPages > 1);
  const isNextDisabled = pagination.totalItems === -1 ? (matches.length < pagination.pageSize) : (pagination.currentPage === pagination.totalPages);

  const IPL_TEAMS = [
    "Chennai Super Kings",
    "Mumbai Indians",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Sunrisers Hyderabad",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans"
  ];

  const handleIPLTEAMChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      IPL_TEAMS: value, // Update the IPL_TEAM filter
      page: 1, // Reset to the first page
    }));
  };


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
                <BreadcrumbPage>List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className="container mx-auto px-4 md:px-6 pb-4">
        {/* Filter and Search Section */}
        <span>
          <div className="text-end py-4">
            <p className="text-md font-semibold text-red-500 dark:text-red-400 animate-blink">
              Only 10 teams scoreboard should be visible from current date!!
            </p>
          </div>

          <style>{`
            @keyframes blink {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0;
              }
            }
            .animate-blink {
              animation: blink 1.5s infinite;
            }
            
            /* Additional CSS for better visual effects */
            .match-card {
              transition: all 0.2s ease-in-out;
              border-radius: 0.5rem;
              overflow: hidden;
              border: 1px solid transparent;
            }
            
            .match-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border-color: rgba(99, 102, 241, 0.4);
            }
            
            .team-logo {
              transition: transform 0.3s ease;
            }
            
            .match-card:hover .team-logo {
              transform: scale(1.05);
            }
            
            /* Pulse animation for Live badge */
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.6;
              }
            }
            
            .animate-pulse {
              animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            /* Loading spinner */
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            
            /* Button loading state */
            .btn-loading {
              position: relative;
              color: transparent !important;
            }
            
            .btn-loading::after {
              content: "";
              position: absolute;
              left: calc(50% - 0.5rem);
              top: calc(50% - 0.5rem);
              width: 1rem;
              height: 1rem;
              border: 2px solid rgba(255, 255, 255, 0.2);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
          `}</style>
        </span>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto flex flex-row gap-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search teams or venues ..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="w-full md:w-64 pl-9"
            />
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <Select
                onValueChange={handleTypeChange}
                value={filters.type || "All"}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by time..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">ALL</SelectItem>
                  <SelectItem value="today">TODAY</SelectItem>
                  <SelectItem value="tomorrow">TOMORROW</SelectItem>
                  <SelectItem value="yesterday">YESTERDAY</SelectItem>
                </SelectContent>
              </Select>
              <Select
                onValueChange={handleIPLTEAMChange}
                value={filters.IPL_TEAMS || IPL_TEAMS[0]} // Default to the first team if no team is selected
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by IPL TEAM ..." />
                </SelectTrigger>
                <SelectContent>
                  {IPL_TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {showPagination && (
            <div className="flex flex-col items-center justify-center mt-8 space-y-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>

                {/* Render page numbers (might be limited if totalPages is unknown) */}
                {getPageNumbers()}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={isNextDisabled} // Use calculated disabled state
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </div>
              {/* Page Info Text (adjust based on whether totalItems is known) */}
              <div className="text-sm text-muted-foreground">
                {pagination.totalItems !== -1
                  ? `Page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalItems} total matches)`
                  : `Page ${pagination.currentPage}` /* Don't show total pages/items if unknown */
                }
              </div>
            </div>
          )}


        </div>

        {/* Loading State */}
        {isPending && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading matches...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isPending && (
          <div className="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 font-medium">Error loading matches.</p>
            <p className="text-sm text-red-500 dark:text-red-500 mt-1">{error.message || "Please try again later."}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate({ ...filters, page: filters.page - 1, type: filters.type === "All" ? null : filters.type })}>
              Retry
            </Button>
          </div>
        )}

        {/* Content Display: Not Pending and No Error */}
        {!isPending && !error && (
          <>
            {/* No Matches Found State */}
            {!matches || matches.length === 0 ? (
              <div className="text-center py-16">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No matches found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {filters.search || filters.type !== 'All' ? 'Try adjusting your search or filters.' : 'There are currently no matches scheduled or the API response is not in the expected format.'}
                </p>
              </div>
            ) : (
              // Matches List
              <div className="space-y-6">
                {matches.map((match) => (
                  <div key={match.id} className="flex flex-col match-card bg-white dark:bg-gray-800 shadow-sm">
                    {/* Header Section */}
                    <div className="border-b dark:border-gray-700 p-3 md:p-4 bg-muted/40 dark:bg-gray-800/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Match {match.id}
                          </span>
                          {match.isLive && (
                            <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                              • LIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate hidden sm:block" title={match.venue}>
                          <span className="flex flex-row gap-1 text-sm font-bold tracking-wider">
                            <MapPin className="h-5 w-5" /> {match.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body Section */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                        {/* Date and Time Info */}
                        <div className="flex items-center space-x-4 lg:justify-start">
                          <div className="flex-shrink-0 text-center">
                            {/* Robust date handling */}
                            <div className="text-xs uppercase text-muted-foreground">{match.date ? new Date(match.date).toLocaleString('en-US', { month: 'short' }) : 'N/A'}</div>
                            <div className="text-xl font-bold">{match.day || '-'}</div>
                          </div>
                          <div className="border-l pl-4 dark:border-gray-600 text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {/* Robust date formatting */}
                              <span>{match.date ? new Date(match.date).toLocaleDateString('en-GB') : 'No date'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Timer className="h-4 w-4" />
                              <span>{match.time || 'N/A'} IST</span>
                            </div>
                          </div>
                        </div>

                        {/* Teams and Scores */}
                        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                          {/* Team 1 */}
                          <div className="flex flex-col items-center text-center w-24">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border overflow-hidden flex items-center justify-center bg-background p-1 team-logo">
                              <span className="text-lg font-bold text-primary">
                                {match.team1
                                  ?.split(' ')
                                  .map(word => word[0])
                                  .join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium truncate w-full">{match.team1 || 'TBA'}</span>
                            {match.team1Score && <span className="text-xs font-bold text-primary">{match.team1Score}</span>}
                          </div>

                          {/* VS */}
                          <span className="text-lg font-bold text-muted-foreground">VS</span>

                          {/* Team 2 */}
                          <div className="flex flex-col items-center text-center w-24">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border overflow-hidden flex items-center justify-center bg-background p-1 team-logo">
                              <span className="text-lg font-bold text-primary">
                                {match.team2
                                  ?.split(' ')
                                  .map(word => word[0])
                                  .join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium truncate w-full">{match.team2 || 'TBA'}</span>
                            {match.team2Score && <span className="text-xs font-bold text-primary">{match.team2Score}</span>}
                          </div>
                        </div>

                        {/* Toss Result and Action */}
                        <div className="flex flex-col items-center lg:items-end mt-4 lg:mt-0">
                          {match.tossResult && (
                            <div className="text-xs text-center lg:text-right font-medium mb-2 text-muted-foreground italic px-2">
                              "{match.tossResult}"
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className={`mt-auto cursor-pointer ${loadingMatchId === match.id ? 'btn-loading' : ''}`}
                            onClick={() => handleViewMatch(match)}
                            disabled={loadingMatchId === match.id}
                          >
                            View Match
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
          </>
        )}
      </div>
    </SidebarInset>
  )
}