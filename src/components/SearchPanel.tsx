import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown, ChevronsUpDown, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableDef } from "@/lib/supabase-helpers";

// ─── Per-table search config ─────────────────────────────────────────────────
interface SearchFieldConfig {
  key: string;          // column name in DB
  label: string;        // human-friendly label
  type: "text" | "dropdown" | "date";
}


// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatColLabel(col: string) {
  return col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-400/30 text-indigo-200 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('pending') || s.includes('open') || s.includes('ongoing') || s.includes('active')) {
    return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  }
  if (s.includes('closed') || s.includes('finished') || s.includes('returned') || s.includes('resolved') || s.includes('guilty') || s.includes('acquitted')) {
    return "bg-green-500/20 text-green-300 border-green-500/30";
  }
  if (s.includes('revoked') || s.includes('critical') || s.includes('high') || s.includes('dismissed')) {
    return "bg-red-500/20 text-red-300 border-red-500/30";
  }
  if (s.includes('investigation') || s.includes('lab') || s.includes('progress') || s.includes('submitted') || s.includes('medium')) {
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  }
  return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
}

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

function exportCSV(rows: any[], columns: string[], filename: string) {
  const header = columns.join(",");
  const body = rows
    .map((r) => columns.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface SearchPanelProps {
  tableDef: TableDef;
  allData: any[];
  onDelete?: (id: number) => void;
}

type SortDir = "asc" | "desc" | null;

const PAGE_SIZES = [10, 25, 50];

export function SearchPanel({ tableDef, allData, onDelete }: SearchPanelProps) {
  const searchConfig = useMemo(() => {
    const config: SearchFieldConfig[] = [];
    config.push({ key: tableDef.idColumn, label: formatColLabel(tableDef.idColumn), type: 'text' });
    tableDef.fields.forEach(f => {
      config.push({
        key: f.name,
        label: f.label,
        type: f.type === 'select' ? 'dropdown' : (f.type === 'date' ? 'date' : 'text')
      });
    });
    return config;
  }, [tableDef]);

  const columns = useMemo(
    () => (allData.length > 0 ? Object.keys(allData[0]) : [tableDef.idColumn, ...tableDef.fields.map((f) => f.name)]),
    [allData, tableDef]
  );

  // ── Filter state ──────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // ── Sort & page state ─────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Compute distinct dropdown options from allData ────────────────────────
  const dropdownOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    searchConfig.forEach((cfg) => {
      if (cfg.type === "dropdown") {
        const vals = [...new Set(allData.map((r) => r[cfg.key]).filter((v) => v !== null && v !== undefined && v !== ""))].sort() as string[];
        opts[cfg.key] = vals;
      }
    });
    return opts;
  }, [allData, searchConfig]);

  // ── Compute text search keys (all non-dropdown, non-date fields used in keyword search) ──
  const textSearchKeys = useMemo(
    () => searchConfig.filter((c) => c.type === "text").map((c) => c.key),
    [searchConfig]
  );

  // ── Global keyword fallback: also search across all string columns ─────────
  const allTextCols = useMemo(
    () => columns.filter((c) => {
      const sample = allData.find((r) => r[c] !== null && r[c] !== undefined);
      return sample ? typeof sample[c] === "string" || typeof sample[c] === "number" : true;
    }),
    [columns, allData]
  );

  const effectiveTextKeys = textSearchKeys.length > 0 ? textSearchKeys : allTextCols;

  // ── Filtered + sorted result ──────────────────────────────────────────────
  const results = useMemo(() => {
    let rows = [...allData];

    // Keyword filter (partial, case-insensitive across text keys)
    if (activeKeyword.trim()) {
      const kw = activeKeyword.toLowerCase();
      rows = rows.filter((r) =>
        effectiveTextKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(kw))
      );
    }

    // Specific Filters (Dropdowns & Explicit Text Fields)
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val && val !== "__all__") {
        const fieldConfig = searchConfig.find(c => c.key === key);
        if (fieldConfig?.type === 'text') {
           rows = rows.filter((r) => String(r[key] ?? "").toLowerCase().includes(val.toLowerCase()));
        } else {
           rows = rows.filter((r) => String(r[key] ?? "") === val);
        }
      }
    });

    // Sort
    if (sortCol && sortDir) {
      rows.sort((a, b) => {
        const av = String(a[sortCol] ?? "");
        const bv = String(b[sortCol] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    return rows;
  }, [allData, activeKeyword, activeFilters, sortCol, sortDir, effectiveTextKeys, searchConfig]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const paged = results.slice((page - 1) * pageSize, page * pageSize);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setActiveKeyword(keyword);
    setActiveFilters({ ...filters });
    setPage(1);
  }, [keyword, filters]);

  const handleReset = useCallback(() => {
    setKeyword("");
    setFilters({});
    setActiveKeyword("");
    setActiveFilters({});
    setSortCol(null);
    setSortDir(null);
    setPage(1);
  }, []);

  const handleSort = (col: string) => {
    if (sortCol !== col) { setSortCol(col); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortCol(null); setSortDir(null); }
  };

  // Allow Enter key to trigger search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasDateFields = searchConfig.some((c) => c.type === "date");
  const dropdownFields = searchConfig.filter((c) => c.type === "dropdown");
  const textFields = searchConfig.filter((c) => c.type === "text");
  const hasAdvanced = hasDateFields || dropdownFields.length > 2;

  const primaryTextPlaceholder = textFields.length > 0
    ? `Search by ${textFields.map((f) => f.label.toLowerCase()).join(", ")}…`
    : "Type to search…";

  return (
    <Card className="border border-indigo-500/20 bg-zinc-900/60 backdrop-blur-sm shadow-xl shadow-indigo-950/20">
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-indigo-200">
          <Search className="h-5 w-5 text-indigo-400" />
          Search & Filter {tableDef.label}
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-1">
          Find records quickly — no technical knowledge needed.
        </p>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {/* ── Row 1: Global Keyword & Action Buttons ─────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 items-end border-b border-white/5 pb-4">
          <div className="flex-1 w-full relative">
            <Label className="text-sm font-semibold text-indigo-300 flexitems-center gap-2 mb-2 block tracking-wider">
              <Search className="h-4 w-4 inline mr-1" />
              Global Quick Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type anything to search across all columns at once..."
                className="pl-9 bg-zinc-800/80 border-indigo-500/30 focus:border-indigo-400 text-zinc-100 placeholder:text-zinc-500 h-11 text-base shadow-inner"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 w-full md:w-auto h-11">
            <Button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-full px-6 gap-2 transition-all w-full md:w-auto text-base shadow-md shadow-indigo-900/20"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-white/5 h-full gap-2 w-full md:w-auto text-base"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* ── Row 2: Specific Column Filters ────────────────────────────── */}
        <div>
          <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">
            Specific Column Filters
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            {/* Dynamic fields mapped in exact column order */}
            {searchConfig.map((cfg) => {
              if (cfg.type === "dropdown") {
                return (
                  <div key={cfg.key} className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis">
                      {cfg.label}
                    </Label>
                    <Select
                      value={filters[cfg.key] || "__all__"}
                      onValueChange={(v) => setFilters((prev) => ({ ...prev, [cfg.key]: v }))}
                    >
                      <SelectTrigger className="bg-zinc-800/60 border-zinc-700 text-zinc-100 hover:border-zinc-600 focus:border-indigo-500">
                        <SelectValue placeholder={`All ${cfg.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All</SelectItem>
                        {(dropdownOptions[cfg.key] ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              } else if (cfg.type === "date") {
                return (
                  <div key={cfg.key} className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis">
                      {cfg.label}
                    </Label>
                    <Input
                      type="date"
                      value={filters[cfg.key] || ""}
                      onChange={(e) => setFilters((prev) => ({ ...prev, [cfg.key]: e.target.value }))}
                      className="bg-zinc-800/60 border-zinc-700 focus:border-indigo-500 text-zinc-100 placeholder:text-zinc-600"
                    />
                  </div>
                );
              } else {
                return (
                  <div key={cfg.key} className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis">
                      {cfg.label}
                    </Label>
                    <div className="relative">
                      <Input
                        value={filters[cfg.key] || ""}
                        onChange={(e) => setFilters((prev) => ({ ...prev, [cfg.key]: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        placeholder={`Filter by ${cfg.label.toLowerCase()}...`}
                        className="bg-zinc-800/60 border-zinc-700 focus:border-indigo-500 text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* ── Results section ─────────────────────────────────────────────── */}
        <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 font-medium">
                  {results.length === 0
                    ? "No matching records"
                    : `${results.length} record${results.length !== 1 ? "s" : ""} found`}
                </span>
                {results.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Page {page} / {totalPages}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Rows per page */}
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Rows:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs bg-zinc-800/60 border-zinc-700 text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map((s) => (
                          <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* CSV export */}
                {results.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-700 text-zinc-400 hover:text-white gap-1.5"
                    onClick={() => exportCSV(results, columns, `${tableDef.name}_search_results.csv`)}
                  >
                    <Download className="h-3 w-3" />
                    Export CSV
                  </Button>
                )}
              </div>
            </div>

            {/* Empty state */}
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-dashed border-zinc-700/50">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">No records match your search</p>
                <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or keyword</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="mt-4 text-indigo-400 hover:text-indigo-200"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="rounded-xl border border-white/8 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/8 bg-zinc-800/60 hover:bg-zinc-800/60">
                          {columns.map((col) => (
                            <TableHead
                              key={col}
                              className="text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap cursor-pointer select-none hover:text-zinc-100 transition-colors"
                              onClick={() => handleSort(col)}
                            >
                              <span className="flex items-center gap-1">
                                {formatColLabel(col)}
                                {sortCol === col ? (
                                  sortDir === "asc"
                                    ? <ChevronUp className="h-3 w-3 text-indigo-400" />
                                    : <ChevronDown className="h-3 w-3 text-indigo-400" />
                                ) : (
                                  <ChevronsUpDown className="h-3 w-3 text-zinc-700" />
                                )}
                              </span>
                            </TableHead>
                          ))}
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paged.map((row, i) => (
                          <TableRow
                            key={row[tableDef.idColumn] ?? i}
                            className="border-white/5 hover:bg-indigo-950/20 transition-colors"
                          >
                            {columns.map((col) => {
                              const raw = formatCellValue(row[col]);
                              const isKeywordCol = effectiveTextKeys.includes(col) && activeKeyword.trim();
                              
                              let content = isKeywordCol ? highlightText(raw, activeKeyword) : raw;
                              
                              const isStatusCol = col.toLowerCase().includes('status') || col.toLowerCase() === 'severity' || col.toLowerCase().includes('verdict_type');
                              if (isStatusCol && raw !== "—") {
                                content = (
                                  <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(raw)}`}>
                                    {content}
                                  </Badge>
                                );
                              }

                              return (
                                <TableCell
                                  key={col}
                                  className="text-sm text-zinc-200 whitespace-nowrap py-2.5"
                                >
                                  {content}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-right">
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                  onClick={() => onDelete(row[tableDef.idColumn])}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-zinc-700 text-zinc-400 hover:text-white"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                      // Show pages around current
                      let p: number;
                      if (totalPages <= 5) p = idx + 1;
                      else if (page <= 3) p = idx + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + idx;
                      else p = page - 2 + idx;
                      return (
                        <Button
                          key={p}
                          size="sm"
                          variant={p === page ? "default" : "outline"}
                          className={`h-8 w-8 p-0 text-sm ${p === page
                            ? "bg-indigo-600 text-white border-0 hover:bg-indigo-500"
                            : "border-zinc-700 text-zinc-400 hover:text-white"
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    })}

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-zinc-700 text-zinc-400 hover:text-white"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
