import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, Sparkles, ScanEye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzePalmOrFace } from '../services/geminiService';

const VisionTab: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const result = await analyzePalmOrFace(image);
      setAnalysis(result || "Could not analyze the image.");
    } catch (error) {
      setAnalysis("Error analyzing the image. Please try a clearer photo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      
      {/* Upload Section */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-h-[400px]">
        {!image ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
              <ScanEye className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-serif text-amber-200">AI Palm & Face Reading</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Upload a clear photo of your palm or face for a Samudrika Shastra analysis.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col h-full">
            <div className="relative flex-grow bg-black rounded-lg overflow-hidden border border-slate-700">
              <img src={image} alt="Upload" className="w-full h-full object-contain" />
              <button 
                onClick={() => { setImage(null); setAnalysis(''); }}
                className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-full hover:bg-red-900/80"
              >
                <Upload className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading}
              className="mt-4 w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isLoading ? 'Reading Features...' : 'Analyze Destiny'}
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col h-[400px] md:h-auto overflow-hidden">
        <h3 className="font-serif font-bold text-lg text-indigo-300 mb-4 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Analysis Result
        </h3>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          {analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
               <p>Analysis will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionTab;