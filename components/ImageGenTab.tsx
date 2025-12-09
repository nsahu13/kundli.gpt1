import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Loader2, Wand2 } from 'lucide-react';
import { generateSpiritualImage } from '../services/geminiService';
import { ImageSize } from '../types';

const ImageGenTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const fullPrompt = `Vedic spiritual art, mystical, divine, high quality: ${prompt}`;
      const imgData = await generateSpiritualImage(fullPrompt, size);
      setGeneratedImage(imgData);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `kundli-art-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
      
      {/* Controls */}
      <div className="md:col-span-1 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
         <div>
           <h3 className="font-serif font-bold text-xl text-amber-200 mb-1">Cosmic Art</h3>
           <p className="text-xs text-slate-400">Generate Yantras, Deities, or Auras</p>
         </div>

         <div className="space-y-2">
           <label className="text-xs font-semibold text-indigo-300 uppercase">Describe Image</label>
           <textarea 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="e.g., A glowing golden Sri Yantra in space..."
             className="w-full h-32 bg-slate-950 border border-indigo-500/30 rounded-lg p-3 text-sm text-slate-200 focus:border-amber-400/50 focus:outline-none resize-none"
           />
         </div>

         <div className="space-y-2">
           <label className="text-xs font-semibold text-indigo-300 uppercase">Resolution</label>
           <div className="grid grid-cols-3 gap-2">
             {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
               <button
                 key={s}
                 onClick={() => setSize(s)}
                 className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                   size === s 
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                 }`}
               >
                 {s}
               </button>
             ))}
           </div>
         </div>

         <button 
           onClick={handleGenerate}
           disabled={isLoading || !prompt.trim()}
           className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
           {isLoading ? 'Dreaming...' : 'Generate'}
         </button>
      </div>

      {/* Preview */}
      <div className="md:col-span-2 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-center justify-center min-h-[400px] relative">
         {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 z-10 rounded-2xl backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
              </div>
              <p className="mt-4 text-sm text-amber-200 font-serif animate-pulse">Weaving cosmic energy...</p>
            </div>
         )}
         
         {generatedImage ? (
           <div className="relative w-full h-full flex items-center justify-center group">
             <img src={generatedImage} alt="Generated" className="max-h-[500px] w-auto max-w-full rounded-lg shadow-2xl border border-slate-800" />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button 
                  onClick={downloadImage}
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
             </div>
           </div>
         ) : (
           <div className="text-center text-slate-600 space-y-2 opacity-50">
             <ImageIcon className="w-16 h-16 mx-auto mb-2" />
             <p className="text-sm">Your vision will manifest here</p>
           </div>
         )}
      </div>

    </div>
  );
};

export default ImageGenTab;