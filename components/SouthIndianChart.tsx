import React, { useMemo } from 'react';
import { ChartData, Planet } from '../types';

interface SouthIndianChartProps {
  data: ChartData;
  onSignSelect: (info: { signId: number; house: number; planets: Planet[] }) => void;
  selectedHouse?: { signId: number; house: number; planets: Planet[] } | null;
}

const SIGNS = [
  "Pisces", "Aries", "Taurus", "Gemini", 
  "Aquarius", "Cancer", 
  "Capricorn", "Leo", 
  "Sagittarius", "Scorpio", "Libra", "Virgo"
];

// Aspects for visualization
const PLANET_ASPECTS: Record<string, number[]> = {
  "Sun": [7], "Moon": [7], "Mars": [4, 7, 8], "Mercury": [7],
  "Jupiter": [5, 7, 9], "Venus": [7], "Saturn": [3, 7, 10],
  "Rahu": [5, 7, 9], "Ketu": [5, 7, 9]
};

// Mapping Sign ID (1-12) to Grid Position (row, col)
const SIGN_POSITIONS: Record<number, { r: number; c: number }> = {
  1: { r: 0, c: 1 },
  2: { r: 0, c: 2 },
  3: { r: 0, c: 3 },
  4: { r: 1, c: 3 },
  5: { r: 2, c: 3 },
  6: { r: 3, c: 3 },
  7: { r: 3, c: 2 },
  8: { r: 3, c: 1 },
  9: { r: 3, c: 0 },
  10: { r: 2, c: 0 },
  11: { r: 1, c: 0 },
  12: { r: 0, c: 0 },
};

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ data, onSignSelect, selectedHouse }) => {
  
  // Calculate House Strength (Heuristic for visualization)
  const getHouseStrength = (houseNum: number, planets: Planet[]) => {
    let strength = 20; // Base strength
    strength += planets.length * 15; // Planets add energy
    if ([1, 4, 7, 10].includes(houseNum)) strength += 25; // Kendra
    if ([1, 5, 9].includes(houseNum)) strength += 25; // Trikona
    return Math.min(strength, 100);
  };

  const getCellContent = (r: number, c: number) => {
    // Find which sign corresponds to this cell
    const signIdKey = Object.keys(SIGN_POSITIONS).find(key => {
      const pos = SIGN_POSITIONS[parseInt(key)];
      return pos.r === r && pos.c === c;
    });

    if (!signIdKey) return null;

    const id = parseInt(signIdKey);
    const planetsInSign = data.planets.filter(p => p.sign_id === id);
    const isAscendant = data.ascendant.sign_id === id;
    let house = (id - data.ascendant.sign_id + 12) % 12 + 1;
    const isSelected = selectedHouse?.signId === id;
    const strength = getHouseStrength(house, planetsInSign);

    // Determine bar color based on strength
    let barColor = "bg-slate-700";
    if (strength > 75) barColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
    else if (strength > 50) barColor = "bg-amber-500";
    else if (strength > 30) barColor = "bg-indigo-500";

    return (
      <button 
        onClick={() => onSignSelect({ signId: id, house, planets: planetsInSign })}
        className={`h-full w-full flex flex-col p-1 text-[10px] sm:text-xs text-left transition-all relative overflow-hidden group
          ${isSelected ? 'bg-indigo-900/40 ring-2 ring-inset ring-amber-400 z-10' : 'hover:bg-indigo-600/10'}
        `}
        title={`House ${house} in ${getSignName(id)} - Strength: ${strength}%`}
      >
        <div className="flex justify-between items-start opacity-50 mb-1 w-full relative z-10">
          <span className="font-serif uppercase tracking-tighter group-hover:text-amber-300 transition-colors">{getSignName(id)}</span>
          <span className="text-[9px] bg-slate-800/80 px-1 rounded-full text-slate-400 group-hover:text-white transition-colors">{house}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 content-start relative z-10">
          {isAscendant && (
            <span className="bg-red-900/80 text-red-100 px-1 rounded font-bold text-[9px] sm:text-[10px] shadow-sm">ASC</span>
          )}
          {planetsInSign.map((p, idx) => (
            <span key={idx} className={`px-1 rounded font-medium text-[9px] sm:text-[10px] shadow-sm ${p.name === 'Sun' || p.name === 'Moon' ? 'bg-amber-900/60 text-amber-100' : 'bg-indigo-900/60 text-indigo-100'}`}>
              {p.name.substring(0, 2)}{p.is_retro ? ' (R)' : ''}
            </span>
          ))}
        </div>

        {/* Strength Bar */}
        <div className="absolute bottom-1 right-1 w-1/2 h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} transition-all duration-500 ease-out`} 
            style={{ width: `${strength}%` }}
          />
        </div>
      </button>
    );
  };

  const getSignName = (id: number) => {
    const names = ["", "Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sa", "Cp", "Aq", "Pi"];
    return names[id];
  };

  // Generate SVG Aspect Lines
  const aspectLines = useMemo(() => {
    if (!selectedHouse || selectedHouse.planets.length === 0) return null;

    const startPos = SIGN_POSITIONS[selectedHouse.signId];
    // Calculate center percentage of the start cell
    // Each cell is 25% wide/high. Center is (col * 25 + 12.5)
    const x1 = startPos.c * 25 + 12.5;
    const y1 = startPos.r * 25 + 12.5;

    const lines: React.ReactNode[] = [];
    const uniqueTargets = new Set<number>();

    selectedHouse.planets.forEach(planet => {
      const aspects = PLANET_ASPECTS[planet.name] || [];
      aspects.forEach(aspectInfo => {
        // Calculate Target Sign ID
        // (CurrentSign + Aspect - 1 - 1) % 12 + 1
        const targetSignId = (selectedHouse.signId + aspectInfo - 2) % 12 + 1;
        
        // Prevent duplicates for cleaner visual if multiple planets aspect same house
        const key = `${planet.name}-${targetSignId}`;
        if(uniqueTargets.has(targetSignId)) return; 
        
        const endPos = SIGN_POSITIONS[targetSignId];
        const x2 = endPos.c * 25 + 12.5;
        const y2 = endPos.r * 25 + 12.5;

        // Curve control point (midpoint with offset to make it arc)
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        uniqueTargets.add(targetSignId);

        lines.push(
          <g key={key}>
             {/* Glow effect line */}
             <line 
              x1={`${x1}%`} y1={`${y1}%`} 
              x2={`${x2}%`} y2={`${y2}%`} 
              stroke="#fbbf24" 
              strokeWidth="4" 
              strokeOpacity="0.1"
              strokeLinecap="round"
            />
            {/* Main line */}
            <line 
              x1={`${x1}%`} y1={`${y1}%`} 
              x2={`${x2}%`} y2={`${y2}%`} 
              stroke="#fbbf24" 
              strokeWidth="1.5" 
              strokeOpacity="0.6"
              strokeDasharray="4 2"
              markerEnd="url(#arrowhead)"
            />
            {/* Target Highlight Circle */}
            <circle cx={`${x2}%`} cy={`${y2}%`} r="3" fill="#fbbf24" fillOpacity="0.3" className="animate-pulse" />
          </g>
        );
      });
    });

    return lines;
  }, [selectedHouse]);

  return (
    <div className="w-full aspect-square max-w-[350px] mx-auto bg-slate-950 border-2 border-amber-600/30 text-slate-200 relative shadow-2xl select-none">
      
      {/* SVG Overlay for Aspects */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" fillOpacity="0.6" />
          </marker>
        </defs>
        {aspectLines}
      </svg>

      {/* 4x4 Grid */}
      <div className="grid grid-cols-4 grid-rows-4 h-full w-full divide-x divide-y divide-amber-600/30 relative z-10">
        {[0, 1, 2, 3].map(row => (
          <React.Fragment key={row}>
            {[0, 1, 2, 3].map(col => {
              // Center 2x2 empty block
              if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
                return <div key={`${row}-${col}`} className="bg-slate-900/50 hidden md:block border-none pointer-events-none" />;
              }
              
              // If it's the specific center block we want to merge for title
              if (row === 1 && col === 1) {
                 return (
                    <div key="center" className="col-span-2 row-span-2 flex items-center justify-center p-4 bg-slate-900/30 pointer-events-none z-0">
                         <div className="text-center">
                            <h4 className="font-serif text-amber-500 text-lg">Lagna Chart</h4>
                            <p className="text-xs text-slate-500">South Indian Style</p>
                            <p className="text-[10px] text-indigo-400 mt-1">Select house for aspects</p>
                         </div>
                    </div>
                 )
              }
              if ((row === 1 && col === 2) || (row === 2 && col === 1) || (row === 2 && col === 2)) {
                  return null; // Already covered by col-span
              }

              return (
                <div key={`${row}-${col}`} className="relative bg-slate-900/20">
                  {getCellContent(row, col)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SouthIndianChart;