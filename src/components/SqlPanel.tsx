import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play, Terminal, Trash2 } from "lucide-react";
import { runRawQuery } from "@/lib/supabase-helpers";
import { toast } from "sonner";

interface SqlPanelProps {
  defaultTable: string;
}

export function SqlPanel({ defaultTable }: SqlPanelProps) {
  const [query, setQuery] = useState(`SELECT * FROM ${defaultTable} LIMIT 20;`);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const executeQuery = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const data = await runRawQuery(query);
      const parsed = Array.isArray(data) ? data : data ? [data] : [];
      setResults(parsed);
      toast.success(`Query executed — ${parsed.length} rows returned`);
    } catch (e: any) {
      setError(e.message || 'Query failed');
      toast.error('Query failed');
    } finally {
      setRunning(false);
    }
  };

  const presetQueries = [
    { label: 'All Records', sql: `SELECT * FROM ${defaultTable};` },
    { label: 'Count', sql: `SELECT COUNT(*) as total FROM ${defaultTable};` },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-oranienbaum flex items-center gap-2 text-indigo-200">
          <Terminal className="h-5 w-5 text-indigo-400" />
          SQL Query Console
        </CardTitle>
        <div className="flex gap-1 flex-wrap">
          {presetQueries.map(p => (
            <Badge
              key={p.label}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
              onClick={() => setQuery(p.sql)}
            >
              {p.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="font-mono text-xs min-h-[100px] resize-y bg-muted/50"
          placeholder="Enter SQL query..."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={executeQuery} disabled={running || !query.trim()} className="font-rye tracking-widest px-4">
            <Play className="h-3 w-3 mr-2" />
            {running ? 'Running...' : 'Execute'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setResults(null); setError(null); }}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive font-mono">
            {error}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(results[0]).map(col => (
                    <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((val: any, j) => (
                      <TableCell key={j} className="text-xs font-mono whitespace-nowrap">
                        {val === null ? <span className="text-muted-foreground">NULL</span> : String(val)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Query returned 0 rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}
