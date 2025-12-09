import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Stars, RefreshCcw, Grid, Download, Loader2, X, Info, Crown, Sparkles, Eye, ArrowRight, Activity, Moon, Sun } from 'lucide-react';
import SouthIndianChart from './SouthIndianChart';
import { ChartData, Planet } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PredictionResultProps {
  markdown: string;
  chartData: ChartData;
  onReset: () => void;
}

const HOUSE_SIGNIFICATIONS: Record<number, string> = {
  1: "Self, Personality, Physique, Beginnings",
  2: "Wealth, Family, Speech, Resources",
  3: "Courage, Siblings, Communication, Effort",
  4: "Mother, Home, Happiness, Comforts",
  5: "Children, Creativity, Romance, Past Karma",
  6: "Health, Enemies, Debt, Service",
  7: "Spouse, Partners, Marriage, Business",
  8: "Longevity, Transformation, Occult, Sudden Events",
  9: "Luck, Dharma, Father, Higher Learning",
  10: "Career, Status, Authority, Karma",
  11: "Gains, Income, Friends, Desires",
  12: "Losses, Spirituality, Isolation, Foreign Lands"
};

const PLANET_INFO: Record<string, { signification: string; aspects: number[] }> = {
  "Sun": { signification: "Soul, Ego, Vitality, Father, Authority", aspects: [7] },
  "Moon": { signification: "Mind, Emotions, Comfort, Mother", aspects: [7] },
  "Mars": { signification: "Energy, Courage, Action, Siblings", aspects: [4, 7, 8] },
  "Mercury": { signification: "Intellect, Communication, Business, Logic", aspects: [7] },
  "Jupiter": { signification: "Wisdom, Expansion, Wealth, Children", aspects: [5, 7, 9] },
  "Venus": { signification: "Love, Beauty, Luxury, Relationships", aspects: [7] },
  "Saturn": { signification: "Discipline, Karma, Delay, Longevity", aspects: [3, 7, 10] },
  "Rahu": { signification: "Desire, Illusion, Foreign, Innovation", aspects: [5, 7, 9] },
  "Ketu": { signification: "Detachment, Spirituality, Liberation", aspects: [5, 7, 9] }
};

const SIGN_RULERS: Record<number, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 
  5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars", 
  9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

const PLANET_DIGNITY: Record<string, { own: number[], ex: number, deb: number }> = {
  "Sun": { own: [5], ex: 1, deb: 7 },
  "Moon": { own: [4], ex: 2, deb: 8 },
  "Mars": { own: [1, 8], ex: 10, deb: 4 },
  "Mercury": { own: [3, 6], ex: 6, deb: 12 },
  "Jupiter": { own: [9, 12], ex: 4, deb: 10 },
  "Venus": { own: [2, 7], ex: 12, deb: 6 },
  "Saturn": { own: [10, 11], ex: 7, deb: 1 },
  "Rahu": { own: [], ex: 2, deb: 8 }, // Common simplified view
  "Ketu": { own: [], ex: 8, deb: 2 }
};

const getDignity = (planet: string, signId: number) => {
  const d = PLANET_DIGNITY[planet];
  if (!d) return { label: "Ordinary", color: "text-slate-400 bg-slate-800/50 border-slate-700", dotColor: "bg-slate-500" };
  
  if (d.ex === signId) return { label: "Exalted", color: "text-yellow-300 bg-yellow-900/30 border-yellow-500/30", dotColor: "bg-yellow-400" };
  if (d.deb === signId) return { label: "Debilitated", color: "text-rose-300 bg-rose-900/30 border-rose-500/30", dotColor: "bg-rose-500" };
  if (d.own.includes(signId)) return { label: "Own Sign", color: "text-emerald-300 bg-emerald-900/30 border-emerald-500/30", dotColor: "bg-emerald-400" };
  
  return { label: "Ordinary", color: "text-slate-400 bg-slate-800/50 border-slate-700", dotColor: "bg-slate-500" };
};

