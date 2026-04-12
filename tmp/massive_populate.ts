import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bonnwlfifwwszjsvkcia.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbm53bGZpZnd3c3pqc3ZrY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTQ0MjIsImV4cCI6MjA4ODc5MDQyMn0.nOxQ4x2Fw-3b8R6RqB24nof0NUhmYpzLkchyfFBh6CY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const firstNames = ["Rajesh", "Suresh", "Amit", "Sanjay", "Pooja", "Anjali", "Meera", "Vikram", "Kiran", "Arjun", "Deepa", "Sunil", "Anita", "Rohan", "Neha", "Rahul", "Sneha", "Varun", "Kavita", "Manish"];
const lastNames = ["Sharma", "Verma", "Gupta", "Malhotra", "Reddy", "Iyer", "Nair", "Patel", "Singh", "Das", "Choudhury", "Bose", "Mehta", "Joshi", "Kulkarni", "Deshmukh", "Pillai", "Rao", "Grover", "Kapoor"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"];
const areas = ["Sector 12", "MG Road", "Bandra West", "Anna Nagar", "Salt Lake", "Indiranagar", "Hauz Khas", "Gachibowli", "Viman Nagar", "Park Avenue"];
const crimeTypes = ["Cyber Fraud", "Theft", "Assault", "Burglary", "Vandalism", "Narcotics Trafficking", "White-collar Fraud", "Grand Theft Auto", "Money Laundering", "Homicide"];
const severityLevels = ["Low", "Medium", "High", "Critical"];
const statuses = ["Open", "Under Investigation", "In Court", "Closed"];
const investigationStatuses = ["Ongoing", "Closed"];
const evidenceTypes = ["Weapon", "CCTV", "Medical", "Digital", "Forensic", "Document", "Fingerprint"];

function getRandom(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomDate(start: Date, end: Date) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0]; }

async function massivePopulate() {
  console.log("Starting massive data population...");

  // 1. Victims (50)
  const victims = Array.from({ length: 50 }).map(() => ({
    name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    age: Math.floor(Math.random() * 60) + 18,
    gender: Math.random() > 0.5 ? "Male" : "Female",
    contact: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    address: `${getRandom(areas)}, ${getRandom(cities)}`
  }));
  const { data: insertedVictims } = await supabase.from('victim').insert(victims).select();
  console.log(`Inserted ${insertedVictims?.length || 0} Victims`);

  // 2. Officers (20)
  const ranks = ["Constable", "Sub-Inspector", "Inspector", "DSP", "ACP", "DCP", "SP"];
  const officers = Array.from({ length: 20 }).map(() => ({
    name: `Officer ${getRandom(firstNames)} ${getRandom(lastNames)}`,
    rank: getRandom(ranks),
    station_id: Math.floor(Math.random() * 5) + 101,
    contact_no: `8${Math.floor(100000000 + Math.random() * 900000000)}`
  }));
  const { data: insertedOfficers } = await supabase.from('officer').insert(officers).select();
  console.log(`Inserted ${insertedOfficers?.length || 0} Officers`);

  // 3. Crimes (40)
  const crimes = Array.from({ length: 40 }).map(() => ({
    crime_type: getRandom(crimeTypes),
    description: "Detailed forensic report of the incident including witness statements and site analysis.",
    location: `${getRandom(areas)}, ${getRandom(cities)}`,
    crime_date: getRandomDate(new Date(2023, 0, 1), new Date()),
    severity: getRandom(severityLevels)
  }));
  const { data: insertedCrimes } = await supabase.from('crime').insert(crimes).select();
  console.log(`Inserted ${insertedCrimes?.length || 0} Crimes`);

  if (!insertedVictims || !insertedCrimes || !insertedOfficers) return;

  // 4. FIRs (35)
  const firs = Array.from({ length: 35 }).map((_, i) => ({
    crime_id: insertedCrimes[i % insertedCrimes.length].crime_id,
    victim_id: insertedVictims[i % insertedVictims.length].victim_id,
    station_id: Math.floor(Math.random() * 5) + 101,
    fir_date: getRandomDate(new Date(2023, 0, 1), new Date()),
    status: getRandom(statuses)
  }));
  const { data: insertedFIRs } = await supabase.from('fir').insert(firs).select();
  console.log(`Inserted ${insertedFIRs?.length || 0} FIRs`);

  // 5. Investigations (30)
  const investigations = Array.from({ length: 30 }).map((_, i) => ({
    crime_id: insertedCrimes[i % insertedCrimes.length].crime_id,
    start_date: getRandomDate(new Date(2023, 0, 1), new Date()),
    status: getRandom(investigationStatuses)
  }));
  const { data: insertedInvestigations } = await supabase.from('investigation').insert(investigations).select();
  console.log(`Inserted ${insertedInvestigations?.length || 0} Investigations`);

  // 6. Evidence (50)
  if (insertedFIRs) {
    const evidence = Array.from({ length: 50 }).map(() => ({
      fir_id: getRandom(insertedFIRs).fir_id,
      type: getRandom(evidenceTypes),
      description: "Recovered physical evidence logged into the central repository for forensic analysis.",
      collection_date: getRandomDate(new Date(2023, 0, 1), new Date()),
      current_status: getRandom(["Collected", "In Lab", "Submitted", "Returned"])
    }));
    await supabase.from('evidence').insert(evidence);
    console.log("Inserted 50 Evidence records");
  }

  // 7. Criminals (25)
  if (insertedInvestigations) {
    const criminals = Array.from({ length: 25 }).map((_, i) => ({
      name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
      dob: getRandomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
      gender: "Male",
      address: `${getRandom(areas)}, ${getRandom(cities)}`,
      biometric_hash: `hash_${Math.random().toString(36).substring(7)}`,
      investigation_id: insertedInvestigations[i % insertedInvestigations.length].investigation_id,
      crime_id: insertedInvestigations[i % insertedInvestigations.length].crime_id
    }));
    const { data: insertedCriminals } = await supabase.from('criminal').insert(criminals).select();
    console.log(`Inserted ${insertedCriminals?.length || 0} Criminal Profile`);

    // 8. Prison Records (8)
    if (insertedCriminals) {
      const prisonRecords = Array.from({ length: 8 }).map((_, i) => ({
        criminal_id: insertedCriminals[i].criminal_id,
        prison_name: "Central Jail No. " + (i + 1),
        prison_location: getRandom(cities),
        admission_date: getRandomDate(new Date(2023, 0, 1), new Date()),
      }));
      await supabase.from('prison_record').insert(prisonRecords);
      console.log("Inserted 8 Prison Records");
    }
  }

  // 9. Court Cases (15)
  if (insertedFIRs) {
    const courtCases = Array.from({ length: 15 }).map((_, i) => ({
      fir_id: insertedFIRs[i].fir_id,
      court_name: getRandom(["District Court", "High Court", "Session Court"]),
      judge_name: `Justice ${getRandom(firstNames)} ${getRandom(lastNames)}`,
      case_status: getRandom(["Pending", "In Progress", "Closed"])
    }));
    const { data: insertedCases } = await supabase.from('court_case').insert(courtCases).select();
    console.log(`Inserted ${insertedCases?.length || 0} Court Cases`);

    // 10. Hearings (30)
    if (insertedCases) {
      const hearings = Array.from({ length: 30 }).map(() => ({
        case_id: getRandom(insertedCases).case_id,
        hearing_date: getRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
        remarks: "Arguments heard from both sides. Next date scheduled."
      }));
      await supabase.from('hearing').insert(hearings);
      console.log("Inserted 30 Hearings");
    }
  }

  console.log("Massive population complete!");
}

massivePopulate();
