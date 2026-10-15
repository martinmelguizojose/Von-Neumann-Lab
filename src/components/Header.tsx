import React from 'react';
import { 
  Wrench, 
  PlayCircle, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  HelpCircleIcon
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  currentTab: 'builder' | 'simulator' | 'missions' | 'encyclopedia' | 'quiz';
  setCurrentTab: (tab: 'builder' | 'simulator' | 'missions' | 'encyclopedia' | 'quiz') => void;
  isSystemReady: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onResetAll: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isSystemReady,
  soundEnabled,
  setSoundEnabled,
  onResetAll,
  onOpenHelp
}) => {
  const handleTabClick = (tab: typeof currentTab) => {
    sounds.playClick();
    setCurrentTab(tab);
  };

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sounds.playSnap();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <span className="font-display font-bold text-white text-xl">VN</span>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-wide">
                  Von Neumann <span className="text-cyan-400">Lab</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 rounded-full uppercase">
                  ESO Edición
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aprende y experimenta la arquitectura de ordenadores
              </p>
            </div>
          </div>

          {/* Quick System Badge */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => handleTabClick('builder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'builder'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>1. Taller de Montaje</span>
          </button>

          <button
            onClick={() => handleTabClick('simulator')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'simulator'
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>2. Simulador en Vivo</span>
            {isSystemReady && currentTab !== 'simulator' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('missions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'missions'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 border border-purple-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. Misiones</span>
          </button>

          <button
            onClick={() => handleTabClick('encyclopedia')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'encyclopedia'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20 border border-amber-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>4. Fichas Didácticas</span>
          </button>

          <button
            onClick={() => handleTabClick('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-500/20 border border-teal-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>5. Test ESO</span>
          </button>
        </nav>

        {/* Global Controls */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isSystemReady
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {isSystemReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ordenador Operativo</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Montaje Incompleto</span>
              </>
            )}
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title={soundEnabled ? 'Silenciar efectos sonoros' : 'Activar efectos sonoros'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
            title="Guía rápida"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onResetAll}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
            title="Reiniciar ensamblaje y simulación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
