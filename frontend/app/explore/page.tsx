"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useMemo } from "react";
import { getAllCampaigns } from "@/lib/contract";
import { Campaign } from "@/types";
import CampaignCard from "@/components/campaign/CampaignCard";
import { CampaignCardSkeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { Search, LayoutGrid } from "lucide-react";

const categoryOptions = [{ value: "", label: "All Categories" }, ...CATEGORIES];
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "goal_reached", label: "Goal Reached" },
  { value: "ended", label: "Ended" },
];

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const [all, setAll] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllCampaigns()
      .then(setAll)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, category, status, sort]);

  const filtered = useMemo(() => {
    let list = [...all];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (category) list = list.filter((c) => c.category === category);
    if (status) list = list.filter((c) => c.status === status);

    switch (sort) {
      case "oldest":     list.sort((a, b) => a.id - b.id); break;
      case "most_funded":list.sort((a, b) => Number(b.amountRaised - a.amountRaised)); break;
      case "ending_soon":list.sort((a, b) => a.deadline - b.deadline); break;
      case "most_donors":list.sort((a, b) => b.donorCount - a.donorCount); break;
      default:           list.sort((a, b) => b.id - a.id); // newest
    }

    return list;
  }, [all, search, category, status, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Campaigns</h1>
        <p className="text-gray-400">Discover and support causes that matter</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          />
        </div>
        <Select options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-44" />
        <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-36" />
        <Select options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-44" />
      </div>

      {!loading && (
        <p className="text-sm text-gray-500 mb-6">{filtered.length} campaign{filtered.length !== 1 ? "s" : ""} found</p>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <CampaignCardSkeleton key={i} />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="py-20 text-center">
          <LayoutGrid className="mx-auto h-12 w-12 text-gray-700 mb-4" />
          <p className="text-gray-400 text-lg font-medium">No campaigns found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
