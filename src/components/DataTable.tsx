import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  data: Record<string, any>[];
  columns: string[];
  idColumn: string;
  onDelete?: (id: number) => void;
  title: string;
}

function formatValue(val: any, col: string): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-muted-foreground italic">—</span>;
  if (col === 'severity') {
    const colors: Record<string, string> = {
      Low: 'bg-accent text-accent-foreground',
      Medium: 'bg-warning/20 text-warning',
      High: 'bg-destructive/20 text-destructive',
      Critical: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={colors[val] || ''}>{val}</Badge>;
  }
  if (col === 'status' || col === 'case_status' || col === 'current_status') {
    return <Badge variant="outline">{val}</Badge>;
  }
  if (col === 'verdict_type') {
    const colors: Record<string, string> = {
      Guilty: 'bg-destructive/20 text-destructive',
      'Not Guilty': 'bg-accent/20 text-accent',
      Dismissed: 'bg-muted text-muted-foreground',
      Acquitted: 'bg-accent text-accent-foreground',
    };
    return <Badge className={colors[val] || ''}>{val}</Badge>;
  }
  return String(val);
}

export function DataTable({ data, columns, idColumn, onDelete, title }: DataTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-semibold flex items-center justify-between">
          {title}
          <Badge variant="secondary">{data.length} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col} className="text-sm font-semibold uppercase tracking-wider text-zinc-300 whitespace-nowrap">
                    {col.replace(/_/g, ' ')}
                  </TableHead>
                ))}
                {onDelete && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onDelete ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow key={row[idColumn] ?? i}>
                    {columns.map(col => (
                      <TableCell key={col} className="whitespace-nowrap text-base font-medium text-zinc-200">
                        {formatValue(row[col], col)}
                      </TableCell>
                    ))}
                    {onDelete && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(row[idColumn])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
