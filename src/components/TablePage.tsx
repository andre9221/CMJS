import { useEffect, useState } from "react";
import { DynamicForm } from "./DynamicForm";
import { DataTable } from "./DataTable";
import { SqlPanel } from "./SqlPanel";
import { fetchAll, insertRow, deleteRow } from "@/lib/supabase-helpers";
import type { TableDef } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

interface TablePageProps {
  tableDef: TableDef;
}

export function TablePage({ tableDef }: TablePageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const rows = await fetchAll(tableDef.name);
      setData(rows || []);
    } catch (e: any) {
      toast.error(`Failed to load ${tableDef.label}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tableDef.name]);

  const handleInsert = async (row: Record<string, any>) => {
    try {
      await insertRow(tableDef.name, row);
      toast.success('Record added successfully');
      loadData();
    } catch (e: any) {
      toast.error(`Insert failed: ${e.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRow(tableDef.name, id);
      toast.success('Record deleted');
      loadData();
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const columns = data.length > 0
    ? Object.keys(data[0])
    : [tableDef.idColumn, ...tableDef.fields.map(f => f.name)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground drop-shadow-lg mb-2">{tableDef.label} Registry</h1>
          <p className="text-zinc-400 font-normal text-xl max-w-2xl leading-relaxed">
            Securely manage and track all {tableDef.label.toLowerCase()} records in the centralized forensic database.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Terminal className="h-4 w-4" />
              SQL Console
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[500px] p-0">
            <div className="p-6 h-full">
              <SqlPanel defaultTable={tableDef.name} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <DynamicForm
        fields={tableDef.fields}
        onSubmit={handleInsert}
        title={`Add New ${tableDef.label.replace(/s$/, '')}`}
        loading={loading}
      />

      <DataTable
        data={data}
        columns={columns}
        idColumn={tableDef.idColumn}
        onDelete={handleDelete}
        title={`${tableDef.label} Records`}
      />
    </div>
  );
}