const PredictionResult: React.FC<PredictionResultProps> = ({ markdown, chartData, onReset }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedHouseInfo, setSelectedHouseInfo] = useState<{ signId: number; house: number; planets: Planet[] } | null>(null);

  const handleDownloadPdf = async () => {
    if (!componentRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Kundli_GPT_Reading.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getAspectedHouses = (currentHouse: number, planetName: string) => {
    const info = PLANET_INFO[planetName];
    if (!info) return [];
    return info.aspects.map(aspect => {
      let h = (currentHouse + aspect - 1) % 12;
      return h === 0 ? 12 : h;
    }).sort((a, b) => a - b);
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-5 duration-700 relative">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-indigo-500/20 backdrop-blur-sm">
         <div className="flex items-center space-x-2 text-amber-400">
            <Stars className="w-5 h-5" />
            <span className="font-serif font-bold tracking-wide uppercase hidden sm:inline">Kundli Generated</span>
         </div>
         <div className="flex space-x-3">
            <button 
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button 
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Ask Another</span>
            </button>
         </div>
      </div>

      {/* Content Area to Capture */}
      <div ref={componentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 bg-[#020617]">
        
        {/* Left Column: Chart & Planets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative z-0">
            <div className="flex items-center space-x-2 text-amber-400 mb-4 justify-center">
              <Grid className="w-5 h-5" />
              <span className="font-serif font-bold text-sm tracking-wide uppercase">Birth Chart</span>
            </div>
            
            {/* Main Cosmic Details Summary */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                 <div className="text-xs text-indigo-300 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                   <Moon className="w-3 h-3" />
                   Rashi
                 </div>
                 <div className="text-amber-100 font-bold text-sm">{chartData.rashi || 'Unknown'}</div>
              </div>
              <div className="bg-slate-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                 <div className="text-xs text-indigo-300 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                   <Sun className="w-3 h-3" />
                   Day
                 </div>
                 <div className="text-amber-100 font-bold text-sm">{chartData.day || 'Unknown'}</div>
              </div>
            </div>

            <SouthIndianChart 
              data={chartData} 
              onSignSelect={(info) => setSelectedHouseInfo(info)}
              selectedHouse={selectedHouseInfo}
            />
            
            <div className="mt-6">
               <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Planetary Positions</h4>
               <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left text-slate-300">
                   <thead className="text-indigo-300 bg-slate-950/50 uppercase">
                     <tr>
                       <th className="px-2 py-2 rounded-tl-lg">Planet</th>
                       <th className="px-2 py-2">Sign</th>
                       <th className="px-2 py-2 rounded-tr-lg">House</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                      <tr className="bg-indigo-900/20">
                        <td className="px-2 py-2 font-medium text-amber-200">Ascendant</td>
                        <td className="px-2 py-2">{chartData.ascendant.sign_name}</td>
                        <td className="px-2 py-2">1</td>
                      </tr>
                     {chartData.planets.map((p, i) => {
                       const dignity = getDignity(p.name, p.sign_id);
                       return (
                       <tr key={i} className="hover:bg-slate-800/50 cursor-pointer group" onClick={() => {
                         const house = p.house;
                         const signId = p.sign_id;
                         const planetsInHouse = chartData.planets.filter(pl => pl.house === house);
                         setSelectedHouseInfo({ signId, house, planets: planetsInHouse });
                       }}>
                         <td className="px-2 py-2 font-medium">
                           <div className="flex items-center gap-1.5">
                              <span>{p.name} {p.is_retro && '(R)'}</span>
                              {dignity.label !== "Ordinary" && (
                                <span className={`w-1.5 h-1.5 rounded-full ${dignity.dotColor}`} title={dignity.label}></span>
                              )}
                           </div>
                         </td>
                         <td className="px-2 py-2">{getZodiacName(p.sign_id)}</td>
                         <td className="px-2 py-2">{p.house}</td>
                       </tr>
                     )})}
                   </tbody>
                 </table>
               </div>
               <div className="flex justify-center gap-3 mt-3 text-[10px] text-slate-500">
                 <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Exalted</div>
                 <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Own Sign</div>
                 <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Debilitated</div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm h-fit">
          <div className="flex items-center justify-between mb-6 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Stars className="w-6 h-6" />
              <span className="font-serif font-bold text-lg tracking-wide uppercase">Divine Guidance</span>
            </div>
          </div>

          <div className="prose prose-invert prose-indigo max-w-none 
            prose-headings:font-serif prose-headings:text-amber-100 
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-amber-300 prose-strong:font-medium
            prose-li:text-slate-300
            ">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>

          <div className="mt-8 pt-6 border-t border-indigo-500/20 text-center">
            <p className="text-xs text-slate-500 italic mb-2">
              Vedic astrology is a guide, not a dictator. Your karma and free will shape your destiny.
            </p>
             <p className="text-[10px] text-slate-600">
               AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* House Info Modal */}
      {selectedHouseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedHouseInfo(null)}>
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedHouseInfo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-serif font-bold text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-900/30 text-amber-200 px-2 py-0.5 rounded text-sm font-sans tracking-wider border border-amber-500/20">
                    House {selectedHouseInfo.house}
                    </span>
                    <span>{getZodiacName(selectedHouseInfo.signId)}</span>
                </h3>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                 <div className="flex items-center gap-1.5 text-indigo-300">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wide">Ruler:</span>
                    <span className="font-semibold text-indigo-100">{SIGN_RULERS[selectedHouseInfo.signId] || 'Unknown'}</span>
                 </div>
              </div>
              
              <div className="mt-3 text-sm text-slate-300 italic bg-slate-950/50 p-2 rounded">
                "{HOUSE_SIGNIFICATIONS[selectedHouseInfo.house]}"
              </div>
            </div>

            {/* Planets Section */}
            <div className="space-y-4">
               <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Planetary Influences</h4>
                  {selectedHouseInfo.planets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedHouseInfo.planets.map((p, idx) => {
                        const info = PLANET_INFO[p.name] || { signification: "Planetary influence", aspects: [] };
                        const aspectedHouses = getAspectedHouses(selectedHouseInfo.house, p.name);
                        const dignity = getDignity(p.name, selectedHouseInfo.signId);
                        const aspectedPlanets = chartData.planets.filter(target => aspectedHouses.includes(target.house));
                        
                        return (
                        <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-100 text-lg">{p.name}</span>
                                {p.is_retro && <span className="text-[10px] font-bold text-rose-300 bg-rose-900/20 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase">Retrograde</span>}
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${dignity.color}`}>
                                {dignity.label}
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-xs">
                             {/* Signification */}
                             <div className="flex items-start gap-2 text-slate-300">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500/70 mt-0.5 shrink-0" />
                                <span>{info.signification}</span>
                             </div>
                             
                             {/* Aspects */}
                             {aspectedHouses.length > 0 && (
                                 <div className="border-t border-slate-700/50 pt-2">
                                    <div className="flex items-start gap-2 text-slate-300 mb-1">
                                        <Eye className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                        <span className="font-semibold text-indigo-200">Drishti (Aspects):</span>
                                    </div>
                                    <div className="pl-5 space-y-2">
                                        <div className="flex flex-wrap items-center gap-1">
                                            <span className="text-slate-400">Houses:</span>
                                            {aspectedHouses.map(h => (
                                                <span key={h} className="bg-slate-800 text-slate-300 px-1.5 rounded font-mono">{h}</span>
                                            ))}
                                        </div>
                                        {aspectedPlanets.length > 0 ? (
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-slate-400">Impacts Planets:</span>
                                                {aspectedPlanets.map((ap, i) => (
                                                    <span key={i} className="bg-indigo-900/40 text-indigo-200 px-1.5 rounded border border-indigo-500/20 flex items-center gap-1">
                                                        {ap.name} <span className="text-[9px] opacity-70">(H{ap.house})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-slate-500 italic">No major planets aspected directly.</div>
                                        )}
                                    </div>
                                 </div>
                             )}
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
                       <p className="text-sm text-slate-500 italic">No major planets positioned in this house.</p>
                       <p className="text-[10px] text-slate-600 mt-1">The house results are primarily driven by its sign and ruler.</p>
                    </div>
                  )}
               </div>

               <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10 flex items-start gap-2">
                     <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                     <p className="text-xs text-slate-400 leading-relaxed">
                       Clicking on other houses in the chart will reveal their details.
                     </p>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function getZodiacName(id: number) {
  const names = ["", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return names[id] || "";
}

export default PredictionResult;