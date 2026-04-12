import { useParams } from "react-router-dom";
import { TablePage } from "@/components/TablePage";
import { TABLE_DEFS } from "@/lib/supabase-helpers";
import { AuroraBackground } from "@/components/ui/aurora-background";

const slugToTable: Record<string, string> = {
  victims: 'victim',
  crimes: 'crime',
  firs: 'fir',
  investigations: 'investigation',
  criminals: 'criminal',
  officers: 'officer',
  'officer-assignments': 'officer_investigation',
  evidence: 'evidence',
  'court-cases': 'court_case',
  hearings: 'hearing',
  verdicts: 'verdict',
  parole: 'parole',
  'prison-records': 'prison_record',
};

export default function TablePageWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const tableName = slugToTable[slug || ''];
  const tableDef = TABLE_DEFS.find(t => t.name === tableName);

  if (!tableDef) {
    return <div className="p-8 text-center text-muted-foreground">Table not found</div>;
  }

  return (
    <AuroraBackground className="w-full min-h-[calc(100vh-5rem)] rounded-xl !items-start !justify-start">
      <div className="w-full relative z-10 px-8 py-10 md:px-12 md:py-14">
        <TablePage key={tableDef.name} tableDef={tableDef} />
      </div>
    </AuroraBackground>
  );
}
