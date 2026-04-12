"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  liveCount?: number;
  link?: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        newState[parseInt(key)] = false;
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval>;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 280;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-emerald-700 border-emerald-500";
      case "in-progress":
        return "text-white bg-blue-700 border-blue-500";
      case "pending":
        return "text-white bg-zinc-700 border-zinc-500";
      default:
        return "text-white bg-zinc-700 border-zinc-500";
    }
  };

  return (
    <div
      className="w-full h-[750px] flex flex-col items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden relative"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
        >
          {/* Center hub */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center z-10 shadow-xl shadow-indigo-900/50">
            <div className="absolute rounded-full border border-white/20 animate-ping opacity-60" style={{ width: "6rem", height: "6rem" }}></div>
            <div className="absolute rounded-full border border-white/10 animate-ping opacity-40" style={{ width: "8rem", height: "8rem", animationDelay: "0.5s" }}></div>
            <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm"></div>
          </div>

          {/* Orbit ring */}
          <div className="absolute rounded-full border border-white/20" style={{ width: "560px", height: "560px" }}></div>

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Energy glow */}
                <div
                  className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse" : ""}`}
                  style={{
                    background: `radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)`,
                    width: `${item.energy * 0.4 + 36}px`,
                    height: `${item.energy * 0.4 + 36}px`,
                    left: `-${(item.energy * 0.4 + 36 - 36) / 2}px`,
                    top: `-${(item.energy * 0.4 + 36 - 36) / 2}px`,
                  }}
                ></div>

                {/* Node circle */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-md
                    ${isExpanded ? "bg-indigo-500 text-white border-2 border-indigo-300 shadow-xl shadow-indigo-900/50 scale-125"
                     : isRelated ? "bg-purple-700/60 text-white border-2 border-purple-400 animate-pulse"
                     : "bg-zinc-900 text-white border-2 border-white/30"}`}
                >
                  <Icon size={20} />
                </div>

                {/* Node label */}
                <div className={`absolute top-16 -translate-x-1/2 left-1/2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] ${isExpanded ? "text-indigo-200 scale-110" : "text-white/90"}`}>
                  {item.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-56 bg-zinc-900/95 backdrop-blur-lg border-white/20 shadow-2xl shadow-black/30 z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/30"></div>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex justify-between items-center">
                        <Badge className={`px-2 text-[10px] ${getStatusStyles(item.status)}`}>
                          {item.status === "completed" ? "DONE" : item.status === "in-progress" ? "ACTIVE" : "PENDING"}
                        </Badge>
                        <span className="text-[10px] font-mono text-white/40">{item.date}</span>
                      </div>
                      <CardTitle className="text-xs mt-1.5 text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-white/70 px-3 pb-3">
                      <p>{item.content}</p>
                      
                      {item.liveCount !== undefined && (
                        <div className="mt-2 py-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex justify-between items-center">
                          <span>Verified Records</span>
                          <span className="font-bold font-mono">{item.liveCount}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="flex items-center gap-1"><Zap size={9} />Priority</span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex items-center mb-1.5 gap-1">
                            <Link size={9} className="text-white/50" />
                            <span className="text-[10px] uppercase text-white/50 tracking-wider">Linked</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relId) => {
                              const rel = timelineData.find((i) => i.id === relId);
                              return (
                                <Button
                                  key={relId}
                                  variant="outline"
                                  size="sm"
                                  className="h-5 px-1.5 py-0 text-[10px] rounded border-white/20 bg-transparent hover:bg-white/10 text-white/70 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relId);
                                  }}
                                >
                                  {rel?.title} <ArrowRight size={8} className="ml-0.5" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {item.link && (
                        <Button 
                          onClick={() => navigate(item.link!)}
                          className="w-full mt-4 h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold gap-2"
                        >
                          Explore Full Registry <ExternalLink size={10} />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
