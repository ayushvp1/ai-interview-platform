import React from "react";
import Link from "next/link";
import { Brain } from "lucide-react";

interface NavbarProps {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
}

export default function Navbar({ onSignInClick, onGetStartedClick }: NavbarProps) {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-8 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">AI Interview</span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onSignInClick}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button 
            onClick={onGetStartedClick}
            className="bg-blue-600 text-white text-sm font-bold px-7 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}
