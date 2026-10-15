import React from 'react';
import { 
  X, 
  Lightbulb, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { PieceId } from '../types/puzzle';
import { PUZZLE_PIECES } from '../data/puzzlePieces';
import { sounds } from '../utils/soundEffects';

interface PieceInspectorOverlayProps {
  selectedPieceId: PieceId | null;
  isMounted: boolean;
  onToggleMount: (pieceId: PieceId) => void;
  onClose: () => void;
}

export const PieceInspectorOverlay: React.FC<PieceInspectorOverlayProps> = ({
  selectedPieceId,
  isMounted,
  onToggleMount,
  onClose
}) => {
  if (!selectedPieceId) return null;
  const piece = PUZZLE_PIECES[selectedPieceId];
  if (!piece) return null;

  return (
    <div className="absolute top-4 right-4 max-w-sm w-full z-20 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${piece.bgLight} border ${piece.borderColor}`}>
              <span className="text-xl">
                {piece.id === 'cpu' && '🧠'}
                {piece.id === 'memoria' && '🗄️'}
                {piece.id === 'io' && '🖥️'}
                {piece.id === 'buses' && '🛣️'}
                {piece.id === 'alu' && '🧮'}
                {piece.id === 'uc' && '🚦'}
                {piece.id === 'registros' && '📦'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Pieza Seleccionada
              </span>
              <h3 className="font-display font-bold text-sm text-white">
                {piece.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status in 3D scene */}
        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400">Estado actual:</span>
          <span className={`font-bold flex items-center gap-1 ${isMounted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isMounted ? <CheckCircle2 className="w-3.5 h-3.5" /> : '⚠️'}
            <span>{isMounted ? 'Montada en la placa' : 'Seleccionada (en espera)'}</span>
          </span>
        </div>

        {/* Short definition */}
        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          {piece.kidDescription}
        </p>

        {/* Everyday Analogy */}
        <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>{piece.analogy}</p>
        </div>

        {/* Action Guidance */}
        <div className="pt-1">
          {isMounted ? (
            <button
              onClick={() => {
                sounds.playSnap();
                onToggleMount(selectedPieceId);
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700"
            >
              <span>Desmontar a un lado</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Colocación libre:</strong> Arrastra la pieza o haz clic sobre la zona donde corresponda colocarla. La zona se iluminará solo cuando intentes ponerla encima.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
