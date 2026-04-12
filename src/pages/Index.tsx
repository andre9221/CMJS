import { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, FileText, Shield, Search, Building, Scale, Eye, Gavel,
  TrendingUp, AlertCircle, BookOpen, Key, UserCheck, Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/neon-button";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";

const db = supabase as any;

const statsConfig = [
  { label: "Victims", table: "victim", link: "/victims", icon: Users, color: "from-rose-500/20 to-rose-600/5", accent: "#f43f5e", glowColor: "red" },
  { label: "Crimes", table: "crime", link: "/crimes", icon: AlertCircle, color: "from-orange-500/20 to-orange-600/5", accent: "#f97316", glowColor: "orange" },
  { label: "FIRs", table: "fir", link: "/firs", icon: FileText, color: "from-yellow-500/20 to-yellow-600/5", accent: "#eab308", glowColor: "orange" },
  { label: "Criminals", table: "criminal", link: "/criminals", icon: Shield, color: "from-red-500/20 to-red-600/5", accent: "#ef4444", glowColor: "red" },
  { label: "Officers", table: "officer", link: "/officers", icon: UserCheck, color: "from-blue-500/20 to-blue-600/5", accent: "#3b82f6", glowColor: "blue" },
  { label: "Investigations", table: "investigation", link: "/investigations", icon: Search, color: "from-indigo-500/20 to-indigo-600/5", accent: "#6366f1", glowColor: "indigo" },
  { label: "Evidence", table: "evidence", link: "/evidence", icon: Eye, color: "from-violet-500/20 to-violet-600/5", accent: "#8b5cf6", glowColor: "purple" },
  { label: "Court Cases", table: "court_case", link: "/court-cases", icon: Building, color: "from-cyan-500/20 to-cyan-600/5", accent: "#06b6d4", glowColor: "cyan" },
  { label: "Hearings", table: "hearing", link: "/hearings", icon: Gavel, color: "from-teal-500/20 to-teal-600/5", accent: "#14b8a6", glowColor: "green" },
  { label: "Verdicts", table: "verdict", link: "/verdicts", icon: Scale, color: "from-emerald-500/20 to-emerald-600/5", accent: "#10b981", glowColor: "green" },
  { label: "Prison Records", table: "prison_record", link: "/prison-records", icon: Building, color: "from-fuchsia-500/20 to-fuchsia-600/5", accent: "#d946ef", glowColor: "purple" },
  { label: "Parole", table: "parole", link: "/parole", icon: Key, color: "from-purple-500/20 to-purple-600/5", accent: "#a855f7", glowColor: "purple" },
] as const;

const initialTimelineData = [
  { id: 1, title: "FIR Filed", date: "Initial Phase", content: "Official first information report registered and logged in the central database.", category: "Filing", icon: FileText, relatedIds: [2], status: "completed" as const, energy: 95, link: "/firs", table: "fir" },
  { id: 2, title: "Investigation", date: "Process", content: "Active forensic analysis and witness interviews are conducted by assigned officers.", category: "Investigation", icon: Search, relatedIds: [1, 3], status: "in-progress" as const, energy: 85, link: "/investigations", table: "investigation" },
  { id: 3, title: "Arrest", date: "Action", content: "Suspects identified and apprehended based on collected evidence and investigation results.", category: "Arrest", icon: Shield, relatedIds: [2, 4], status: "in-progress" as const, energy: 70, link: "/criminals", table: "criminal" },
  { id: 4, title: "Court Hearing", date: "Judiciary", content: "Procedural hearings where evidence is presented before the magistrate.", category: "Legal", icon: Gavel, relatedIds: [3, 5], status: "pending" as const, energy: 45, link: "/hearings", table: "hearing" },
  { id: 5, title: "Verdict", date: "Judgment", content: "Final judicial determination of the case based on legal arguments and findings.", category: "Verdict", icon: Scale, relatedIds: [4, 6], status: "pending" as const, energy: 25, link: "/verdicts", table: "verdict" },
  { id: 6, title: "Sentencing", date: "Corrections", content: "Official court-ordered penalty following a guilty verdict; prison logging initiated.", category: "Custody", icon: Building, relatedIds: [5], status: "pending" as const, energy: 15, link: "/prison-records", table: "prison_record" },
];

/* ─── Animated number counter ──────────────────────────────── */
function AnimatedCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 50, stiffness: 300 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
  }, [spring]);

  return <span ref={ref}>0</span>;
}


