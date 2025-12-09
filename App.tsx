import React, { useState } from 'react';
import AstrologyForm from './components/AstrologyForm';
import PredictionResult from './components/PredictionResult';
import LoadingSpinner from './components/LoadingSpinner';
import ChatTab from './components/ChatTab';
import VisionTab from './components/VisionTab';
import { generatePrediction, getQuickInsight } from './services/geminiService';
import { UserInput, AppState, ChartData, TabView } from './types';
import { Moon, Star, MessageCircle, Eye, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('CHART');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [prediction, setPrediction] = useState<string>('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [quickInsight, setQuickInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const handleFormSubmit = async (data: UserInput) => {
    setAppState(AppState.LOADING);
    setErrorMsg('');
    try {
      const result = await generatePrediction(data);
      setPrediction(result.markdown);
      setChartData(result.chart_data);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Something went wrong.");
      setAppState(AppState.ERROR);
    }
  };

  const handleQuickInsight = async () => {
    setIsInsightLoading(true);
    try {
      const insight = await getQuickInsight();
      setQuickInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInsightLoading(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setPrediction('');
    setChartData(null);
    setErrorMsg('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'CHAT':
        return <ChatTab />;
      case 'VISION':
        return <VisionTab />;
      case 'CHART':
      default:
        if (appState === AppState.LOADING) return <LoadingSpinner />;
        if (appState === AppState.SUCCESS && chartData) {
          return <PredictionResult markdown={prediction} chartData={chartData} onReset={resetApp} />;
        }
        if (appState === AppState.ERROR) {
          return (
            <div className="text-center max-w-md bg-red-900/20 border border-red-500/50 p-6 rounded-xl animate-in shake">
              <h3 className="text-xl font-bold text-red-400 mb-2">Cosmic Alignment Error</h3>
              <p className="text-slate-300 mb-4">{errorMsg}</p>
              <button onClick={resetApp} className="px-4 py-2 bg-red-800/50 hover:bg-red-800 text-red-100 rounded-lg">Try Again</button>
            </div>
          );
        }
        return (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
             <AstrologyForm onSubmit={handleFormSubmit} isLoading={false} />
             
             {/* Fast Response Feature */}
             <div className="w-full max-w-lg">
                <button 
                  onClick={handleQuickInsight}
                  disabled={isInsightLoading}
                  className="w-full bg-slate-900/50 hover:bg-slate-800 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between group transition-all"
                >
                  <div className="text-left">
                    <h4 className="text-amber-400 font-serif font-bold flex items-center gap-2">
                       <Zap className="w-4 h-4" />
                       Daily Cosmic Sutra
                    </h4>
                    <p className="text-xs text-slate-500">Instant wisdom via Gemini Flash Lite</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-amber-400 transition-colors">
                     {isInsightLoading ? <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /> : "Reveal"}
                  </div>
                </button>
                {quickInsight && (
                  <div className="mt-2 p-4 bg-amber-950/20 border border-amber-500/10 rounded-xl text-center animate-in slide-in-from-top-2">
                    <p className="text-amber-100 font-serif italic text-lg">"{quickInsight}"</p>
                  </div>
                )}
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#020617]">
      {/* Background Star Effect */}
      <div className="fixed inset-0 stars pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="relative z-20 w-full pt-6 pb-2 px-4 flex flex-col justify-center items-center bg-gradient-to-b from-slate-950 to-transparent">
        <div className="flex items-center space-x-3 mb-6">
          <Moon className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-100 tracking-wide">
            Kundli GPT
          </h1>
          <Star className="w-5 h-5 text-indigo-400 animate-pulse" />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center gap-2 p-1 bg-slate-900/80 rounded-full border border-indigo-500/30 backdrop-blur-md shadow-lg overflow-x-auto max-w-full">
          {[
            { id: 'CHART', label: 'Birth Chart', icon: Star },
            { id: 'CHAT', label: 'Ask Guru', icon: MessageCircle },
            { id: 'VISION', label: 'Palmistry', icon: Eye },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-start pt-6 px-4 pb-20 md:pb-8 max-w-5xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-600 text-xs">
        <p className="mb-2">&copy; {new Date().getFullYear()} Kundli GPT. Vedic Wisdom by AI.</p>
        <p className="max-w-md mx-auto opacity-60">
          Disclaimer: This application uses Artificial Intelligence. AI can make mistakes. 
          Please verify important information.
        </p>
      </footer>
    </div>
  );
};

export default App;