import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  RotateCcw, 
  Play, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SketchUpToolbarProps {
  onSetCameraView: (view: 'iso' | 'top' | 'front' | 'side') => void;
  onExplodedChange: (value: number) => void;
  onClearAll: () => void;
  onRunTest: () => void;
  isAllPlaced: boolean;
  placedCount: number;
}

export const SketchUpToolbar: React.FC<SketchUpToolbarProps> = ({
  onSetCameraView,
  onExplodedChange,
  onClearAll,
  onRunTest,
  isAllPlaced,
  placedCount
}) => {
  const [explodedVal, setExplodedVal] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'iso' | 'top' | 'front' | 'side'>('iso');

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setExplodedVal(val);
    onExplodedChange(val);
  };

  const handleView = (v: 'iso' | 'top' | 'front' | 'side') => {
    sounds.playClick();
    setActiveView(v);
    onSetCameraView(v);
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[min(940px,94vw)] z-20 transition-all duration-300">
      {/* Collapse Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1 rounded-t-xl bg-slate-900/90 hover:bg-slate-800 border-t border-x border-slate-700/80 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mostrar Barra de Herramientas 3D</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Modo Zen / Ocultar Controles</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      {!isCollapsed && (
        <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl space-y-3">
          
          {/* Top row of Dock: Camera Presets & Assembly Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Camera View Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Vistas:
              </span>
              {[
                { id: 'iso', label: '3D Isométrica' },
                { id: 'top', label: 'Planta (Top)' },
                { id: 'front', label: 'Frontal' },
                { id: 'side', label: 'Lateral' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => handleView(v.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeView === v.id
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Assembly Actions & Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                {placedCount}/7 Piezas montadas
              </span>

              {/* ONLY Desmontar button, as requested */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onClearAll();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Desmontar todas las piezas para empezar de cero"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Desmontar Todo</span>
              </button>
            </div>
          </div>

          {/* Bottom row of Dock: Exploded View Slider + Verification Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            
            {/* Exploded View Slider (Vista de despiece CAD) */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Despiece 3D (Exploded):</span>
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedVal}
                onChange={handleSlider}
                className="flex-1 accent-amber-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />

              <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
                {Math.round(explodedVal * 100)}%
              </span>
            </div>

            {/* Big 3D Test and Verify Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onRunTest();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Comprobar Funcionamiento 3D</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
