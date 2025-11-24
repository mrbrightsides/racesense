'use client'
import type React from 'react';
import { Github, Globe } from 'lucide-react';

export function Footer(): React.JSX.Element {
  return (
    <div className="text-center text-sm">
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#EB0A1E]" />
        <div className="px-4 py-1 bg-[#EB0A1E] rounded text-white font-black text-xs tracking-widest">
          TOYOTA GAZOO RACING
        </div>
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#EB0A1E]" />
      </div>
      <p className="text-white font-bold">
        <span className="text-[#EB0A1E]">RACESENSE</span> • BUILT FOR HACK THE TRACK
      </p>
      <p className="mt-2 text-zinc-500 text-xs tracking-wide">
        REAL-TIME RACE STRATEGY POWERED BY TELEMETRY ANALYSIS<br/>
        DATA: CIRCUIT OF THE AMERICAS • TOYOTA GR CUP SERIES
      </p>
      
      {/* Credits */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-center gap-4 text-zinc-400">
          <span className="text-xs">Built by</span>
          <a 
            href="https://github.com/mrbrightsides" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="text-xs font-mono">mrbrightsides</span>
          </a>
          <span className="text-zinc-700">•</span>
          <a 
            href="https://elpeef.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-mono">elpeef.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
