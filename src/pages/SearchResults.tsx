import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/portal/Header";
import SearchBar from "@/components/portal/SearchBar";
import { searchSite, SEARCH_INDEX, SearchEntry } from "@/lib/searchIndex";
import { Search, ArrowRight, ExternalLink, Compass } from "lucide-react";

const CATEGORIES = ["All", "Apps", "Media", "Shopping", "Info", "Tools", "Finance"] as const;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const activeCat = searchParams.get("cat") || "All";

  const allResults = useMemo(() => searchSite(query), [query]);
  const results = useMemo(
    () => (activeCat === "All" ? allResults : allResults.filter((r) => r.category === activeCat)),
    [allResults, activeCat]
  );

  const setCat = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("cat");
    else next.set("cat", cat);
    setSearchParams(next);
  };

  // Categories that actually have results, for the filter tabs
  const availableCats = new Set(allResults.map((r) => r.category));

  const ResultLink = ({ result, children, className }: { result: SearchEntry; children: React.ReactNode; className?: string }) =>
    result.external ? (
      <a href={result.path} className={className}>{children}</a>
    ) : (
      <Link to={result.path} className={className}>{children}</Link>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-0">
          <SearchBar initialQuery={query} />

          <div className="flex items-center gap-6 mt-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.filter((c) => c === "All" || availableCats.has(c)).map((tab) => (
              <button
                key={tab}
                onClick={() => setCat(tab)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCat === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-xl font-semibold mb-1">
              Search results for <span className="text-primary">"{query}"</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} on Sholok
            </p>
          </div>

          {/* No query */}
          {!query.trim() && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Type something in the search bar to explore Sholok.</p>
            </div>
          )}

          {/* No results */}
          {query.trim() && results.length === 0 && (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">No matches for "{query}"</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try a different keyword, or jump to one of our services below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {SEARCH_INDEX.slice(0, 8).map((s) => (
                  <ResultLink
                    key={s.path}
                    result={s}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {s.title}
                  </ResultLink>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-5">
            {results.map((result) => (
              <ResultLink
                key={result.path}
                result={result}
                className="block group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">sholok{result.path}</span>
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {result.category}
                  </span>
                  {result.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                </div>
                <h3 className="text-xl text-primary font-medium group-hover:underline mb-1 flex items-center gap-2">
                  {result.title}
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{result.description}</p>
                <div className="mt-3 text-xs font-medium text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                  Open {result.title} <ArrowRight className="w-3 h-3" />
                </div>
              </ResultLink>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {results.length > 0 && (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold mb-2">Top result</h3>
              <ResultLink result={results[0]} className="block group">
                <p className="text-lg font-medium text-primary group-hover:underline">{results[0].title}</p>
                <p className="text-sm text-muted-foreground mt-1">{results[0].description}</p>
              </ResultLink>
            </div>
          )}

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-semibold mb-4">Explore Sholok</h3>
            <div className="flex flex-wrap gap-2">
              {SEARCH_INDEX.slice(0, 10).map((s) => (
                <ResultLink
                  key={s.path}
                  result={s}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                >
                  {s.title}
                </ResultLink>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
