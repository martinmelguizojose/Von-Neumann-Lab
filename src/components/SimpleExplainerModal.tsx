import React from 'react';
import { 
  X, 
  Lightbulb, 
  Sparkles, 
  Cpu, 
  Database, 
  Radio, 
  Calculator, 
  Sliders, 
  Boxes,
  Cable,
  MonitorSpeaker
} from 'lucide-react';
import { PuzzlePiece } from '../types/puzzle';

interface SimpleExplainerModalProps {
  piece: PuzzlePiece | null;
  onClose: () => void;
}

export const SimpleExplainerModal: React.FC<SimpleExplainerModalProps> = ({ piece, onClose }) => {
  if (!piece) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-8 h-8 text-amber-400" />;
      case 'Database': return <Database className="w-8 h-8 text-emerald-400" />;
      case 'MonitorSpeaker': return <MonitorSpeaker className="w-8 h-8 text-purple-400" />;
      case 'Cable': return <Cable className="w-8 h-8 text-cyan-400" />;
      case 'Calculator': return <Calculator className="w-8 h-8 text-green-400" />;
      case 'Sliders': return <Sliders className="w-8 h-8 text-rose-400" />;
      case 'Boxes': return <Boxes className="w-8 h-8 text-yellow-400" />;
      default: return <Sparkles className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${piece.bgLight} border ${piece.borderColor}`}>
              {renderIcon(piece.iconName)}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pieza del Puzzle
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                {piece.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short explanation for kids */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            ¿Qué hace en el ordenador?
          </span>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
            {piece.kidDescription}
          </p>
        </div>

        {/* Fun everyday analogy */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Analogía fácil:</span>
          </span>
          <div className="text-sm text-amber-100 bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl leading-relaxed">
            {piece.analogy}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]"
          >
            ¡Entendido! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
