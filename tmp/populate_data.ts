import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bonnwlfifwwszjsvkcia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbm53bGZpZnd3c3pqc3ZrY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTQ0MjIsImV4cCI6MjA4ODc5MDQyMn0.nOxQ4x2Fw-3b8R6RqB24nof0NUhmYpzLkchyfFBh6CY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function populate() {
  console.log("Populating data...");

  // Victims (6 already exist, adding 4 more)
  const victims = [
    { name: "Priya Sharma", age: 28, gender: "Female", contact: "9876543211", address: "Sector 15, Gurgaon" },
    { name: "Arjun Mehta", age: 45, gender: "Male", contact: "9876543212", address: "Juhu, Mumbai" },
    { name: "Ananya Iyer", age: 22, gender: "Female", contact: "9876543213", address: "Anna Nagar, Chennai" },
    { name: "Sandeep Singh", age: 35, gender: "Male", contact: "9876543214", address: "Chandigarh" },
  ];

  // Crimes
  const crimes = [
    { crime_type: "Cyber Fraud", description: "Phishing attack targeting bank accounts", location: "Online", crime_date: "2024-03-15", severity: "High" },
    { crime_type: "Grand Theft", description: "Luxury vehicle stolen from parking", location: "Hauz Khas, Delhi", crime_date: "2024-03-20", severity: "Critical" },
    { crime_type: "Vandalism", description: "Public property damaged during protests", location: "Public Square", crime_date: "2024-03-22", severity: "Low" },
    { crime_type: "Assault", description: "Physical altercation at a nightclub", location: "Bandra, Mumbai", crime_date: "2024-03-25", severity: "Medium" },
    { crime_type: "Burglary", description: "Residential break-in during holidays", location: "Salt Lake, Kolkata", crime_date: "2024-03-28", severity: "High" },
  ];

  // Officers
  const officers = [
    { name: "Inspector Vikram Rathore", rank: "Inspector", station_id: 101, contact_no: "9988776655" },
    { name: "Sub-Inspector Meera Das", rank: "Sub-Inspector", station_id: 102, contact_no: "9988776656" },
    { name: "DSP Alok Kumar", rank: "DSP", station_id: 101, contact_no: "9988776657" },
    { name: "Constable Ravi Singh", rank: "Constable", station_id: 103, contact_no: "9988776658" },
    { name: "ACP Neha Gupta", rank: "ACP", station_id: 104, contact_no: "9988776659" },
  ];

  try {
    const { data: vData } = await supabase.from('victim').insert(victims).select();
    console.log("Inserted victims:", vData?.length);

    const { data: cData } = await supabase.from('crime').insert(crimes).select();
    console.log("Inserted crimes:", cData?.length);

    const { data: oData } = await supabase.from('officer').insert(officers).select();
    console.log("Inserted officers:", oData?.length);

    if (vData && cData) {
      // FIRs (linking some victims and crimes)
      const firs = [
          { crime_id: cData[0].crime_id, fir_date: "2024-03-16", status: "Under Investigation", station_id: 101, victim_id: vData[0].victim_id },
          { crime_id: cData[1].crime_id, fir_date: "2024-03-21", status: "Open", station_id: 101, victim_id: vData[1].victim_id },
          { crime_id: cData[2].crime_id, fir_date: "2024-03-23", status: "Closed", station_id: 102, victim_id: vData[2].victim_id },
      ];
      const { data: fData } = await supabase.from('fir').insert(firs).select();
      console.log("Inserted FIRs:", fData?.length);
    }

    // Criminals
    const criminals = [
      { name: "Rohan 'Snake' Malhotra", dob: "1990-05-12", gender: "Male", address: "Unknown", biometric_hash: "hash_001" },
      { name: "Sunil 'Hammer' Verma", dob: "1985-11-20", gender: "Male", address: "Dharavi, Mumbai", biometric_hash: "hash_002" },
    ];
    const { data: crData } = await supabase.from('criminal').insert(criminals).select();
    console.log("Inserted criminals:", crData?.length);

  } catch (err) {
    console.error("Error populating data:", err);
  }
}

populate();
