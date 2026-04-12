import React, { useState } from 'react';
import { Home, Users, AlertCircle, FileText, UserCheck, Search, Building } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const dockItems: DockItem[] = [
  { id: 'home', icon: <Home size={20} />, label: 'Home', path: '/' },
  { id: 'victims', icon: <Users size={20} />, label: 'Victims', path: '/victims' },
  { id: 'crimes', icon: <AlertCircle size={20} />, label: 'Crimes', path: '/crimes' },
  { id: 'firs', icon: <FileText size={20} />, label: 'FIRs', path: '/firs' },
  { id: 'officers', icon: <UserCheck size={20} />, label: 'Officers', path: '/officers' },
  { id: 'investigations', icon: <Search size={20} />, label: 'Investigations', path: '/investigations' },
  { id: 'court', icon: <Building size={20} />, label: 'Court', path: '/court-cases' },
];

interface DockItemProps {
  item: DockItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isActive: boolean;
}

const DockItemComponent: React.FC<DockItemProps> = ({ item, isHovered, onHover, isActive }) => {
  return (
    <div
      className="relative group"
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Link to={item.path}>
        <div
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-xl
            bg-white/10 backdrop-blur-[4px]
            border border-white/20
            transition-all duration-300 ease-out
            cursor-pointer
            shadow-none
            ${isHovered 
              ? 'scale-125 bg-white/20 border-white/30 -translate-y-2 shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] z-20' 
              : isActive
                ? 'bg-indigo-500/30 border-indigo-500/50 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.3)] z-10'
                : 'hover:scale-110 hover:bg-white/15 hover:-translate-y-1 z-10'
            }
          `}
          style={{
            transitionProperty: 'box-shadow, transform, background, border-color'
          }}
        >
          <div className={`
            transition-all duration-300
            ${isActive ? 'text-indigo-300' : 'text-white'}
            ${isHovered ? 'scale-110 drop-shadow-[0_1px_5px_rgba(255,255,255,0.3)]' : ''}
          `}>
            {item.icon}
          </div>
        </div>
      </Link>
      
      {/* Tooltip */}
      <div className={`
        absolute -top-12 left-1/2 transform -translate-x-1/2
        px-3 py-1.5 rounded-md
        bg-black/80 backdrop-blur-md
        text-white text-sm font-oranienbaum tracking-widest
        border border-white/20
        transition-all duration-200
        z-50
        pointer-events-none
        whitespace-nowrap
        ${isHovered 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-95'
        }
        shadow-xl
      `}>
        {item.label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-2.5 h-2.5 bg-black/80 rotate-45 border-r border-b border-white/20 -mt-1.5"></div>
        </div>
      </div>
    </div>
  );
};

export const MinimalistDock: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className={`
        flex items-end gap-3 px-6 py-4
        rounded-3xl
        bg-black/60 backdrop-blur-2xl
        border border-white/10
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        transition-all duration-500 ease-out
        ${hoveredItem ? 'scale-[1.02]' : ''}
      `}>
        {dockItems.map((item) => (
          <DockItemComponent
            key={item.id}
            item={item}
            isHovered={hoveredItem === item.id}
            onHover={setHoveredItem}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
};

export default MinimalistDock;
