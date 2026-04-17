"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/lead";
import type { Listing } from "@/types/listing";

interface SearchResults {
  leads: Pick<Lead, "id" | "name" | "phone" | "status">[];
  listings: Pick<Listing, "id" | "title" | "city" | "status">[];
}

function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ leads: [], listings: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults({ leads: [], listings: [] });
      return;
    }

    setIsSearching(true);
    const supabase = createClient();

    const [leadsRes, listingsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, name, phone, status")
        .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(5),
      supabase
        .from("listings")
        .select("id, title, city, status")
        .or(`title.ilike.%${term}%,city.ilike.%${term}%,locality.ilike.%${term}%`)
        .limit(5),
    ]);

    setResults({
      leads: (leadsRes.data as SearchResults["leads"]) || [],
      listings: (listingsRes.data as SearchResults["listings"]) || [],
    });
    setIsSearching(false);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  const totalResults = results.leads.length + results.listings.length;
  const showResults = isOpen && query.length >= 2;

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 w-64">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search... (Ctrl+K)"
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults({ leads: [], listings: [] }); }}>
            <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-center text-sm text-slate-400">Searching...</div>
          ) : totalResults === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-slate-400">No results found</div>
          ) : (
            <>
              {results.leads.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                    Leads
                  </div>
                  {results.leads.map((lead) => (
                    <button
                      key={lead.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <Users className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{lead.name}</p>
                        {lead.phone && (
                          <p className="truncate text-xs text-slate-500">{lead.phone}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] capitalize text-slate-600">
                        {lead.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.listings.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                    Listings
                  </div>
                  {results.listings.map((listing) => (
                    <button
                      key={listing.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/listings/${listing.id}`)}
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{listing.title}</p>
                        {listing.city && (
                          <p className="truncate text-xs text-slate-500">{listing.city}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] capitalize text-slate-600">
                        {listing.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { GlobalSearch };