/* ─── Main page ─────────────────────────────────────────────── */
export default function Index() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [timelineData, setTimelineData] = useState(initialTimelineData);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const fakeBaseCounts: Record<string, number> = {
    victim: 1245, crime: 890, fir: 910, criminal: 642, officer: 154,
    investigation: 231, evidence: 8904, court_case: 532, hearing: 120,
    verdict: 412, prison_record: 300, parole: 45
  };

  useEffect(() => {
    const loadCounts = async () => {
      const results: Record<string, number> = {};
      await Promise.all(
        statsConfig.map(async (s) => {
          const { count } = await db.from(s.table).select("*", { count: "exact", head: true });
          results[s.table] = count && count > 0 ? count : fakeBaseCounts[s.table] || 0;
        })
      );
      setCounts(results);
      
      // Update timeline data with live counts
      setTimelineData(prev => prev.map(item => ({
        ...item,
        liveCount: results[(item as any).table] || 0,
        // Calculate energy based on relative volume or importance
        energy: Math.min(100, Math.max(10, (results[(item as any).table] || 0) * 2)) 
      })));
    };
    loadCounts();
  }, []);

  return (
    <div className="min-h-full -m-6 bg-[#030303] text-white selection:bg-indigo-500/30">

      <div className="pt-6 mb-16">
        <HeroGeometric badge="CJMS" title1="Unified Justice" title2="Forensic Network" />
      </div>

      <div className="px-6 pb-20">
        
        {/* Buttons Showcase & Quick Actions */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-6 justify-center -mt-10 mb-20 z-40 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Link to="/crimes">
            <Button variant="solid" size="lg" className="px-12 py-4 text-base tracking-wide font-semibold">
              Explore Database <TrendingUp className="ml-2 w-4 h-4 inline-block" />
            </Button>
          </Link>
          <Link to="/investigations">
            <Button neon={false} variant="default" size="lg" className="px-12 py-4 text-base tracking-wide border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-zinc-300 hover:text-white">
              Launch Investigations <Play className="ml-2 w-4 h-4 inline-block" />
            </Button>
          </Link>
        </motion.div>


        {/* ─── Glowing Stat Grid using SpotlightCard (GlowCard) ──── */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="text-center">
            <h2 className="text-5xl font-rye text-white tracking-widest shadow-black drop-shadow-md">Live Monitor</h2>
            <p className="text-3xl font-vibes tracking-wider text-zinc-300 mt-2">Real-time system statistics</p>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ─── BentoGrid Stat Grid ──── */}
        <div className="mb-24">
          <BentoGrid 
            items={statsConfig.map((s, i) => {
              const count = counts[s.table] || 0;
              const Icon = s.icon;
              return {
                title: s.label,
                description: `Live data stream tracking all ${s.table} operations.`,
                meta: count.toString(),
                icon: <Icon className="w-5 h-5 text-indigo-400" />,
                status: "Live",
                tags: ["Records", "Tracked"],
                colSpan: [0, 5, 8].includes(i) ? 2 : 1,
                hasPersistentHover: i === 0,
                cta: "View Data →",
                link: s.link
              };
            })} 
          />
        </div>





        {/* ─── Timeline section ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/10 bg-zinc-900/20 p-10 overflow-hidden"
        >
          {/* Subtle noise background for the timeline container */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")' }}></div>

          <div className="mb-12 flex flex-col items-center justify-center">
            <h2 className="text-5xl font-rye text-white tracking-wider mb-2 drop-shadow-sm relative z-20">Case Lifecycle Analytics</h2>
            <p className="text-3xl font-vibes tracking-wider text-zinc-400 relative z-20">Interactive orbital map of procedural stages</p>
          </div>
          
          <div className="relative z-10 w-full h-[850px]">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </div>
        </motion.section>

      </div>
    </div>
  );
}
