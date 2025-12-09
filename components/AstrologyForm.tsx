import React, { useState } from 'react';
import { UserInput } from '../types';
import { MapPin, Calendar, Clock, User, HelpCircle, Send } from 'lucide-react';

interface AstrologyFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const AstrologyForm: React.FC<AstrologyFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    question: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
          Enter Birth Details
        </h2>
        <p className="text-slate-400 text-sm">
          To generate an accurate Janam Kundli (Birth Chart)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Name</label>
          <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
            <input
              required
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Date of Birth</label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
              <input
                required
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Time Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Time of Birth</label>
            <div className="relative group">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
              <input
                required
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Place Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Place of Birth</label>
          <div className="relative group">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
            <input
              required
              type="text"
              name="birthPlace"
              placeholder="City, State, Country"
              value={formData.birthPlace}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>

        {/* Question Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">Your Question (Optional)</label>
          <div className="relative group">
            <HelpCircle className="absolute left-3 top-3 w-5 h-5 text-indigo-400 group-focus-within:text-amber-400 transition-colors" />
            <textarea
              name="question"
              rows={2}
              placeholder="e.g., I want to start an online business. Is this a good time?"
              value={formData.question}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-lg shadow-indigo-900/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <span>Reading the stars...</span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Reveal Destiny</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default AstrologyForm;