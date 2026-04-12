import { supabase } from "@/integrations/supabase/client";

// Cast to any to bypass strict typing since tables are created via migration
const db = supabase as any;

export async function fetchAll(table: string) {
  const { data, error } = await db.from(table).select("*").order(getIdColumn(table), { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertRow(table: string, row: Record<string, any>) {
  const { data, error } = await db.from(table).insert(row).select();
  if (error) throw error;
  return data;
}

export async function updateRow(table: string, id: number, row: Record<string, any>) {
  const idCol = getIdColumn(table);
  const { data, error } = await db.from(table).update(row).eq(idCol, id).select();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: string, id: number) {
  const idCol = getIdColumn(table);
  const { error } = await db.from(table).delete().eq(idCol, id);
  if (error) throw error;
}

export async function runRawQuery(query: string) {
  const { data, error } = await db.rpc('execute_sql', { query_text: query });
  if (error) throw error;
  return data;
}

function getIdColumn(table: string): string {
  const map: Record<string, string> = {
    victim: 'victim_id',
    crime: 'crime_id',
    fir: 'fir_id',
    investigation: 'investigation_id',
    criminal: 'criminal_id',
    officer: 'officer_id',
    officer_investigation: 'officer_id',
    evidence: 'evidence_id',
    court_case: 'case_id',
    hearing: 'hearing_id',
    verdict: 'verdict_id',
    parole: 'parole_id',
    prison_record: 'prison_record_id',
  };
  return map[table] || 'id';
}

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface TableDef {
  name: string;
  label: string;
  idColumn: string;
  fields: FieldDef[];
}

export const TABLE_DEFS: TableDef[] = [
  {
    name: 'victim', label: 'Victims', idColumn: 'victim_id',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Rahul Sharma' },
      { name: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 32' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { name: 'contact', label: 'Contact No', type: 'text', placeholder: 'e.g. 9876543210' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address' },
    ]
  },
  {
    name: 'crime', label: 'Crimes', idColumn: 'crime_id',
    fields: [
      { name: 'crime_type', label: 'Crime Type', type: 'text', required: true, placeholder: 'e.g. Robbery' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the crime' },
      { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Connaught Place, Delhi' },
      { name: 'crime_date', label: 'Date of Crime', type: 'date' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    ]
  },
  {
    name: 'fir', label: 'FIRs', idColumn: 'fir_id',
    fields: [
      { name: 'crime_id', label: 'Crime ID', type: 'number', required: true, placeholder: 'Reference crime_id' },
      { name: 'fir_date', label: 'FIR Date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Under Investigation', 'In Court', 'Closed'] },
      { name: 'station_id', label: 'Station ID', type: 'number', placeholder: 'e.g. 101' },
      { name: 'victim_id', label: 'Victim ID', type: 'number', required: true, placeholder: 'Reference victim_id' },
    ]
  },
  {
    name: 'investigation', label: 'Investigations', idColumn: 'investigation_id',
    fields: [
      { name: 'crime_id', label: 'Crime ID', type: 'number', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Closed'] },
    ]
  },
  {
    name: 'criminal', label: 'Criminals', idColumn: 'criminal_id',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'biometric_hash', label: 'Biometric Hash', type: 'text' },
      { name: 'crime_id', label: 'Crime ID', type: 'number' },
      { name: 'investigation_id', label: 'Investigation ID', type: 'number' },
    ]
  },
  {
    name: 'officer', label: 'Officers', idColumn: 'officer_id',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'rank', label: 'Rank', type: 'select', options: ['Constable', 'Sub-Inspector', 'Inspector', 'DSP', 'ACP', 'DCP', 'SP'] },
      { name: 'station_id', label: 'Station ID', type: 'number' },
      { name: 'contact_no', label: 'Contact No', type: 'text' },
    ]
  },
  {
    name: 'officer_investigation', label: 'Officer Assignments', idColumn: 'officer_id',
    fields: [
      { name: 'officer_id', label: 'Officer ID', type: 'number', required: true },
      { name: 'investigation_id', label: 'Investigation ID', type: 'number', required: true },
    ]
  },
  {
    name: 'evidence', label: 'Evidence', idColumn: 'evidence_id',
    fields: [
      { name: 'fir_id', label: 'FIR ID', type: 'number', required: true },
      { name: 'type', label: 'Evidence Type', type: 'select', options: ['Weapon', 'CCTV', 'Medical', 'Digital', 'Forensic', 'Document', 'Other'] },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'collection_date', label: 'Collection Date', type: 'date' },
      { name: 'current_status', label: 'Status', type: 'select', options: ['Collected', 'In Lab', 'Submitted', 'Returned'] },
    ]
  },
  {
    name: 'court_case', label: 'Court Cases', idColumn: 'case_id',
    fields: [
      { name: 'fir_id', label: 'FIR ID', type: 'number', required: true },
      { name: 'court_name', label: 'Court Name', type: 'text' },
      { name: 'judge_name', label: 'Judge Name', type: 'text' },
      { name: 'case_status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Closed'] },
    ]
  },
  {
    name: 'hearing', label: 'Hearings', idColumn: 'hearing_id',
    fields: [
      { name: 'case_id', label: 'Case ID', type: 'number', required: true },
      { name: 'hearing_date', label: 'Hearing Date', type: 'date', required: true },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
    ]
  },
  {
    name: 'verdict', label: 'Verdicts', idColumn: 'verdict_id',
    fields: [
      { name: 'case_id', label: 'Case ID', type: 'number', required: true },
      { name: 'verdict_type', label: 'Verdict', type: 'select', options: ['Guilty', 'Not Guilty', 'Dismissed', 'Acquitted'] },
      { name: 'verdict_date', label: 'Verdict Date', type: 'date' },
      { name: 'sentence_duration', label: 'Sentence Duration', type: 'text', placeholder: 'e.g. 2 years' },
    ]
  },
  {
    name: 'parole', label: 'Parole', idColumn: 'parole_id',
    fields: [
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Revoked'] },
      { name: 'prison_record_id', label: 'Prison Record ID', type: 'number' },
    ]
  },
  {
    name: 'prison_record', label: 'Prison Records', idColumn: 'prison_record_id',
    fields: [
      { name: 'criminal_id', label: 'Criminal ID', type: 'number', required: true },
      { name: 'prison_name', label: 'Prison Name', type: 'text' },
      { name: 'prison_location', label: 'Prison Location', type: 'text' },
      { name: 'admission_date', label: 'Admission Date', type: 'date' },
      { name: 'release_date', label: 'Release Date', type: 'date' },
      { name: 'parole_id', label: 'Parole ID', type: 'number' },
    ]
  },
];
